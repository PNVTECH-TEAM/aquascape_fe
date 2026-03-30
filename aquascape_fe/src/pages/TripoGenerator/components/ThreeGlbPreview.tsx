import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

type PreviewState = "idle" | "loading" | "ready" | "error";

type Props = {
  url: string;
  className?: string;
};

const disposeObject3D = (root: THREE.Object3D) => {
  root.traverse((child) => {
    const mesh = child as THREE.Mesh;
    if (mesh.isMesh) {
      mesh.geometry?.dispose();
      const material = mesh.material as THREE.Material | THREE.Material[] | undefined;
      if (Array.isArray(material)) {
        material.forEach((item) => item.dispose());
      } else {
        material?.dispose();
      }
    }
  });
};

export default function ThreeGlbPreview({ url, className }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const shouldSpinRef = useRef<boolean>(false);
  const [previewState, setPreviewState] = useState<PreviewState>(url ? "loading" : "idle");
  const [errorText, setErrorText] = useState<string>("");

  const overlayText = useMemo(() => {
    if (previewState === "loading") return "Đang tải preview 3D…";
    if (previewState === "error") return errorText || "Không thể tải preview 3D";
    return "";
  }, [errorText, previewState]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !url) return;

    setPreviewState("loading");
    setErrorText("");

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.01, 1000);
    camera.position.set(1.2, 0.9, 1.2);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setClearAlpha(0);
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.display = "block";

    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.enablePan = false;
    controls.minDistance = 0.4;
    controls.maxDistance = 20;

    const hemi = new THREE.HemisphereLight(0xffffff, 0x334e68, 1.1);
    hemi.position.set(0, 1, 0);
    scene.add(hemi);

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.0);
    keyLight.position.set(3, 5, 2);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xffffff, 0.55);
    fillLight.position.set(-3, 2, -2);
    scene.add(fillLight);

    const rootGroup = new THREE.Group();
    scene.add(rootGroup);

    const loader = new GLTFLoader();

    const fitCameraToCenteredObject = (object: THREE.Object3D) => {
object.updateMatrixWorld(true);

      const box = new THREE.Box3().setFromObject(object);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());

      if (!Number.isFinite(size.x + size.y + size.z)) return;

      const fov = THREE.MathUtils.degToRad(camera.fov);
      const maxDim = Math.max(size.x, size.y, size.z);
      const distance = (maxDim / 2) / Math.tan(fov / 2) * 1.35;

      camera.near = Math.max(distance / 100, 0.01);
      camera.far = Math.max(distance * 50, 50);
      camera.updateProjectionMatrix();

      const direction = new THREE.Vector3(0.15, 0.7, 1).normalize();
      camera.position.copy(center).addScaledVector(direction, distance);
      camera.lookAt(center);
      controls.target.copy(center);
      controls.update();
    };

    let disposed = false;

    loader.load(
      url,
      (gltf) => {
        if (disposed) return;

        rootGroup.clear();
        const model = gltf.scene;
        model.rotation.set(0, 0, 0);
        model.position.set(0, 0, 0);

        // Center pivot to keep the object always in the middle (also when auto-rotating).
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        model.position.sub(center);
        model.updateMatrixWorld(true);

        rootGroup.add(model);

        fitCameraToCenteredObject(rootGroup);
        shouldSpinRef.current = true;
        setPreviewState("ready");
      },
      undefined,
      (err) => {
        if (disposed) return;
        shouldSpinRef.current = false;
        setErrorText(err instanceof Error ? err.message : "Load error");
        setPreviewState("error");
      },
    );

    const resize = () => {
      const width = Math.max(container.clientWidth, 1);
      const height = Math.max(container.clientHeight, 1);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    };

    const ro = new ResizeObserver(resize);
    ro.observe(container);
    resize();

    const tick = () => {
      controls.update();
      if (shouldSpinRef.current) {
        rootGroup.rotation.y += 0.003;
      }
      renderer.render(scene, camera);
      animationRef.current = window.requestAnimationFrame(tick);
    };
    animationRef.current = window.requestAnimationFrame(tick);

    return () => {
      disposed = true;
      ro.disconnect();

      if (animationRef.current) {
        window.cancelAnimationFrame(animationRef.current);
      }

      try {
        rootGroup.traverse((obj) => {
          if (obj instanceof THREE.Object3D) return;
        });
      } catch {
      }

      rootGroup.children.forEach((child) => disposeObject3D(child));
      rootGroup.clear();

      controls.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  return (
<div className={className}>
      <div ref={containerRef} className="relative h-full w-full">
        {overlayText ? (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="rounded-xl bg-white/70 px-4 py-2 text-sm font-semibold text-[#102a43] ring-1 ring-[#102a43]/10">
              {overlayText}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}