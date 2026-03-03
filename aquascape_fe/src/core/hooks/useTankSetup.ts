import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { TransformControls } from "three/examples/jsm/controls/TransformControls";
import { Water } from "three/examples/jsm/objects/Water";
// @ts-ignore
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import type { TankSize, TankInfo } from "@app/core/interface";
import { FishSwimmer } from "./useFishSwimmer";
import { Fish2DSwimmer } from "./useFish2DSwimmer";

interface UseTankSetupReturn {
    containerRef: React.RefObject<HTMLDivElement | null>;
    controlsRef: React.RefObject<OrbitControls | null>;
    tankInfo: TankInfo;
    loading: boolean;
    handleApplySize: (customSize: TankSize) => void;
    handleResetView: () => void;
    addItem: (url: string) => void;
}

interface TankItem {
    id: string;
    type: 'fish' | 'decoration' | 'image';
    object: THREE.Object3D;
    isFish?: boolean;  // 🐠 Đánh dấu nếu là cá (có khả năng bơi)
}

const WATER_LEVEL = 0.9;
const GLASS_THICKNESS = 0.8;

// 🐠 Detect nếu URL là cá (dựa trên path hoặc tên file)
const isFishUrl = (url: string): boolean => {
    const lowerUrl = url.toLowerCase();
    return lowerUrl.includes('fish') || lowerUrl.includes('goldfish');
};

// ====== Draggable assets ======
// these are the hard‑coded 3D decorations that used to be added automatically;
// the UI can import and render them as drag sources just like the 2D images.
export const available3DModels: Array<{
    name: string;
    url: string;
}> = [
        { name: 'Natural Rock', url: '/models/rock.glb' },
        { name: 'Goldfish', url: '/models/goldfish.glb' },
        // add more default models here if desired
    ];


export const calculateTankInfo = (w: number, h: number, d: number): TankInfo => {
    const volumeLiters = (w * h * d * WATER_LEVEL) / 1000;
    let thickness: number;
    if (h <= 40) thickness = 6;
    else if (h <= 60) thickness = 8;
    else if (h <= 80) thickness = 10;
    else thickness = 12;

    const glassArea = 2 * (w * h + h * d + w * d) / 10000;
    const glassWeight = glassArea * thickness * 2.5;

    return {
        volume: Math.round(volumeLiters),
        thickness,
        glassWeight: glassWeight.toFixed(1)
    };
};

interface TankBounds {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
    minZ: number;
    maxZ: number;
    center: THREE.Vector3;
    innerWidth: number;
    innerHeight: number;
    innerDepth: number;
}

export const useTankSetup = (
    size: TankSize,
    setSize: (size: TankSize) => void,
    onLoadingComplete: () => void,
    fishSize: number = 15.0
): UseTankSetupReturn => {
    const containerRef = useRef<HTMLDivElement>(null);
    const controlsRef = useRef<OrbitControls | null>(null);
    const transformControlRef = useRef<TransformControls | null>(null);
    const tankRef = useRef<THREE.Group | null>(null);
    const waterRef = useRef<InstanceType<typeof Water> | null>(null);

    // Item management
    const itemsRef = useRef<TankItem[]>([]);
    const selectedItemRef = useRef<TankItem | null>(null);

    // Fish swimmer instances
    const fishSwimmerRef = useRef<FishSwimmer | null>(null);
    const fish2DSwimmersRef = useRef<Map<string, Fish2DSwimmer>>(new Map());
    const draggableObjectsRef = useRef<THREE.Object3D[]>([]);
    const pointerDownHandlerRef = useRef<((event: PointerEvent) => void) | null>(null);
    const addItemRef = useRef<((url: string) => void) | null>(null);

    const [loading, setLoading] = useState<boolean>(true);
    const tankInfo: TankInfo = calculateTankInfo(size.width, size.height, size.depth);

    // Helper function to calculate tank bounds
    const calculateTankBounds = (width: number, height: number, depth: number): TankBounds => {
        const innerWidth = width - GLASS_THICKNESS * 2;
        const innerHeight = height - GLASS_THICKNESS * 2;
        const innerDepth = depth - GLASS_THICKNESS * 2;

        return {
            minX: -innerWidth / 2,
            maxX: innerWidth / 2,
            minY: GLASS_THICKNESS,
            maxY: height * WATER_LEVEL - GLASS_THICKNESS,
            minZ: -innerDepth / 2,
            maxZ: innerDepth / 2,
            center: new THREE.Vector3(0, height * WATER_LEVEL / 2, 0),
            innerWidth,
            innerHeight,
            innerDepth
        };
    };

    // Create tank geometry and materials
    const createTank = (scene: THREE.Scene, width: number, height: number, depth: number, mainLight: THREE.DirectionalLight): { tankGroup: THREE.Group, water: InstanceType<typeof Water>, bounds: TankBounds } => {
        if (tankRef.current) scene.remove(tankRef.current);

        const group = new THREE.Group();
        const bounds = calculateTankBounds(width, height, depth);

        // Glass material
        const glassMaterial = new THREE.MeshPhysicalMaterial({
            color: 0xffffff,
            metalness: 0,
            roughness: 0,
            transmission: 1,
            thickness: GLASS_THICKNESS,
            transparent: true,
            depthWrite: false,
            side: THREE.FrontSide,
            ior: 1.52,
            envMapIntensity: 1,
        });

        // Helper to create glass panes
        const createGlassPane = (w: number, h: number, d: number, pos: THREE.Vector3, rot: THREE.Euler) => {
            const pane = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), glassMaterial);
            pane.position.copy(pos);
            pane.rotation.copy(rot);
            pane.receiveShadow = true;
            return pane;
        };

        // Create glass walls
        group.add(createGlassPane(
            bounds.innerWidth,
            bounds.innerHeight,
            GLASS_THICKNESS,
            new THREE.Vector3(0, height / 2, depth / 2 - GLASS_THICKNESS / 2),
            new THREE.Euler(0, 0, 0)
        ));

        group.add(createGlassPane(
            bounds.innerWidth,
            bounds.innerHeight,
            GLASS_THICKNESS,
            new THREE.Vector3(0, height / 2, -depth / 2 + GLASS_THICKNESS / 2),
            new THREE.Euler(0, 0, 0)
        ));

        group.add(createGlassPane(
            GLASS_THICKNESS,
            bounds.innerHeight,
            bounds.innerDepth,
            new THREE.Vector3(-width / 2 + GLASS_THICKNESS / 2, height / 2, 0),
            new THREE.Euler(0, 0, 0)
        ));

        group.add(createGlassPane(
            GLASS_THICKNESS,
            bounds.innerHeight,
            bounds.innerDepth,
            new THREE.Vector3(width / 2 - GLASS_THICKNESS / 2, height / 2, 0),
            new THREE.Euler(0, 0, 0)
        ));

        group.add(createGlassPane(
            bounds.innerWidth,
            GLASS_THICKNESS,
            bounds.innerDepth,
            new THREE.Vector3(0, GLASS_THICKNESS / 2, 0),
            new THREE.Euler(0, 0, 0)
        ));

        // Create water
        const waterGeometry = new THREE.PlaneGeometry(bounds.innerWidth, bounds.innerDepth);
        const waterNormals = new THREE.TextureLoader().load(
            "https://threejs.org/examples/textures/waternormals.jpg",
            (t) => {
                t.wrapS = t.wrapT = THREE.RepeatWrapping;
            }
        );

        const water = new Water(waterGeometry, {
            textureWidth: 512,
            textureHeight: 512,
            waterNormals,
            sunDirection: mainLight.position.clone().normalize(),
            sunColor: 0xffffff,
            waterColor: 0x001e0f,
            distortionScale: 3.7,
            size: 1.2,
            alpha: 0.5,
        });

        water.rotation.x = -Math.PI / 2;
        water.position.set(0, height * WATER_LEVEL - GLASS_THICKNESS, 0);
        water.material.depthWrite = false;
        group.add(water);

        // Create sand bottom
        const sand = new THREE.Mesh(
            new THREE.PlaneGeometry(bounds.innerWidth, bounds.innerDepth),
            new THREE.MeshStandardMaterial({
                color: 0x8b4513,
                roughness: 0.8,
                metalness: 0.1
            })
        );

        sand.name = "sandFloor";

        sand.rotation.x = -Math.PI / 2;
        sand.position.set(0, GLASS_THICKNESS + 0.1, 0);
        sand.receiveShadow = true;
        group.add(sand);

        return { tankGroup: group, water, bounds };
    };

    // Initialize fish
    const initializeFish = (
        scene: THREE.Scene,
        bounds: TankBounds,
        fishSize: number
    ) => {
        // Per user request, the tank starts empty. Fish are added via drag & drop.
        setLoading(false);
        onLoadingComplete();
    };

    // Setup camera and controls
    const setupCameraAndControls = (camera: THREE.PerspectiveCamera, controls: OrbitControls, width: number, height: number, depth: number) => {
        const tankDiagonal = Math.sqrt(width * width + height * height + depth * depth);
        camera.position.set(tankDiagonal, height * 0.8, tankDiagonal);
        controls.target.set(0, height / 3, 0);
        controls.update();
    };

    useEffect((): (() => void) => {
        const clock = new THREE.Clock();
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true,
            powerPreference: "high-performance",
        });
        const box = new THREE.Box3();

        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.0;

        if (containerRef.current) {
            containerRef.current.innerHTML = "";
            containerRef.current.appendChild(renderer.domElement);
        }

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = false;
        controlsRef.current = controls;

        controls.addEventListener('change', () => {
            const imageItems = itemsRef.current.filter(i => i.type === 'image');
            imageItems.forEach(item => {
                item.object.rotation.y = Math.atan2(
                    (camera.position.x - item.object.position.x),
                    (camera.position.z - item.object.position.z)
                );
            });
        });

        const transformControl = new TransformControls(camera, renderer.domElement);
        transformControlRef.current = transformControl;

        transformControl.setMode('translate');

        // TransformControls helper is what gets added to scene, not the control itself
        const helper = (transformControl as any).getHelper();
        scene.add(helper);

        helper.traverse((child: any) => {
            if (child.material) {
                child.material.depthTest = false;
            }
        });

        transformControl.addEventListener('dragging-changed', (event) => {
            controls.enabled = !event.value;
        });

        transformControl.addEventListener('mouseUp', () => {
            if (selectedItemRef.current?.type === 'fish' && fishSwimmerRef.current) {
                fishSwimmerRef.current.setPaused(false);
            }
        });

        const onKeyDown = (event: KeyboardEvent) => {
            if (!transformControlRef.current) return;
            switch (event.key.toLowerCase()) {
                case 'g':
                    transformControlRef.current.setMode('translate');
                    break;
                case 's':
                    transformControlRef.current.setMode('scale');
                    break;
                case 'r':
                    transformControlRef.current.setMode('rotate');
                    break;
                case 'delete':
                case 'backspace':
                    if (!selectedItemRef.current) return;

                    scene.remove(selectedItemRef.current.object);

                    const fish2D = fish2DSwimmersRef.current.get(selectedItemRef.current.id);
                    if (fish2D) {
                        fish2D.dispose();
                        fish2DSwimmersRef.current.delete(selectedItemRef.current.id);
                    }

                    // If the deleted item is the main 3D fish, clear the ref
                    if (fishSwimmerRef.current && selectedItemRef.current.object.uuid === fishSwimmerRef.current.fishGroup.uuid) {
                        fishSwimmerRef.current.dispose();
                        fishSwimmerRef.current = null;
                    }

                    itemsRef.current = itemsRef.current.filter(
                        i => i.id !== selectedItemRef.current?.id
                    );

                    draggableObjectsRef.current = itemsRef.current.map(i => i.object);

                    if (fishSwimmerRef.current) {
                        fishSwimmerRef.current.setObstacles(draggableObjectsRef.current);
                    }

                    transformControl.detach();
                    selectedItemRef.current = null;
                    break;
            }
        };

        window.addEventListener('keydown', onKeyDown);

        scene.add(new THREE.AmbientLight(0x4040a0, 0.6));

        const mainLight = new THREE.DirectionalLight(0xffffff, 1.5);
        mainLight.position.set(20, 50, 10);
        mainLight.castShadow = true;
        mainLight.shadow.mapSize.width = 1024;
        mainLight.shadow.mapSize.height = 1024;
        scene.add(mainLight);

        const { tankGroup, water, bounds } = createTank(scene, size.width, size.height, size.depth, mainLight);
        tankRef.current = tankGroup;
        waterRef.current = water;
        scene.add(tankGroup);

        // primary addItem helper with extension detection and optional drop position
        const addItemToTank = (item: any, pos?: THREE.Vector3) => {
            let url: string | undefined;

            if (typeof item === 'string') {
                url = item;
            } else if (item?.url) { // prioritize .url for 3D models
                url = item.url;
            } else if (item?.image) {
                url = item.image;
            }

            if (!url || !url.trim()) {
                console.warn('❌ No valid URL found in dropped item:', item);
                return;
            }

            const extension = url.split('/').pop()?.split('.').pop()?.toLowerCase() || '';

            // ================= 3D MODEL =================
            if (extension === 'glb' || extension === 'gltf') {
                const loader = new GLTFLoader();

                loader.load(url, (gltf: any) => {
                    const model = gltf.scene;

                    model.traverse((child: any) => {
                        if (child.isMesh) {
                            child.geometry.computeBoundingBox();
                        }
                    });

                    const box = new THREE.Box3().setFromObject(model);
                    const sizeBox = new THREE.Vector3();
                    box.getSize(sizeBox);

                    const scaleFactor = size.width / sizeBox.x / 3;
                    model.scale.multiplyScalar(scaleFactor);

                    const newBox = new THREE.Box3().setFromObject(model);
                    const newSize = new THREE.Vector3();
                    newBox.getSize(newSize);

                    if (pos) {
                        model.position.x = THREE.MathUtils.clamp(
                            pos.x,
                            bounds.minX + newSize.x / 2,
                            bounds.maxX - newSize.x / 2
                        );
                        model.position.z = THREE.MathUtils.clamp(
                            pos.z,
                            bounds.minZ + newSize.z / 2,
                            bounds.maxZ - newSize.z / 2
                        );
                    } else {
                        model.position.set(0, 0, 0);
                    }

                    model.position.y = GLASS_THICKNESS + newSize.y / 2;

                    scene.add(model);

                    const newItem: TankItem = {
                        id: crypto.randomUUID(),
                        type: 'decoration',
                        object: model,
                        isFish: isFishUrl(url)
                    };
                    itemsRef.current.push(newItem);
                    draggableObjectsRef.current.push(model);

                    if (fishSwimmerRef.current) {
                        fishSwimmerRef.current.setObstacles(draggableObjectsRef.current);
                    }

                    if (newItem.isFish) {
                        // The first 3D fish gets the full 3D swimming logic
                        if (!fishSwimmerRef.current) {
                            const fish3D = new FishSwimmer(model, bounds, fishSize, draggableObjectsRef.current);
                            fishSwimmerRef.current = fish3D;
                        } else {
                            // Subsequent fish get the 2D plane swimming logic
                            const fish2D = new Fish2DSwimmer(model, bounds);
                            fish2DSwimmersRef.current.set(newItem.id, fish2D);
                        }
                    }
                });

            } else if (['png', 'jpg', 'jpeg', 'webp'].includes(extension)) {
                const loader = new THREE.TextureLoader();

                loader.load(
                    url,
                    (texture) => {
                        const material = new THREE.MeshBasicMaterial({
                            map: texture,
                            transparent: true,
                            side: THREE.DoubleSide,
                        });

                        const scaleFactor = size.width / 300;
                        const planeWidth = 30 * scaleFactor;
                        const planeHeight = 25 * scaleFactor;

                        const mesh = new THREE.Mesh(
                            new THREE.PlaneGeometry(planeWidth, planeHeight),
                            material
                        );
                        mesh.userData.is2DImage = true;
                        mesh.userData.planeWidth = planeWidth;
                        mesh.userData.planeHeight = planeHeight;

                        let initialX = pos?.x || 0;
                        let initialZ = pos?.z || 0;
                        initialX = THREE.MathUtils.clamp(
                            initialX,
                            bounds.minX + planeWidth / 2,
                            bounds.maxX - planeWidth / 2
                        );
                        initialZ = THREE.MathUtils.clamp(
                            initialZ,
                            bounds.minZ,
                            bounds.maxZ
                        );

                        mesh.position.set(
                            initialX,
                            GLASS_THICKNESS + planeHeight / 2 + 1,
                            initialZ
                        );

                        scene.add(mesh);

                        const newItem: TankItem = {
                            id: crypto.randomUUID(),
                            type: 'image',
                            object: mesh,
                            isFish: isFishUrl(url)
                        };
                        itemsRef.current.push(newItem);
                        draggableObjectsRef.current.push(mesh);

                        if (fishSwimmerRef.current) {
                            fishSwimmerRef.current.setObstacles(draggableObjectsRef.current);
                        }

                        if (newItem.isFish) {
                            const fish2D = new Fish2DSwimmer(mesh, bounds);
                            fish2DSwimmersRef.current.set(newItem.id, fish2D);
                        }
                    },
                    undefined,
                    (error) => {
                        console.error('❌ Texture load failed:', url, error);
                    }
                );
            } else {
                console.warn("Unsupported file type:", url);
            }
        };

        addItemRef.current = addItemToTank;

        initializeFish(scene, bounds, fishSize);
        setupCameraAndControls(camera, controls, size.width, size.height, size.depth);

        transformControl.addEventListener('objectChange', () => {
            const obj = transformControl.object;
            if (!obj) return;

            const selectedItem = selectedItemRef.current;
            if (!selectedItem) return;

            // Clamp scale limits for everything
            const maxScale = 40;
            obj.scale.x = THREE.MathUtils.clamp(obj.scale.x, 0.3, maxScale);
            obj.scale.y = THREE.MathUtils.clamp(obj.scale.y, 0.3, maxScale);
            obj.scale.z = THREE.MathUtils.clamp(obj.scale.z, 0.3, maxScale);

            // 🖼️ Image-specific handling
            if (selectedItem.type === 'image' && obj.userData.is2DImage) {
                // maintain aspect ratio
                obj.scale.y = obj.scale.x;

                // calculate plane dimensions in world units from userData
                const mesh = obj as THREE.Mesh;
                const planeWidth = mesh.userData.planeWidth * obj.scale.x;
                const planeHeight = mesh.userData.planeHeight * obj.scale.y;

                obj.position.x = THREE.MathUtils.clamp(
                    obj.position.x,
                    bounds.minX + planeWidth / 2,
                    bounds.maxX - planeWidth / 2
                );

                obj.position.y = THREE.MathUtils.clamp(
                    obj.position.y,
                    GLASS_THICKNESS + planeHeight / 2,
                    bounds.maxY - planeHeight / 2
                );

                // no 3D depth clamping – plane should just stay between front/back walls
                obj.position.z = THREE.MathUtils.clamp(
                    obj.position.z,
                    bounds.minZ,
                    bounds.maxZ
                );

                return;
            }

            // 🪨 3D object normal handling
            box.setFromObject(obj);

            if (box.min.x < bounds.minX) obj.position.x += bounds.minX - box.min.x;
            if (box.max.x > bounds.maxX) obj.position.x -= box.max.x - bounds.maxX;

            if (box.min.y < GLASS_THICKNESS) obj.position.y += GLASS_THICKNESS - box.min.y;
            if (box.max.y > bounds.maxY) obj.position.y -= box.max.y - bounds.maxY;

            if (box.min.z < bounds.minZ) obj.position.z += bounds.minZ - box.min.z;
            if (box.max.z > bounds.maxZ) obj.position.z -= box.max.z - bounds.maxZ;
        });

        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();

        // drag & drop support
        const handleDragOver = (e: DragEvent) => {
            e.preventDefault();
        };

        const handleDrop = (e: DragEvent) => {
            e.preventDefault();
            if (!containerRef.current) return;

            const rect = containerRef.current.getBoundingClientRect();

            mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

            raycaster.setFromCamera(mouse, camera);

            const sand = tankRef.current?.getObjectByName("sandFloor");
            if (!sand) return;

            const intersects = raycaster.intersectObject(sand);
            if (!intersects.length) return;

            const point = intersects[0].point;

            const data = e.dataTransfer?.getData("item");
            if (!data) return;

            const item = JSON.parse(data);
            addItemToTank(item, point);
        };

        const onPointerDown = (event: PointerEvent) => {
            mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
            raycaster.setFromCamera(mouse, camera);

            const intersects = raycaster.intersectObjects(
                draggableObjectsRef.current,
                true
            );

            if (intersects.length > 0) {
                let clickedObject: THREE.Object3D | null = intersects[0].object;
                console.log("Attached:", clickedObject);
                // 🔎 Tìm root object đã add vào itemsRef
                while (
                    clickedObject &&
                    !itemsRef.current.some(i => i.object === clickedObject)
                ) {
                    clickedObject = clickedObject.parent;
                }

                if (!clickedObject) return;

                const foundItem = itemsRef.current.find(
                    i => i.object === clickedObject
                );
                if (foundItem) {
                    selectedItemRef.current = foundItem;

                    controls.enabled = false;

                    transformControl.attach(clickedObject);
                    transformControl.setMode("translate");
                }

                if (!foundItem) return;

                selectedItemRef.current = foundItem;

                transformControl.attach(clickedObject);
                transformControl.setMode("translate");

                if (foundItem.isFish) {
                    if (foundItem.type === "fish" && fishSwimmerRef.current) {
                        fishSwimmerRef.current.setPaused(true);
                    }
                    const fish2D = fish2DSwimmersRef.current.get(foundItem.id);
                    if (fish2D) fish2D.setPaused(true);
                }
            } else {
                if (!transformControl.dragging) {
                    if (selectedItemRef.current?.isFish) {
                        if (selectedItemRef.current.type === 'fish' && fishSwimmerRef.current) {
                            fishSwimmerRef.current.setPaused(false);
                        }
                        const fish2D = fish2DSwimmersRef.current.get(selectedItemRef.current.id);
                        if (fish2D) {
                            fish2D.setPaused(false);
                        }
                    }

                    transformControl.detach();
                    selectedItemRef.current = null;
                }
            }
        };

        const onPointerUp = () => {
            controls.enabled = true;
            if (selectedItemRef.current?.isFish) {
                if (selectedItemRef.current.type === 'fish' && fishSwimmerRef.current) {
                    fishSwimmerRef.current.setPaused(false);
                }
                const fish2D = fish2DSwimmersRef.current.get(selectedItemRef.current.id);
                if (fish2D) {
                    fish2D.setPaused(false);
                }
            }
        };

        let lastPointerMove = 0;
        const onPointerMove = (event: PointerEvent) => {
            const now = clock.getElapsedTime();
            if (now - lastPointerMove < 1 / 60) {
                return;
            }
            lastPointerMove = now;

            mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

            raycaster.setFromCamera(mouse, camera);
            const intersects = raycaster.intersectObjects(
                draggableObjectsRef.current,
                true
            );

            if (containerRef.current) {
                if (intersects.length > 0) {
                    containerRef.current.style.cursor = 'pointer';
                } else {
                    containerRef.current.style.cursor = 'auto';
                }
            }
        };

        renderer.domElement.addEventListener('pointerdown', onPointerDown);

        pointerDownHandlerRef.current = onPointerDown;
        window.addEventListener('pointermove', onPointerMove);

        if (containerRef.current) {
            containerRef.current.addEventListener('dragover', handleDragOver);
            containerRef.current.addEventListener('drop', handleDrop);
        }

        const animate = (): void => {
            requestAnimationFrame(animate);
            const delta = clock.getDelta();
            const elapsed = clock.getElapsedTime();

            if (waterRef.current) {
                waterRef.current.material.uniforms.time.value += delta * 0.5;
            }

            // Update swimmers only if they are not paused
            if (fishSwimmerRef.current && !fishSwimmerRef.current.isPaused()) {
                fishSwimmerRef.current.update(delta, elapsed);
            }

            fish2DSwimmersRef.current.forEach((swimmer) => {
                if (!swimmer.isPaused()) {
                    swimmer.update(delta, elapsed);
                }
            });

            controls.update();
            renderer.render(scene, camera);
        };
        animate();

        const onResize = (): void => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        };
        window.addEventListener("resize", onResize);

        return (): void => {
            window.removeEventListener("resize", onResize);
            window.removeEventListener('pointermove', onPointerMove);
            window.removeEventListener('keydown', onKeyDown);
            renderer.domElement.removeEventListener('pointerup', onPointerUp);
            if (pointerDownHandlerRef.current) {
                renderer.domElement.removeEventListener('pointerdown', pointerDownHandlerRef.current);
            }
            if (containerRef.current) {
                containerRef.current.removeEventListener('dragover', handleDragOver);
                containerRef.current.removeEventListener('drop', handleDrop);
            }
            transformControl.dispose();
            renderer.dispose();

            if (fishSwimmerRef.current) {
                fishSwimmerRef.current.dispose();
                fishSwimmerRef.current = null;
            }
        };
    }, [size, onLoadingComplete, fishSize]);

    useEffect(() => {
        return () => {
            fish2DSwimmersRef.current.forEach((swimmer) => {
                swimmer.dispose();
            });
            fish2DSwimmersRef.current.clear();
        };
    }, []);

    const handleApplySize = (customSize: TankSize): void => {
        const clampedWidth = THREE.MathUtils.clamp(customSize.width, 20, 200);
        const clampedHeight = THREE.MathUtils.clamp(customSize.height, 20, 100);
        const clampedDepth = THREE.MathUtils.clamp(customSize.depth, 20, 100);
        setSize({ width: clampedWidth, height: clampedHeight, depth: clampedDepth });
    };

    const handleResetView = (): void => {
        if (!controlsRef.current) return;
        controlsRef.current.reset();
    };

    return { containerRef, controlsRef, tankInfo, loading, handleApplySize, handleResetView, addItem: (url: string) => addItemRef.current?.(url) };
};