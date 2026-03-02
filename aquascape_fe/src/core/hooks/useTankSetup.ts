import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { TransformControls } from "three/examples/jsm/controls/TransformControls";
import { Water } from "three/examples/jsm/objects/Water";
// @ts-ignore
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import type { TankSize, TankInfo } from "@app/core/interface";
import { FishSwimmer } from "./useFishSwimmer";

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
    type: 'fish' | 'decoration';
    object: THREE.Object3D;
}

const WATER_LEVEL = 0.9;
const GLASS_THICKNESS = 0.8;

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

    // Fish swimmer instance
    const fishSwimmerRef = useRef<FishSwimmer | null>(null);
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
            minX: -innerWidth / 2 + 5,
            maxX: innerWidth / 2 - 5,
            minY: GLASS_THICKNESS,
            maxY: height * WATER_LEVEL - GLASS_THICKNESS - 5,
            minZ: -innerDepth / 2 + 5,
            maxZ: innerDepth / 2 - 5,
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
            alpha: 0.9,
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
        const loader = new GLTFLoader();

        loader.load('/models/goldfish.glb', (gltf: any) => {
            const fishModel = gltf.scene;

            fishModel.traverse((child: any) => {
                if (child.isMesh) {
                    child.frustumCulled = false;
                }
            });

            fishSwimmerRef.current = new FishSwimmer(
                fishModel,
                bounds,
                fishSize
            );

            scene.add(fishSwimmerRef.current.getFishGroup());

            const fishObject = fishSwimmerRef.current.getFishGroup();

            itemsRef.current.push({
                id: 'fish-1',
                type: 'fish',
                object: fishObject
            });

            draggableObjectsRef.current = itemsRef.current.map(i => i.object);

            setLoading(false);
            onLoadingComplete();

            // 🎯 Thêm rock mặc định sau khi cá load xong
            addItemRef.current?.('/models/rock.glb');

        }, undefined, (err: any) => {
            console.error("Failed to load fish model:", err);
        });
    };

    // Setup camera and controls
    const setupCameraAndControls = (camera: THREE.PerspectiveCamera, controls: OrbitControls, width: number, height: number, depth: number) => {
        const tankDiagonal = Math.sqrt(width * width + height * height + depth * depth);
        camera.position.set(tankDiagonal, height * 0.8, tankDiagonal);
        controls.target.set(0, height / 3, 0);
        controls.update();
    };

    useEffect((): (() => void) => {
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true,
            powerPreference: "high-performance",
        });

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

        const transformControl = new TransformControls(camera, renderer.domElement);
        transformControlRef.current = transformControl;

        transformControl.setMode('translate');

        scene.add(transformControl);

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

                    itemsRef.current = itemsRef.current.filter(
                        i => i.id !== selectedItemRef.current?.id
                    );

                    draggableObjectsRef.current = itemsRef.current.map(i => i.object);

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

        const addItemToTank = (url: string) => {
            const loader = new GLTFLoader();

            loader.load(url, (gltf: any) => {
                const model = gltf.scene;

                model.traverse((child: any) => {
                    if (child.isMesh) {
                        child.geometry.computeBoundingBox();
                    }
                });

                const box = new THREE.Box3().setFromObject(model);
                const center = new THREE.Vector3();
                box.getCenter(center);

                model.position.sub(center);
                const sizeBox = new THREE.Vector3();
                box.getSize(sizeBox);

                const scaleX = bounds.innerWidth / sizeBox.x;
                const scaleY = bounds.innerHeight / sizeBox.y;
                const scaleZ = bounds.innerDepth / sizeBox.z;

                const maxScale = Math.min(scaleX, scaleY, scaleZ) * 0.6;
                model.scale.multiplyScalar(maxScale);

                const newBox = new THREE.Box3().setFromObject(model);
                const newSize = new THREE.Vector3();
                newBox.getSize(newSize);

                model.position.y = GLASS_THICKNESS + newSize.y / 2;

                scene.add(model);

                const newItem: TankItem = {
                    id: crypto.randomUUID(),
                    type: 'decoration',
                    object: model
                };

                itemsRef.current.push(newItem);

                draggableObjectsRef.current = itemsRef.current.map(i => i.object);
            });
        };

        addItemRef.current = addItemToTank;

        initializeFish(scene, bounds, fishSize);
        setupCameraAndControls(camera, controls, size.width, size.height, size.depth);

        transformControl.addEventListener('objectChange', () => {
            const obj = transformControl.object;
            if (!obj) return;

            // Clamp scale trước
            const maxScale = 70;
            obj.scale.x = THREE.MathUtils.clamp(obj.scale.x, 0.3, maxScale);
            obj.scale.y = THREE.MathUtils.clamp(obj.scale.y, 0.3, maxScale);
            obj.scale.z = THREE.MathUtils.clamp(obj.scale.z, 0.3, maxScale);

            // Tính bounding box thật
            const box = new THREE.Box3().setFromObject(obj);
            const sizeBox = new THREE.Vector3();
            box.getSize(sizeBox);

            obj.position.x = THREE.MathUtils.clamp(
                obj.position.x,
                bounds.minX + sizeBox.x / 2,
                bounds.maxX - sizeBox.x / 2
            );

            obj.position.y = THREE.MathUtils.clamp(
                obj.position.y,
                GLASS_THICKNESS + sizeBox.y / 2,
                bounds.maxY - sizeBox.y / 2
            );

            obj.position.z = THREE.MathUtils.clamp(
                obj.position.z,
                bounds.minZ + sizeBox.z / 2,
                bounds.maxZ - sizeBox.z / 2
            );
        });

        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();

        const onPointerDown = (event: PointerEvent) => {
            mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

            raycaster.setFromCamera(mouse, camera);

            const intersects = raycaster.intersectObjects(
                draggableObjectsRef.current,
                true
            );

            if (intersects.length > 0) {
                let root = intersects[0].object;

                while (root.parent && !draggableObjectsRef.current.includes(root)) {
                    root = root.parent;
                }

                const foundItem = itemsRef.current.find(i => i.object === root);
                if (!foundItem) return;

                selectedItemRef.current = foundItem;

                transformControl.attach(root);

                if (foundItem.type === 'fish' && fishSwimmerRef.current) {
                    fishSwimmerRef.current.setPaused(true);
                }
            } else {
                if (!transformControl.dragging) {
                    if (selectedItemRef.current?.type === 'fish' && fishSwimmerRef.current) {
                        fishSwimmerRef.current.setPaused(false);
                    }
                    transformControl.detach();
                    selectedItemRef.current = null;
                }
            }
        };

        const onPointerMove = (event: PointerEvent) => {
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

        const clock = new THREE.Clock();
        const animate = (): void => {
            requestAnimationFrame(animate);
            const delta = clock.getDelta();
            const elapsed = clock.getElapsedTime();

            if (waterRef.current) {
                waterRef.current.material.uniforms.time.value += delta * 0.5;
            }
            if (fishSwimmerRef.current) {
                fishSwimmerRef.current.update(delta, elapsed);
            }

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
            if (pointerDownHandlerRef.current) {
                renderer.domElement.removeEventListener('pointerdown', pointerDownHandlerRef.current);
            }
            transformControl.dispose();
            renderer.dispose();

            if (fishSwimmerRef.current) {
                fishSwimmerRef.current.dispose();
                fishSwimmerRef.current = null;
            }
        };
    }, [size, onLoadingComplete, fishSize]);

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