import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { Water } from "three/examples/jsm/objects/Water";
import type { TankSize, TankInfo, TankItem } from "@app/core/interface";

interface UseTankSetupReturn {
  containerRef: React.RefObject<HTMLDivElement | null>;
  controlsRef: React.RefObject<OrbitControls | null>;
  tankInfo: TankInfo;
  loading: boolean;
  handleApplySize: (customSize: TankSize) => void;
  handleResetView: () => void;
}

const WATER_LEVEL = 0.9;

export const calculateTankInfo = (
  w: number,
  h: number,
  d: number,
): TankInfo => {
  const volumeLiters = (w * h * d * WATER_LEVEL) / 1000;

  let thickness: number;
  if (h <= 40) thickness = 6;
  else if (h <= 60) thickness = 8;
  else if (h <= 80) thickness = 10;
  else thickness = 12;

  const glassArea = (2 * (w * h + h * d + w * d)) / 10000;
  const glassWeight = glassArea * thickness * 2.5;

  return {
    volume: Math.round(volumeLiters),
    thickness,
    glassWeight: glassWeight.toFixed(1),
  };
};

export const useTankSetup = (
  size: TankSize,
  setSize: (size: TankSize) => void,
  onLoadingComplete: () => void,
): UseTankSetupReturn => {
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const tankRef = useRef<THREE.Group | null>(null);
  const waterRef = useRef<InstanceType<typeof Water> | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const tankInfo = calculateTankInfo(size.width, size.height, size.depth);

  useEffect(() => {
    if (!containerRef.current) return;

    /* ================= SCENE ================= */
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      2000,
    );
    camera.position.set(15, 10, 15);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;

    rendererRef.current = renderer;

    containerRef.current.innerHTML = "";
    containerRef.current.appendChild(renderer.domElement);

    /* ================= CONTROLS ================= */
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controlsRef.current = controls;

    /* ================= LIGHT ================= */
    scene.add(new THREE.AmbientLight(0xffffff, 0.5));

    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(20, 30, 10);
    dirLight.castShadow = true;
    scene.add(dirLight);

    /* ================= TANK 5 GLASS PANES ================= */
    const group = new THREE.Group();
    scene.add(group);
    tankRef.current = group;

    const { width, height, depth } = size;
    const GLASS_THICKNESS = 0.8;

    const innerWidth = width - GLASS_THICKNESS * 2;
    const innerHeight = height - GLASS_THICKNESS * 2;
    const innerDepth = depth - GLASS_THICKNESS * 2;

    const glassMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 1,
      transparent: true,
      opacity: 0.35,
      thickness: GLASS_THICKNESS,
      roughness: 0,
      metalness: 0,
      ior: 1.5,
      depthWrite: false,
      side: THREE.DoubleSide,
    });

    const createPane = (
      w: number,
      h: number,
      d: number,
      pos: THREE.Vector3,
    ) => {
      const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(w, h, d),
        glassMaterial,
      );
      mesh.position.copy(pos);
      return mesh;
    };

    // FRONT
    group.add(
      createPane(
        innerWidth,
        innerHeight,
        GLASS_THICKNESS,
        new THREE.Vector3(0, height / 2, depth / 2 - GLASS_THICKNESS / 2),
      ),
    );

    // BACK
    group.add(
      createPane(
        innerWidth,
        innerHeight,
        GLASS_THICKNESS,
        new THREE.Vector3(0, height / 2, -depth / 2 + GLASS_THICKNESS / 2),
      ),
    );

    // LEFT
    group.add(
      createPane(
        GLASS_THICKNESS,
        innerHeight,
        innerDepth,
        new THREE.Vector3(-width / 2 + GLASS_THICKNESS / 2, height / 2, 0),
      ),
    );

    // RIGHT
    group.add(
      createPane(
        GLASS_THICKNESS,
        innerHeight,
        innerDepth,
        new THREE.Vector3(width / 2 - GLASS_THICKNESS / 2, height / 2, 0),
      ),
    );

    // BOTTOM
    group.add(
      createPane(
        innerWidth,
        GLASS_THICKNESS,
        innerDepth,
        new THREE.Vector3(0, GLASS_THICKNESS / 2, 0),
      ),
    );
    const tankDiagonal = Math.sqrt(
      width * width + height * height + depth * depth,
    );
    const camDistance = THREE.MathUtils.clamp(tankDiagonal * 0.9, 20, 120);

    camera.position.set(camDistance, height * 0.6, camDistance);
    controls.target.set(0, height / 3, 0);
    controls.update();
    /* ================= SAND ================= */

    const sand = new THREE.Mesh(
      new THREE.PlaneGeometry(width, depth),
      new THREE.MeshStandardMaterial({ color: 0x8b4513 }),
    );

    sand.rotation.x = -Math.PI / 2;
    sand.position.y = 0.1;
    sand.name = "sandFloor";
    sand.receiveShadow = true;
    group.add(sand);

    /* ================= WATER ================= */

    const waterGeometry = new THREE.PlaneGeometry(width, depth);
    const waterNormals = new THREE.TextureLoader().load(
      "https://threejs.org/examples/textures/waternormals.jpg",
    );

    waterNormals.wrapS = THREE.RepeatWrapping;
    waterNormals.wrapT = THREE.RepeatWrapping;

    const water = new Water(waterGeometry, {
      textureWidth: 512,
      textureHeight: 512,
      waterNormals,
      sunDirection: dirLight.position.clone().normalize(),
      sunColor: 0xffffff,
      waterColor: 0x001e0f,
      distortionScale: 3,
    });

    water.rotation.x = -Math.PI / 2;
    water.position.y = height * WATER_LEVEL;
    water.receiveShadow = false;
    water.castShadow = false;

    group.add(water);
    waterRef.current = water;
    /* ================= FISH SYSTEM ================= */

    const fishes: {
      mesh: THREE.Mesh;
      direction: THREE.Vector3;
      speed: number;
    }[] = [];

    const addFish = (textureUrl: string, pos: THREE.Vector3) => {
      if (!tankRef.current) return;

      const scale = width / 150;
      const texture = new THREE.TextureLoader().load(textureUrl);

      const material = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        side: THREE.DoubleSide,
        depthWrite: false,
      });

      const fish = new THREE.Mesh(
        new THREE.PlaneGeometry(25 * scale, 15 * scale),
        material,
      );

      fish.position.copy(pos);
      fish.position.y = height * 0.5;
      tankRef.current.add(fish);

      fishes.push({
        mesh: fish,
        direction: new THREE.Vector3(
          Math.random() - 0.5,
          (Math.random() - 0.5) * 0.3,
          Math.random() - 0.5,
        ).normalize(),
        speed: 0.5 + Math.random() * 0.5,
      });
    };

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const draggableObjects: THREE.Object3D[] = [];
    let selectedObject: THREE.Object3D | null = null;

    const dragPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);

    const intersection = new THREE.Vector3();

    const addObjectToTank = (item: TankItem, pos: THREE.Vector3) => {
      if (!tankRef.current) return;

      const scale = width / 200;

      const texture = new THREE.TextureLoader().load(item.image);

      const material = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        side: THREE.DoubleSide,
        depthWrite: false,
      });

      const mesh = new THREE.Mesh(
        new THREE.PlaneGeometry(30 * scale, 25 * scale),
        material,
      );

      mesh.position.copy(pos);
      mesh.position.y = (25 * scale) / 2 + 0.1;

      tankRef.current.add(mesh);

      draggableObjects.push(mesh);
    };

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

      if (item.type === "fish") {
        addFish(item.image, point);
      } else {
        addObjectToTank(item, point);
      }
    };

    containerRef.current.addEventListener("dragover", handleDragOver);
    containerRef.current.addEventListener("drop", handleDrop);

    // ===== CLICK & MOVE OBJECT =====

    const onMouseDown = (event: MouseEvent) => {
      if (!rendererRef.current) return;

      const rect = rendererRef.current.domElement.getBoundingClientRect();

      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);

      const intersects = raycaster.intersectObjects(draggableObjects);

      if (intersects.length > 0) {
        selectedObject = intersects[0].object;
        controls.enabled = false; // tắt xoay camera khi kéo
      }
    };

    const onMouseMove = (event: MouseEvent) => {
      if (!selectedObject || !rendererRef.current) return;

      const rect = rendererRef.current.domElement.getBoundingClientRect();

      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);

      if (raycaster.ray.intersectPlane(dragPlane, intersection)) {
        selectedObject.position.x = THREE.MathUtils.clamp(
          intersection.x,
          -width / 2 + 5,
          width / 2 - 5,
        );

        selectedObject.position.z = THREE.MathUtils.clamp(
          intersection.z,
          -depth / 2 + 5,
          depth / 2 - 5,
        );
      }
    };

    const onMouseUp = () => {
      selectedObject = null;
      controls.enabled = true;
    };

    renderer.domElement.addEventListener("mousedown", onMouseDown);
    renderer.domElement.addEventListener("mousemove", onMouseMove);
    renderer.domElement.addEventListener("mouseup", onMouseUp);

    /* ================= ANIMATE ================= */

    const clock = new THREE.Clock();
    let frameId: number;

    const animate = () => {
      frameId = requestAnimationFrame(animate);

      const delta = clock.getDelta();

      // ===== Water animation =====
      if (waterRef.current) {
        const material = waterRef.current.material as THREE.ShaderMaterial;
        if (material?.uniforms?.time) {
          material.uniforms.time.value += delta * 0.5;
        }
      }

      // ===== Fish movement =====
      fishes.forEach((fishObj) => {
        const { mesh, direction, speed } = fishObj;

        mesh.position.add(direction.clone().multiplyScalar(speed * delta * 20));

        const angle = Math.atan2(direction.x, direction.z);
        mesh.rotation.y = angle;

        // 🔥 LẤY NỬA KÍCH THƯỚC CÁ
        const geometry = mesh.geometry as THREE.PlaneGeometry;
        const fishHalfWidth = geometry.parameters.width / 2;
        const fishHalfHeight = geometry.parameters.height / 2;

        // ===== X boundary =====
        if (mesh.position.x > width / 2 - fishHalfWidth) {
          mesh.position.x = width / 2 - fishHalfWidth;
          direction.x *= -1;
        }

        if (mesh.position.x < -width / 2 + fishHalfWidth) {
          mesh.position.x = -width / 2 + fishHalfWidth;
          direction.x *= -1;
        }

        // ===== Z boundary =====
        if (mesh.position.z > depth / 2 - fishHalfWidth) {
          mesh.position.z = depth / 2 - fishHalfWidth;
          direction.z *= -1;
        }

        if (mesh.position.z < -depth / 2 + fishHalfWidth) {
          mesh.position.z = -depth / 2 + fishHalfWidth;
          direction.z *= -1;
        }

        // ===== Y boundary (mặt nước & đáy) =====
        if (mesh.position.y > height * WATER_LEVEL - fishHalfHeight) {
          mesh.position.y = height * WATER_LEVEL - fishHalfHeight;
          direction.y *= -1;
        }

        if (mesh.position.y < fishHalfHeight + 0.1) {
          mesh.position.y = fishHalfHeight + 0.1;
          direction.y *= -1;
        }
      });

      controls.update();
      renderer.render(scene, camera);
    };

    animate();
    requestAnimationFrame(() => {
      setLoading(false);
    });
    onLoadingComplete?.();

    /* ================= CLEANUP ================= */

    return () => {
      cancelAnimationFrame(frameId);

      if (containerRef.current) {
        containerRef.current.removeEventListener("dragover", handleDragOver);
        containerRef.current.removeEventListener("drop", handleDrop);
      }

      renderer.domElement.removeEventListener("mousedown", onMouseDown);
      renderer.domElement.removeEventListener("mousemove", onMouseMove);
      renderer.domElement.removeEventListener("mouseup", onMouseUp);
      controls.dispose();

      renderer.forceContextLoss();
      renderer.dispose();
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
      }
    };
  }, [size.width, size.height, size.depth]);

  const handleApplySize = (customSize: TankSize) => {
    setSize(customSize);
  };

  const handleResetView = () => {
    controlsRef.current?.reset();
  };

  return {
    containerRef,
    controlsRef,
    tankInfo,
    loading,
    handleApplySize,
    handleResetView,
  };
};
