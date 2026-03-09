// Custom type declarations for Three.js example modules

// DragControls doesn't have official types in @types/three at the moment
declare module 'three/examples/jsm/controls/DragControls' {
    import { Object3D, Camera, EventDispatcher, Intersection, Raycaster, Vector3 } from 'three';
    export class DragControls extends EventDispatcher {
        constructor(objects: Object3D[] | undefined, camera: Camera, domElement?: HTMLElement | Document);
        enabled: boolean;
        transformGroup: boolean;
        activate(): void;
        deactivate(): void;
        dispose(): void;
        getObjects(): Object3D[];
        getRaycaster(): Raycaster;
        getDragPlane(): Object3D;
        // basic event typing
        addEventListener(type: string, listener: (event: any) => void): void;
        removeEventListener(type: string, listener: (event: any) => void): void;
    }
}
