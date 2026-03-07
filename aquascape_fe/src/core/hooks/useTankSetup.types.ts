import type { RefObject } from "react";
import type * as THREE from "three";
import type { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import type { TankInfo, TankLayoutItem, TankSize, Vector3Data } from "@app/core/interface";

export interface UseTankSetupReturn {
    containerRef: RefObject<HTMLDivElement | null>;
    controlsRef: RefObject<OrbitControls | null>;
    tankInfo: TankInfo;
    loading: boolean;
    handleApplySize: (customSize: TankSize) => void;
    handleResetView: () => void;
    addItem: (item: unknown, position?: Vector3Data) => void;
    triggerFishRush: (durationSeconds?: number) => void;
    getLayoutSnapshot: () => TankLayoutItem[];
}

export interface TankItem {
    id: string;
    type: 'fish' | 'decoration' | 'image';
    catalogItemId: string;
    sourceType?: string;
    category?: string;
    sourceName?: string;
    object: THREE.Object3D;
    isFish?: boolean;
    allowSurfacePlacement?: boolean;
}

export interface AddedTankItemEvent {
    id: string;
    type: 'fish' | 'decoration' | 'image';
    sourceType?: string;
    category?: string;
    sourceName?: string;
    isFish: boolean;
}

export interface TankBounds {
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

export interface TankItemSourceMetadata {
    catalogItemId: string;
    sourceType?: string;
    sourceCategory?: string;
    sourceName?: string;
    allowSurfacePlacement: boolean;
}
