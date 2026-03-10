import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { Water } from "three/examples/jsm/objects/Water";
import { GLASS_THICKNESS, WATER_LEVEL } from "./useTankSetup.constants";
import type { TankBounds, TankItem, TankLightingMode } from "./useTankSetup.types";

export interface SceneLightingRig {
    ambientLight: THREE.AmbientLight;
    mainLight: THREE.DirectionalLight;
    fillLight: THREE.DirectionalLight;
    backLight: THREE.DirectionalLight;
    topLight: THREE.DirectionalLight;
    pointLight1: THREE.PointLight;
    pointLight2: THREE.PointLight;
    pointLight3: THREE.PointLight;
    rimLight: THREE.DirectionalLight;
}

export const calculateTankBounds = (width: number, height: number, depth: number): TankBounds => {
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

export const createTank = (width: number, height: number, depth: number): {
    tankGroup: THREE.Group;
    water: InstanceType<typeof Water>;
    bounds: TankBounds;
} => {
    const group = new THREE.Group();
    const bounds = calculateTankBounds(width, height, depth);

    const glassMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        metalness: 0,
        roughness: 0.05,
        transmission: 0.95,
        thickness: GLASS_THICKNESS,
        transparent: true,
        opacity: 0.3,
        depthWrite: true,
        side: THREE.DoubleSide,
        ior: 1.5,
        envMapIntensity: 1.2,
        clearcoat: 1,
        clearcoatRoughness: 0.1,
        reflectivity: 0.2,
    });

    const createGlassPane = (w: number, h: number, d: number, pos: THREE.Vector3, rot: THREE.Euler) => {
        const pane = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), glassMaterial);
        pane.position.copy(pos);
        pane.rotation.copy(rot);
        pane.receiveShadow = true;
        pane.castShadow = true;
        return pane;
    };

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
        sunDirection: new THREE.Vector3(1, 1, 1).normalize(),
        sunColor: 0xffffff,
        waterColor: 0x88ccff,
        distortionScale: 2.5,
        size: 0.8,
        alpha: 0.4,
    });

    water.renderOrder = 1;
    water.rotation.x = -Math.PI / 2;
    water.position.set(0, height * WATER_LEVEL - GLASS_THICKNESS, 0);
    water.material.depthWrite = true;
    water.material.transparent = true;
    water.material.opacity = 0.4;
    group.add(water);

    const sand = new THREE.Mesh(
        new THREE.PlaneGeometry(bounds.innerWidth, bounds.innerDepth),
        new THREE.MeshStandardMaterial({
            color: 0xe0d8b0,
            roughness: 0.6,
            metalness: 0,
            emissive: 0x000000,
        })
    );

    sand.name = "sandFloor";
    sand.rotation.x = -Math.PI / 2;
    sand.position.set(0, GLASS_THICKNESS + 0.1, 0);
    sand.receiveShadow = true;
    sand.castShadow = false;
    group.add(sand);

    return { tankGroup: group, water, bounds };
};

export const setupCameraAndControls = (
    camera: THREE.PerspectiveCamera,
    controls: OrbitControls,
    width: number,
    height: number,
    depth: number
) => {
    const tankDiagonal = Math.sqrt(width * width + height * height + depth * depth);
    camera.position.set(tankDiagonal * 1.2, height * 0.8, tankDiagonal * 1.2);
    controls.target.set(0, height / 3, 0);
    controls.update();
};

export const setupSceneLighting = (scene: THREE.Scene): SceneLightingRig => {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xfff5e6, 1.5);
    mainLight.position.set(20, 50, 20);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 2048;
    mainLight.shadow.mapSize.height = 2048;
    mainLight.shadow.bias = -0.0001;
    scene.add(mainLight);

    const fillLight = new THREE.DirectionalLight(0xe6f0ff, 0.8);
    fillLight.position.set(-20, 30, -20);
    fillLight.castShadow = false;
    scene.add(fillLight);

    const backLight = new THREE.DirectionalLight(0xffffff, 0.6);
    backLight.position.set(0, 20, -30);
    backLight.castShadow = false;
    scene.add(backLight);

    const topLight = new THREE.DirectionalLight(0xffffff, 1.2);
    topLight.position.set(0, 60, 0);
    topLight.castShadow = true;
    topLight.shadow.mapSize.width = 1024;
    topLight.shadow.mapSize.height = 1024;
    scene.add(topLight);

    const pointLight1 = new THREE.PointLight(0xaaccff, 0.8, 100);
    pointLight1.position.set(0, 20, 0);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xffccaa, 0.5, 100);
    pointLight2.position.set(15, 15, 15);
    scene.add(pointLight2);

    const pointLight3 = new THREE.PointLight(0xaaffcc, 0.5, 100);
    pointLight3.position.set(-15, 15, -15);
    scene.add(pointLight3);

    const rimLight = new THREE.DirectionalLight(0xccddff, 0.5);
    rimLight.position.set(-10, 20, 30);
    scene.add(rimLight);

    return {
        ambientLight,
        mainLight,
        fillLight,
        backLight,
        topLight,
        pointLight1,
        pointLight2,
        pointLight3,
        rimLight,
    };
};

export const applySceneLightingMode = (
    mode: TankLightingMode,
    scene: THREE.Scene,
    renderer: THREE.WebGLRenderer,
    lighting: SceneLightingRig,
    water?: InstanceType<typeof Water> | null
) => {
    if (mode === "night") {
        scene.background = new THREE.Color(0x060b18);
        renderer.toneMappingExposure = 0.8;

        lighting.ambientLight.color.set(0x8eb6ff);
        lighting.ambientLight.intensity = 0.3;

        lighting.mainLight.color.set(0x90b8ff);
        lighting.mainLight.intensity = 0.5;

        lighting.fillLight.color.set(0x5579c5);
        lighting.fillLight.intensity = 0.4;

        lighting.backLight.color.set(0x9cc7ff);
        lighting.backLight.intensity = 0.35;

        lighting.topLight.color.set(0x9db7ff);
        lighting.topLight.intensity = 0.45;

        lighting.pointLight1.color.set(0x4a86ff);
        lighting.pointLight1.intensity = 0.65;

        lighting.pointLight2.color.set(0x294f92);
        lighting.pointLight2.intensity = 0.2;

        lighting.pointLight3.color.set(0x42c9c9);
        lighting.pointLight3.intensity = 0.25;

        lighting.rimLight.color.set(0xb5ccff);
        lighting.rimLight.intensity = 0.6;

        if (water) {
            water.material.uniforms.sunColor.value = new THREE.Color(0x6f90ff);
            water.material.uniforms.waterColor.value = new THREE.Color(0x173a62);
            water.material.uniforms.distortionScale.value = 1.8;
        }
        return;
    }

    scene.background = new THREE.Color(0x111122);
    renderer.toneMappingExposure = 1.5;

    lighting.ambientLight.color.set(0xffffff);
    lighting.ambientLight.intensity = 0.8;

    lighting.mainLight.color.set(0xfff5e6);
    lighting.mainLight.intensity = 1.5;

    lighting.fillLight.color.set(0xe6f0ff);
    lighting.fillLight.intensity = 0.8;

    lighting.backLight.color.set(0xffffff);
    lighting.backLight.intensity = 0.6;

    lighting.topLight.color.set(0xffffff);
    lighting.topLight.intensity = 1.2;

    lighting.pointLight1.color.set(0xaaccff);
    lighting.pointLight1.intensity = 0.8;

    lighting.pointLight2.color.set(0xffccaa);
    lighting.pointLight2.intensity = 0.5;

    lighting.pointLight3.color.set(0xaaffcc);
    lighting.pointLight3.intensity = 0.5;

    lighting.rimLight.color.set(0xccddff);
    lighting.rimLight.intensity = 0.5;

    if (water) {
        water.material.uniforms.sunColor.value = new THREE.Color(0xffffff);
        water.material.uniforms.waterColor.value = new THREE.Color(0x88ccff);
        water.material.uniforms.distortionScale.value = 2.5;
    }
};

export const clampObjectWithinBounds = (obj: THREE.Object3D, selectedItem: TankItem, bounds: TankBounds) => {
    const maxScale = 40;
    obj.scale.x = THREE.MathUtils.clamp(obj.scale.x, 0.3, maxScale);
    obj.scale.y = THREE.MathUtils.clamp(obj.scale.y, 0.3, maxScale);
    obj.scale.z = THREE.MathUtils.clamp(obj.scale.z, 0.3, maxScale);

    if (selectedItem.type === 'image' && obj.userData.is2DImage) {
        obj.scale.y = obj.scale.x;
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
            selectedItem.allowSurfacePlacement
                ? bounds.maxY + planeHeight * 0.9
                : bounds.maxY - planeHeight / 2
        );

        obj.position.z = THREE.MathUtils.clamp(
            obj.position.z,
            bounds.minZ,
            bounds.maxZ
        );

        return;
    }

    const box = new THREE.Box3().setFromObject(obj);

    if (box.min.x < bounds.minX) obj.position.x += bounds.minX - box.min.x;
    if (box.max.x > bounds.maxX) obj.position.x -= box.max.x - bounds.maxX;

    if (box.min.y < GLASS_THICKNESS) obj.position.y += GLASS_THICKNESS - box.min.y;
    if (selectedItem.allowSurfacePlacement) {
        const objectHeight = box.max.y - box.min.y;
        const maxBottomY = bounds.maxY + objectHeight * 0.4;
        if (box.min.y > maxBottomY) obj.position.y -= box.min.y - maxBottomY;
    } else if (box.max.y > bounds.maxY) {
        obj.position.y -= box.max.y - bounds.maxY;
    }

    if (box.min.z < bounds.minZ) obj.position.z += bounds.minZ - box.min.z;
    if (box.max.z > bounds.maxZ) obj.position.z -= box.max.z - bounds.maxZ;
};
