import { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { TransformControls } from "three/examples/jsm/controls/TransformControls";
import { Water } from "three/examples/jsm/objects/Water";
// @ts-ignore
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
// @ts-ignore
import { clone as cloneSkinnedObject } from "three/examples/jsm/utils/SkeletonUtils";
import type { TankSize, TankInfo, TankItemTransform, TankLayoutItem } from "@app/core/interface";
import { calculateTankInfo } from "@app/core/utils/calculateTankInfo";
import { FishSwimmer } from "./useFishSwimmer";
import { Fish2DSwimmer } from "./useFish2DSwimmer";
import {
    GLASS_THICKNESS,
    isFishUrl,
} from "./useTankSetup.constants";
import {
    applySceneLightingMode,
    clampObjectWithinBounds,
    createTank,
    setupCameraAndControls,
    setupSceneLighting,
} from "./useTankSetup.scene";
import type {
    AddedTankItemEvent,
    TankAnalysisSnapshot,
    TankLightingMode,
    TankBounds,
    TankItem,
    TankItemSourceMetadata,
    UseTankSetupReturn,
} from "./useTankSetup.types";

export { calculateTankInfo } from "@app/core/utils/calculateTankInfo";

export const useTankSetup = (
    size: TankSize,
    setSize: (size: TankSize) => void,
    onLoadingComplete: () => void,
    lightingMode: TankLightingMode = "day",
    fishSize: number = 3.0,
    onItemAdded?: (item: AddedTankItemEvent) => void,
    onLayoutUpdated?: (snapshot: TankAnalysisSnapshot) => void
): UseTankSetupReturn => {
    const containerRef = useRef<HTMLDivElement>(null);
    const controlsRef = useRef<OrbitControls | null>(null);
    const transformControlRef = useRef<TransformControls | null>(null);
    const tankRef = useRef<THREE.Group | null>(null);
    const waterRef = useRef<InstanceType<typeof Water> | null>(null);
    const sceneRef = useRef<THREE.Scene | null>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const lightingRigRef = useRef<ReturnType<typeof setupSceneLighting> | null>(null);
    const boundsRef = useRef<TankBounds | null>(null);

    // Item management
    const itemsRef = useRef<TankItem[]>([]);
    const selectedItemRef = useRef<TankItem | null>(null);
    const feedPelletsRef = useRef<THREE.Mesh[]>([]);
    const feedTimeoutRef = useRef<number | null>(null);

    // Fish swimmer instances
    const fishSwimmerRef = useRef<FishSwimmer | null>(null);
    const fish2DSwimmersRef = useRef<Map<string, Fish2DSwimmer>>(new Map());
    const draggableObjectsRef = useRef<THREE.Object3D[]>([]);
    const obstacleObjectsRef = useRef<THREE.Object3D[]>([]);
    const modelTemplateCacheRef = useRef<Map<string, THREE.Object3D>>(new Map());
    const pointerDownHandlerRef = useRef<((event: PointerEvent) => void) | null>(null);
    const addItemRef = useRef<((item: unknown, pos?: THREE.Vector3, transform?: TankItemTransform) => void) | null>(null);

    const [loading, setLoading] = useState<boolean>(true);
    const tankInfo: TankInfo = calculateTankInfo(size.width, size.height, size.depth);

    const roundValue = (value: number): number => Number(value.toFixed(4));

    const toRelativeAxis = (value: number, min: number, max: number): number => {
        if (max <= min) return 0.5;
        return roundValue(THREE.MathUtils.clamp((value - min) / (max - min), 0, 1));
    };

    const toHorizontalZone = (ratio: number): "left" | "center" | "right" => {
        if (ratio <= 0.33) return "left";
        if (ratio >= 0.67) return "right";
        return "center";
    };

    const toVerticalZone = (ratio: number): "bottom" | "middle" | "top" => {
        if (ratio <= 0.33) return "bottom";
        if (ratio >= 0.67) return "top";
        return "middle";
    };

    const toDepthZone = (ratio: number): "front" | "middle" | "back" => {
        if (ratio <= 0.33) return "front";
        if (ratio >= 0.67) return "back";
        return "middle";
    };

    const getAnalysisSnapshot = useCallback((): TankAnalysisSnapshot => {
        const bounds = boundsRef.current;
        const items = itemsRef.current.map((item) => {
            const box = new THREE.Box3().setFromObject(item.object);
            const boxSize = new THREE.Vector3();
            box.getSize(boxSize);

            const normalizedPosition = bounds
                ? {
                    x: toRelativeAxis(item.object.position.x, bounds.minX, bounds.maxX),
                    y: toRelativeAxis(item.object.position.y, bounds.minY, bounds.maxY),
                    z: toRelativeAxis(item.object.position.z, bounds.minZ, bounds.maxZ),
                }
                : { x: 0.5, y: 0.5, z: 0.5 };

            return {
                instanceId: item.id,
                catalogItemId: item.catalogItemId,
                userAssetId: item.userAssetId,
                name: String(item.sourceName ?? item.catalogItemId ?? item.userAssetId ?? "Unknown"),
                category: item.category,
                sourceType: item.sourceType,
                type: item.type,
                isFish: Boolean(item.isFish),
                position: {
                    x: roundValue(item.object.position.x),
                    y: roundValue(item.object.position.y),
                    z: roundValue(item.object.position.z),
                },
                rotation: {
                    x: roundValue(item.object.rotation.x),
                    y: roundValue(item.object.rotation.y),
                    z: roundValue(item.object.rotation.z),
                },
                scale: {
                    x: roundValue(item.object.scale.x),
                    y: roundValue(item.object.scale.y),
                    z: roundValue(item.object.scale.z),
                },
                size: {
                    x: roundValue(boxSize.x),
                    y: roundValue(boxSize.y),
                    z: roundValue(boxSize.z),
                },
                normalizedPosition,
                zone: {
                    horizontal: toHorizontalZone(normalizedPosition.x),
                    vertical: toVerticalZone(normalizedPosition.y),
                    depth: toDepthZone(normalizedPosition.z),
                },
            };
        });

        return {
            tank: {
                size,
                volumeLiters: tankInfo.volume,
                glassThicknessMm: tankInfo.thickness,
            },
            items,
        };
    }, [size, tankInfo.thickness, tankInfo.volume]);

    const emitLayoutUpdated = useCallback(() => {
        onLayoutUpdated?.(getAnalysisSnapshot());
    }, [getAnalysisSnapshot, onLayoutUpdated]);

    const initializeFish = () => {
        setLoading(false);
        onLoadingComplete();
    };

    const clearFeedPellets = useCallback(() => {
        if (feedTimeoutRef.current !== null) {
            window.clearTimeout(feedTimeoutRef.current);
            feedTimeoutRef.current = null;
        }
        if (feedPelletsRef.current.length === 0 || !sceneRef.current) return;
        feedPelletsRef.current.forEach((pellet) => {
            sceneRef.current?.remove(pellet);
            pellet.geometry.dispose();
            if (Array.isArray(pellet.material)) {
                pellet.material.forEach((material) => material.dispose());
            } else {
                pellet.material.dispose();
            }
        });
        feedPelletsRef.current = [];
    }, []);

    const finishFishFeeding = useCallback(() => {
        clearFeedPellets();

        if (fishSwimmerRef.current) {
            fishSwimmerRef.current.clearFoodTarget();
            fishSwimmerRef.current.setSpeedMultiplier(1);
        }

        fish2DSwimmersRef.current.forEach((swimmer) => {
            swimmer.clearFoodTarget();
            swimmer.setSpeedMultiplier(1);
        });
    }, [clearFeedPellets]);

    const refreshSwimmerObstacles = () => {
        obstacleObjectsRef.current = itemsRef.current
            .filter((entry) => !entry.isFish)
            .map((entry) => entry.object);

        if (fishSwimmerRef.current) {
            fishSwimmerRef.current.setObstacles(obstacleObjectsRef.current);
        }
        fish2DSwimmersRef.current.forEach((swimmer) => {
            swimmer.setObstacles(obstacleObjectsRef.current);
        });
    };

    const clearItems = useCallback(() => {
        if (!sceneRef.current) return;
        
        itemsRef.current.forEach(item => {
            sceneRef.current?.remove(item.object);
            
            const fish2D = fish2DSwimmersRef.current.get(item.id);
            if (fish2D) {
                fish2D.dispose();
                fish2DSwimmersRef.current.delete(item.id);
            }
        });

        if (fishSwimmerRef.current) {
            fishSwimmerRef.current.dispose();
            fishSwimmerRef.current = null;
        }

        itemsRef.current = [];
        draggableObjectsRef.current = [];
        obstacleObjectsRef.current = [];
        selectedItemRef.current = null;
        
        if (transformControlRef.current) {
            transformControlRef.current.detach();
        }

        emitLayoutUpdated();
    }, [emitLayoutUpdated]);

    const setFishPausedForItem = (item: TankItem | null, paused: boolean) => {
        if (!item?.isFish) return;

        if (item.type === "fish" && fishSwimmerRef.current) {
            fishSwimmerRef.current.setPaused(paused);
        }
        const fish2D = fish2DSwimmersRef.current.get(item.id);
        if (fish2D) {
            fish2D.setPaused(paused);
        }
    };

    const registerTankItem = (
        itemObject: THREE.Object3D,
        itemType: TankItem["type"],
        isFishItem: boolean,
        metadata: TankItemSourceMetadata,
        bounds: TankBounds,
        prefer3DSwimmerForFish: boolean
    ): TankItem => {
        const newItem: TankItem = {
            id: crypto.randomUUID(),
            type: itemType,
            catalogItemId: metadata.catalogItemId,
            userAssetId: metadata.userAssetId,
            sourceType: metadata.sourceType,
            category: metadata.sourceCategory,
            sourceName: metadata.sourceName,
            object: itemObject,
            isFish: isFishItem,
            allowSurfacePlacement: metadata.allowSurfacePlacement
        };

        itemsRef.current.push(newItem);
        draggableObjectsRef.current = itemsRef.current.map((entry) => entry.object);
        refreshSwimmerObstacles();

        if (newItem.isFish) {
            if (prefer3DSwimmerForFish && !fishSwimmerRef.current) {
                fishSwimmerRef.current = new FishSwimmer(itemObject, bounds, fishSize, obstacleObjectsRef.current);
            } else {
                fish2DSwimmersRef.current.set(
                    newItem.id,
                    new Fish2DSwimmer(itemObject, bounds, obstacleObjectsRef.current)
                );
            }
        }

        onItemAdded?.({
            id: newItem.id,
            type: newItem.type,
            sourceType: newItem.sourceType,
            category: newItem.category,
            sourceName: newItem.sourceName,
            isFish: Boolean(newItem.isFish)
        });

        emitLayoutUpdated();

        return newItem;
    };

    const resolveItemSourceMetadata = (item: any, url: string): TankItemSourceMetadata => {
        const sourceType = typeof item?.type === "string" ? item.type : undefined;
        const sourceCategory = typeof item?.category === "string" ? item.category : undefined;
        const isUserAsset = sourceCategory === "My Assets";

        return {
            catalogItemId: !isUserAsset ? String(item?.id || url) : undefined,
            userAssetId: isUserAsset ? Number(item?.id) : undefined,
            sourceType,
            sourceCategory,
            sourceName: typeof item?.name === "string" ? item.name : undefined,
            allowSurfacePlacement:
                !isFishUrl(url) &&
                String(sourceType ?? "").toLowerCase() !== "fish"
        };
    };

    useEffect((): (() => void) => {
        const clock = new THREE.Clock();
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x111122);
        sceneRef.current = scene;

        const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: false,
            powerPreference: "high-performance",
            stencil: true,
            depth: true,
        });

        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.5;
        rendererRef.current = renderer;

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

                    if (fishSwimmerRef.current && selectedItemRef.current.object.uuid === fishSwimmerRef.current.fishGroup.uuid) {
                        fishSwimmerRef.current.dispose();
                        fishSwimmerRef.current = null;
                    }

                    itemsRef.current = itemsRef.current.filter(
                        i => i.id !== selectedItemRef.current?.id
                    );

                    draggableObjectsRef.current = itemsRef.current.map(i => i.object);
                    refreshSwimmerObstacles();
                    emitLayoutUpdated();

                    transformControl.detach();
                    selectedItemRef.current = null;
                    break;
            }
        };

        window.addEventListener('keydown', onKeyDown);

        const lightingRig = setupSceneLighting(scene);
        lightingRigRef.current = lightingRig;

        if (tankRef.current) {
            scene.remove(tankRef.current);
        }
        const { tankGroup, water, bounds } = createTank(size.width, size.height, size.depth);
        boundsRef.current = bounds;
        tankRef.current = tankGroup;
        waterRef.current = water;
        scene.add(tankGroup);
        applySceneLightingMode(lightingMode, scene, renderer, lightingRig, water);

        itemsRef.current = [];
        draggableObjectsRef.current = [];
        obstacleObjectsRef.current = [];
        selectedItemRef.current = null;
        emitLayoutUpdated();
        fish2DSwimmersRef.current.forEach((swimmer) => swimmer.dispose());
        fish2DSwimmersRef.current.clear();
        if (fishSwimmerRef.current) {
            fishSwimmerRef.current.dispose();
            fishSwimmerRef.current = null;
        }

        const gltfLoader = new GLTFLoader();

        const applySavedTransform = (obj: THREE.Object3D, transform?: TankItemTransform) => {
            if (!transform) return;
            obj.position.set(transform.position.x, transform.position.y, transform.position.z);
            obj.rotation.set(transform.rotation.x, transform.rotation.y, transform.rotation.z);
            obj.scale.set(transform.scale.x, transform.scale.y, transform.scale.z);
        };

        const addItemToTank = (item: any, pos?: THREE.Vector3, transform?: TankItemTransform) => {
            let url: string | undefined;

            if (typeof item === 'string') {
                url = item;
            } else if (item?.url) {
                url = item.url;
            } else if (item?.image) {
                url = item.image;
            }

            if (!url || !url.trim()) {
                console.warn('❌ No valid URL found in dropped item:', item);
                return;
            }

            const extension = url.split('/').pop()?.split('.').pop()?.toLowerCase() || '';
            const metadata = resolveItemSourceMetadata(item, url);
            const sourceTypeLower = String(item?.type || "").toLowerCase();
            const shouldTreatAsFish = sourceTypeLower === "fish" || isFishUrl(url);
            const buildModelInstance = (template: THREE.Object3D) => {
                const model = cloneSkinnedObject(template);

                const box = new THREE.Box3().setFromObject(model);
                const sizeBox = new THREE.Vector3();
                box.getSize(sizeBox);

                const isFishModel = shouldTreatAsFish;
                const dominantSize = Math.max(sizeBox.x, sizeBox.y, sizeBox.z, 0.0010);

                const targetSpan = bounds.innerWidth * (isFishModel ? 0.20 : 0.35);
                const scaleFactor = THREE.MathUtils.clamp(targetSpan / dominantSize, 0.01, 100);
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
                    const minY = GLASS_THICKNESS + newSize.y / 2;
                    const maxY = metadata.allowSurfacePlacement
                        ? bounds.maxY + newSize.y * 0.9
                        : bounds.maxY - newSize.y / 2;
                    model.position.y = THREE.MathUtils.clamp(pos.y, minY, maxY);
                } else {
                    model.position.set(0, 0, 0);
                    model.position.y = metadata.allowSurfacePlacement
                        ? bounds.maxY + newSize.y / 2
                        : GLASS_THICKNESS + newSize.y / 2;
                }

                applySavedTransform(model, transform);
                scene.add(model);

                registerTankItem(
                    model,
                    shouldTreatAsFish ? 'fish' : 'decoration',
                    shouldTreatAsFish,
                    metadata,
                    bounds,
                    true
                );
            };

            if (extension === 'glb' || extension === 'gltf') {
                const cachedTemplate = modelTemplateCacheRef.current.get(url);
                if (cachedTemplate) {
                    buildModelInstance(cachedTemplate);
                    return;
                }

                gltfLoader.load(url, (gltf: any) => {
                    const template = gltf.scene as THREE.Object3D;
                    const isFishModel = shouldTreatAsFish;

                    template.traverse((child: any) => {
                        if (child.isMesh) {
                            child.castShadow = true;
                            child.receiveShadow = true;

                            if (isFishModel) {
                                child.rotation.y = Math.PI;

                                if (child.material) {
                                    if (Array.isArray(child.material)) {
                                        child.material.forEach((mat: any) => {
                                            mat.roughness = 0.3;
                                            mat.metalness = 0.1;
                                            mat.envMapIntensity = 1.2;
                                            mat.emissive = new THREE.Color(0x000000);
                                            mat.emissiveIntensity = 0;
                                            mat.needsUpdate = true;
                                        });
                                    } else {
                                        const mat = child.material as THREE.MeshStandardMaterial;
                                        mat.roughness = 0.3;
                                        mat.metalness = 0.1;
                                        mat.envMapIntensity = 1.2;
                                        mat.emissive = new THREE.Color(0x000000);
                                        mat.emissiveIntensity = 0;
                                        mat.needsUpdate = true;
                                    }
                                }
                            }
                        }
                    });
                    modelTemplateCacheRef.current.set(url, template);
                    buildModelInstance(template);
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

                        const minY = GLASS_THICKNESS + planeHeight / 2;
                        const maxY = metadata.allowSurfacePlacement
                            ? bounds.maxY + planeHeight * 0.9
                            : bounds.maxY - planeHeight / 2;
                        const initialY = THREE.MathUtils.clamp(
                            pos?.y ?? (GLASS_THICKNESS + planeHeight / 2 + 1),
                            minY,
                            maxY
                        );

                        mesh.position.set(initialX, initialY, initialZ);
                        applySavedTransform(mesh, transform);

                        scene.add(mesh);

                        registerTankItem(
                            mesh,
                            shouldTreatAsFish ? 'fish' : 'image',
                            shouldTreatAsFish,
                            metadata,
                            bounds,
                            false
                        );
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

        initializeFish();
        setupCameraAndControls(camera, controls, size.width, size.height, size.depth);
        
        transformControl.addEventListener('objectChange', () => {
            const obj = transformControl.object;
            if (!obj) return;

            const selectedItem = selectedItemRef.current;
            if (!selectedItem) return;

            clampObjectWithinBounds(obj, selectedItem, bounds);
            emitLayoutUpdated();
        });

        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();

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
            const dropTargets: THREE.Object3D[] = [];
            if (waterRef.current) {
                dropTargets.push(waterRef.current as unknown as THREE.Object3D);
            }
            if (sand) {
                dropTargets.push(sand);
            }
            if (dropTargets.length === 0) return;

            const intersects = raycaster.intersectObjects(dropTargets, false);
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
                if (!foundItem) return;

                selectedItemRef.current = foundItem;
                controls.enabled = false;

                transformControl.attach(clickedObject);

                setFishPausedForItem(foundItem, true);
            } else {
                if (!transformControl.dragging) {
                    setFishPausedForItem(selectedItemRef.current, false);

                    transformControl.detach();
                    selectedItemRef.current = null;
                    controls.enabled = true;
                }
            }
        };

        const onPointerUp = () => {
            controls.enabled = true;
            setFishPausedForItem(selectedItemRef.current, false);
        };

        const onPointerCancel = () => {
            controls.enabled = true;
            setFishPausedForItem(selectedItemRef.current, false);
        };

        let lastPointerMove = 0;
        let isPointerInsideCanvas = false;
        const onPointerMove = (event: PointerEvent) => {
            if (!isPointerInsideCanvas) return;
            const now = clock.getElapsedTime();
            if (now - lastPointerMove < 1 / 12) {
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

        const onPointerEnterCanvas = () => {
            isPointerInsideCanvas = true;
        };

        const onPointerLeaveCanvas = () => {
            isPointerInsideCanvas = false;
            if (containerRef.current) {
                containerRef.current.style.cursor = 'auto';
            }
        };

        renderer.domElement.addEventListener('pointerdown', onPointerDown);
        renderer.domElement.addEventListener('pointerup', onPointerUp);
        renderer.domElement.addEventListener('pointerup', onPointerUp);
        renderer.domElement.addEventListener('pointercancel', onPointerCancel);
        renderer.domElement.addEventListener('pointerenter', onPointerEnterCanvas);
        renderer.domElement.addEventListener('pointerleave', onPointerLeaveCanvas);

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
            const speedMultiplier = feedPelletsRef.current.length > 0 ? 3 : 1;

            if (waterRef.current) {
                waterRef.current.material.uniforms.time.value += delta * 0.3;
            }

            // Update swimmers only if they are not paused
            if (fishSwimmerRef.current) {
                fishSwimmerRef.current.setSpeedMultiplier(speedMultiplier);
            }
            if (fishSwimmerRef.current && !fishSwimmerRef.current.isPaused()) {
                fishSwimmerRef.current.update(delta, elapsed);
            }

            fish2DSwimmersRef.current.forEach((swimmer) => {
                swimmer.setSpeedMultiplier(speedMultiplier);
                if (!swimmer.isPaused()) {
                    swimmer.update(delta, elapsed);
                }
            });

            if (feedPelletsRef.current.length > 0) {
                const fishPositions = itemsRef.current
                    .filter((item) => item.isFish)
                    .map((item) => item.object.position);

                feedPelletsRef.current = feedPelletsRef.current.filter((pellet, index) => {
                    const pelletState = String(pellet.userData.state ?? "falling");
                    const surfaceY = typeof pellet.userData.surfaceY === "number"
                        ? pellet.userData.surfaceY
                        : bounds.maxY - 0.2;

                    if (pelletState === "falling") {
                        pellet.position.y -= (pellet.userData.fallSpeed as number) * delta;
                        if (pellet.position.y <= surfaceY) {
                            pellet.position.y = surfaceY;
                            pellet.userData.state = "floating";
                            pellet.userData.floatUntil = elapsed + 0.35;
                        }
                    } else if (pelletState === "floating") {
                        const floatOffset = Math.sin(elapsed * 7 + index) * 0.05;
                        pellet.position.y = surfaceY + floatOffset;
                        pellet.position.x += (pellet.userData.driftX as number) * delta;
                        pellet.position.z += (pellet.userData.driftZ as number) * delta;

                        if (elapsed >= (pellet.userData.floatUntil as number)) {
                            pellet.userData.state = "sinking";
                        }
                    } else {
                        pellet.position.y -= (pellet.userData.sinkSpeed as number) * delta;
                    }

                    const material = pellet.material as THREE.MeshStandardMaterial;
                    material.emissiveIntensity = THREE.MathUtils.clamp(
                        0.65 + Math.sin(elapsed * 8 + index) * 0.35,
                        0.25,
                        1.1
                    );

                    const eaten = fishPositions.some((fishPosition) => (
                        fishPosition.distanceTo(pellet.position) < 2.4
                    ));

                    if (!eaten) {
                        return true;
                    }

                    scene.remove(pellet);
                    pellet.geometry.dispose();
                    material.dispose();
                    return false;
                });

                if (feedPelletsRef.current.length === 0) {
                    finishFishFeeding();
                }
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
            renderer.domElement.removeEventListener('pointerup', onPointerUp);
            renderer.domElement.removeEventListener('pointercancel', onPointerCancel);
            renderer.domElement.removeEventListener('pointerenter', onPointerEnterCanvas);
            renderer.domElement.removeEventListener('pointerleave', onPointerLeaveCanvas);
            if (pointerDownHandlerRef.current) {
                renderer.domElement.removeEventListener('pointerdown', pointerDownHandlerRef.current);
            }
            if (containerRef.current) {
                containerRef.current.removeEventListener('dragover', handleDragOver);
                containerRef.current.removeEventListener('drop', handleDrop);
            }
            clearFeedPellets();
            transformControl.dispose();
            renderer.dispose();
            sceneRef.current = null;
            rendererRef.current = null;
            lightingRigRef.current = null;

            if (fishSwimmerRef.current) {
                fishSwimmerRef.current.dispose();
                fishSwimmerRef.current = null;
            }
            fish2DSwimmersRef.current.forEach((swimmer) => swimmer.dispose());
            fish2DSwimmersRef.current.clear();
            itemsRef.current = [];
            draggableObjectsRef.current = [];
            obstacleObjectsRef.current = [];
            selectedItemRef.current = null;
            addItemRef.current = null;
        };
    }, [size, onLoadingComplete, fishSize, onItemAdded, clearFeedPellets, emitLayoutUpdated]);

    useEffect(() => {
        if (!sceneRef.current || !rendererRef.current || !lightingRigRef.current) return;
        applySceneLightingMode(
            lightingMode,
            sceneRef.current,
            rendererRef.current,
            lightingRigRef.current,
            waterRef.current
        );
    }, [lightingMode]);

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
    const triggerFishRush = useCallback((): void => {
        if (!boundsRef.current || !sceneRef.current) return;

        clearFeedPellets();

        const foodPosition = new THREE.Vector3(
            0,
            boundsRef.current.maxY - 5,
            0
        );

        const pelletCount = 9;
        for (let index = 0; index < pelletCount; index += 1) {
            const pelletGeometry = new THREE.SphereGeometry(0.24, 10, 10);
            const pelletMaterial = new THREE.MeshStandardMaterial({
                color: 0xf0c36a,
                emissive: new THREE.Color(0xffe7a8),
                emissiveIntensity: 0.7,
                roughness: 0.45,
                metalness: 0.05,
            });
            const pelletMesh = new THREE.Mesh(pelletGeometry, pelletMaterial);

            pelletMesh.position.set(
                foodPosition.x + THREE.MathUtils.randFloatSpread(6),
                boundsRef.current.maxY + THREE.MathUtils.randFloat(2.5, 5),
                foodPosition.z + THREE.MathUtils.randFloatSpread(6)
            );
            pelletMesh.userData.state = "falling";
            pelletMesh.userData.surfaceY = boundsRef.current.maxY - THREE.MathUtils.randFloat(0.1, 0.35);
            pelletMesh.userData.fallSpeed = THREE.MathUtils.randFloat(5.5, 7);
            pelletMesh.userData.sinkSpeed = THREE.MathUtils.randFloat(0.7, 1.1);
            pelletMesh.userData.driftX = THREE.MathUtils.randFloatSpread(0.12);
            pelletMesh.userData.driftZ = THREE.MathUtils.randFloatSpread(0.12);
            pelletMesh.renderOrder = 999;

            sceneRef.current.add(pelletMesh);
            feedPelletsRef.current.push(pelletMesh);
        }

        if (fishSwimmerRef.current) {
            fishSwimmerRef.current.setFoodTarget(foodPosition);
            fishSwimmerRef.current.setSpeedMultiplier(3);
        }

        fish2DSwimmersRef.current.forEach((swimmer) => {
            swimmer.setFoodTarget(foodPosition);
            swimmer.setSpeedMultiplier(3);
        });

        feedTimeoutRef.current = window.setTimeout(() => {
            finishFishFeeding();
        }, 1000);

    }, [clearFeedPellets, finishFishFeeding]);
    const getLayoutSnapshot = (): TankLayoutItem[] => {
        return itemsRef.current.map((item) => ({
            instanceId: item.id,
            catalogItemId: item.catalogItemId,
            userAssetId: item.userAssetId,
            transform: {
                position: {
                    x: Number(item.object.position.x.toFixed(4)),
                    y: Number(item.object.position.y.toFixed(4)),
                    z: Number(item.object.position.z.toFixed(4)),
                },
                rotation: {
                    x: Number(item.object.rotation.x.toFixed(4)),
                    y: Number(item.object.rotation.y.toFixed(4)),
                    z: Number(item.object.rotation.z.toFixed(4)),
                },
                scale: {
                    x: Number(item.object.scale.x.toFixed(4)),
                    y: Number(item.object.scale.y.toFixed(4)),
                    z: Number(item.object.scale.z.toFixed(4)),
                },
            },
        }));
    };

    return {
        containerRef,
        controlsRef,
        tankInfo,
        loading,
        handleApplySize,
        handleResetView,
        addItem: (item: unknown, position, transform) =>
            addItemRef.current?.(
                item,
                position
                    ? new THREE.Vector3(position.x, position.y, position.z)
                    : undefined,
                transform
            ),
        clearItems,
        triggerFishRush,
        getLayoutSnapshot,
        getAnalysisSnapshot
    };
};
