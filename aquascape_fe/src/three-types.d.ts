// src/three-types.d.ts

declare module 'three/examples/jsm/controls/OrbitControls' {
    import { Camera, MOUSE, TOUCH, Object3D, EventDispatcher } from 'three';
    export class OrbitControls extends EventDispatcher {
        constructor(object: Camera, domElement?: HTMLElement);
        object: Camera;
        domElement: HTMLElement | HTMLDocument;
        enabled: boolean;
        target: THREE.Vector3;
        enableDamping: boolean;
        dampingFactor: number;
        enableZoom: boolean;
        zoomSpeed: number;
        enableRotate: boolean;
        rotateSpeed: number;
        enablePan: boolean;
        panSpeed: number;
        maxPolarAngle: number;
        maxDistance: number;
        minDistance: number;

        // --- SỬA Ở ĐÂY: Cho phép null ---
        touches: { ONE: TOUCH | null; TWO: TOUCH | null };
        mouseButtons: { LEFT: MOUSE | null; MIDDLE: MOUSE | null; RIGHT: MOUSE | null };
        // -------------------------------

        update(): boolean;
        reset(): void;
        dispose(): void;
    }
}

declare module 'three/examples/jsm/controls/TransformControls' {
    import { Camera, Object3D } from 'three';
    export class TransformControls extends Object3D {
        constructor(camera: Camera, domElement?: HTMLElement);
        enabled: boolean;
        axis: string | null;
        mode: 'translate' | 'rotate' | 'scale';
        dragging: boolean;
        object: Object3D | undefined;
        attach(object: Object3D): this;
        detach(): this;
        setMode(mode: 'translate' | 'rotate' | 'scale'): void;
        dispose(): void;
        addEventListener(type: string, listener: (event: any) => void): void;
    }
}

declare module 'three/examples/jsm/loaders/GLTFLoader' {
    import { Loader, LoadingManager, Group } from 'three';
    export class GLTFLoader extends Loader {
        constructor(manager?: LoadingManager);
        load(url: string, onLoad: (gltf: any) => void, onProgress?: (event: ProgressEvent) => void, onError?: (event: ErrorEvent) => void): void;
    }
}

declare module 'three/examples/jsm/objects/Water' {
    import { Mesh, BufferGeometry, Side, Texture, Vector3, Color } from 'three';
    export class Water extends Mesh {
        constructor(geometry: BufferGeometry, options: {
            textureWidth?: number;
            textureHeight?: number;
            waterNormals?: Texture;
            sunDirection?: Vector3;
            sunColor?: Color | number | string;
            waterColor?: Color | number | string;
            distortionScale?: number;
            size?: number;
            alpha?: number;
            side?: Side;
        });
        material: any;
    }
}