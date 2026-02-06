import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { Water } from "three/examples/jsm/objects/Water";
import type { TankSize, TankInfo } from "@app/core/interface";



interface UseTankSetupReturn {
    containerRef: React.RefObject<HTMLDivElement | null>;
    controlsRef: React.RefObject<OrbitControls | null>;
    tankInfo: TankInfo;
    loading: boolean;
    handleApplySize: (customSize: TankSize) => void;
    handleResetView: () => void;
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

export const useTankSetup = (
    size: TankSize,
    setSize: (size: TankSize) => void,
    onLoadingComplete: () => void
): UseTankSetupReturn => {
    const containerRef = useRef<HTMLDivElement>(null);
    const controlsRef = useRef<OrbitControls | null>(null);
    const tankRef = useRef<THREE.Group | null>(null);
    const waterRef = useRef<InstanceType<typeof Water> | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    const tankInfo: TankInfo = calculateTankInfo(size.width, size.height, size.depth);

    /* ================= THREE INIT ================= */
    useEffect((): (() => void) => {
        const scene = new THREE.Scene();

        const camera = new THREE.PerspectiveCamera(
            45,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        camera.position.set(15, 10, 15);

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
        renderer.toneMappingExposure = 1.1;

        if (containerRef.current) {
            containerRef.current.innerHTML = "";
            containerRef.current.appendChild(renderer.domElement);
        }

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.zoomSpeed = 1.0;
        controls.minDistance = 1;
        controls.maxDistance = 300;
        controls.rotateSpeed = 0.2;
        controls.panSpeed = 0.5;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (controls as any).touches = {
            ONE: THREE.TOUCH.ROTATE,
            TWO: THREE.TOUCH.DOLLY_PAN
        };

        controls.enableZoom = true;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (controls as any).mouseButtons = {
            LEFT: THREE.MOUSE.ROTATE,
            MIDDLE: THREE.MOUSE.DOLLY,
            RIGHT: THREE.MOUSE.PAN
        };

        controlsRef.current = controls;

        scene.add(new THREE.AmbientLight(0x4040a0, 0.3));

        const mainLight = new THREE.DirectionalLight(0xffffff, 1.2);
        mainLight.position.set(20, 30, 10);
        mainLight.castShadow = true;
        mainLight.shadow.mapSize.width = 1024;
        mainLight.shadow.mapSize.height = 1024;
        mainLight.shadow.camera.near = 0.5;
        mainLight.shadow.camera.far = 100;
        mainLight.shadow.camera.left = -30;
        mainLight.shadow.camera.right = 30;
        mainLight.shadow.camera.top = 30;
        mainLight.shadow.camera.bottom = -30;
        scene.add(mainLight);

        /* ========== CREATE TANK ========== */
        const createTank = (width: number, height: number, depth: number): void => {
            if (tankRef.current) scene.remove(tankRef.current);

            const group = new THREE.Group();

            const innerWidth = width - GLASS_THICKNESS * 2;
            const innerHeight = height - GLASS_THICKNESS * 2;
            const innerDepth = depth - GLASS_THICKNESS * 2;

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

            const createGlassPane = (w: number, h: number, d: number,
                pos: THREE.Vector3, rot: THREE.Euler): THREE.Mesh => {
                const geometry = new THREE.BoxGeometry(w, h, d);
                const pane = new THREE.Mesh(geometry, glassMaterial);
                pane.position.copy(pos);
                pane.rotation.copy(rot);
                pane.castShadow = true;
                pane.receiveShadow = true;
                return pane;
            };

            // Mặt trước
            group.add(createGlassPane(
                innerWidth, innerHeight, GLASS_THICKNESS,
                new THREE.Vector3(0, height / 2, depth / 2 - GLASS_THICKNESS / 2),
                new THREE.Euler(0, 0, 0)
            ));

            // Mặt sau
            group.add(createGlassPane(
                innerWidth, innerHeight, GLASS_THICKNESS,
                new THREE.Vector3(0, height / 2, -depth / 2 + GLASS_THICKNESS / 2),
                new THREE.Euler(0, 0, 0)
            ));

            // Mặt trái
            group.add(createGlassPane(
                GLASS_THICKNESS, innerHeight, innerDepth,
                new THREE.Vector3(-width / 2 + GLASS_THICKNESS / 2, height / 2, 0),
                new THREE.Euler(0, 0, 0)
            ));

            // Mặt phải
            group.add(createGlassPane(
                GLASS_THICKNESS, innerHeight, innerDepth,
                new THREE.Vector3(width / 2 - GLASS_THICKNESS / 2, height / 2, 0),
                new THREE.Euler(0, 0, 0)
            ));

            // Mặt dưới
            group.add(createGlassPane(
                innerWidth, GLASS_THICKNESS, innerDepth,
                new THREE.Vector3(0, GLASS_THICKNESS / 2, 0),
                new THREE.Euler(0, 0, 0)
            ));

            /* Water */
            const waterGeometry = new THREE.PlaneGeometry(innerWidth, innerDepth);
            const waterNormals = new THREE.TextureLoader().load(
                "https://threejs.org/examples/textures/waternormals.jpg"
            );
            waterNormals.wrapS = THREE.RepeatWrapping;
            waterNormals.wrapT = THREE.RepeatWrapping;

            const water = new Water(
                waterGeometry,
                {
                    textureWidth: 512,
                    textureHeight: 512,
                    waterNormals,
                    sunDirection: mainLight.position.clone().normalize(),
                    sunColor: 0xffffff,
                    waterColor: 0x001e0f,
                    distortionScale: 3,
                    size: 1.2,
                    alpha: 0.9,
                }
            );
            water.rotation.x = -Math.PI / 2;
            const waterHeight = height * WATER_LEVEL - GLASS_THICKNESS;
            water.position.set(0, waterHeight, 0);
            waterRef.current = water;
            group.add(water);

            // Khối nước
            const waterDepthGeometry = new THREE.BoxGeometry(
                innerWidth - 0.1,
                waterHeight - GLASS_THICKNESS,
                innerDepth - 0.1
            );
            const waterDepthMaterial = new THREE.MeshPhysicalMaterial({
                color: 0x1a5276,
                transmission: 0.95,
                transparent: true,
                opacity: 0.15,
                roughness: 0,
                metalness: 0,
                side: THREE.DoubleSide,
                ior: 1.33,
                thickness: 1.5
            });
            const waterDepth = new THREE.Mesh(waterDepthGeometry, waterDepthMaterial);
            waterDepth.position.set(0, waterHeight / 2, 0);
            group.add(waterDepth);

            /* Sand */
            const sand = new THREE.Mesh(
                new THREE.PlaneGeometry(innerWidth, innerDepth),
                new THREE.MeshStandardMaterial({
                    color: 0x8b4513,
                    roughness: 0.8,
                    metalness: 0.1
                })
            );
            sand.rotation.x = -Math.PI / 2;
            sand.position.set(0, GLASS_THICKNESS + 0.01, 0);
            sand.receiveShadow = true;
            group.add(sand);

            scene.add(group);
            tankRef.current = group;

            // Tự động đặt camera
            const tankDiagonal = Math.sqrt(width * width + height * height + depth * depth);
            const optimalDistance = tankDiagonal * 0.8;
            const camDistance = THREE.MathUtils.clamp(optimalDistance, 20, 100);

            camera.position.set(camDistance, height * 0.6, camDistance);
            controls.target.set(0, height / 3, 0);
            controls.update();

            // Ẩn loading
            setTimeout(() => {
                setLoading(false);
                onLoadingComplete();
            }, 500);
        };

        createTank(size.width, size.height, size.depth);

        const clock = new THREE.Clock();
        const animate = (): void => {
            requestAnimationFrame(animate);
            if (waterRef.current) {
                waterRef.current.material.uniforms.time.value += clock.getDelta() * 0.5;
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
            renderer.dispose();
        };
    }, [size, onLoadingComplete]);

    /* ================= XỬ LÝ ÁP DỤNG KÍCH THƯỚC ================= */
    const handleApplySize = (customSize: TankSize): void => {
        const clampedWidth = THREE.MathUtils.clamp(customSize.width, 20, 200);
        const clampedHeight = THREE.MathUtils.clamp(customSize.height, 20, 100);
        const clampedDepth = THREE.MathUtils.clamp(customSize.depth, 20, 100);

        setSize({
            width: clampedWidth,
            height: clampedHeight,
            depth: clampedDepth
        });
    };

    /* ================= XỬ LÝ RESET VIEW ================= */
    const handleResetView = (): void => {
        if (!controlsRef.current) return;

        const targetPosition = new THREE.Vector3(
            size.width * 0.8,
            size.height * 0.6,
            size.depth * 0.8
        );
        const targetLookAt = new THREE.Vector3(0, size.height / 3, 0);

        controlsRef.current.target.copy(targetLookAt);
        controlsRef.current.object.position.copy(targetPosition);
        controlsRef.current.update();
    };

    return {
        containerRef,
        controlsRef,
        tankInfo,
        loading,
        handleApplySize,
        handleResetView
    };
};
