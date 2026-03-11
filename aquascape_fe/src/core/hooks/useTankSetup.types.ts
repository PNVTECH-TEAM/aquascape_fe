import type { RefObject } from "react";
import type * as THREE from "three";
import type { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import type { TankInfo, TankItemTransform, TankLayoutItem, TankSize, Vector3Data } from "@app/core/interface";

export type TankLightingMode = "day" | "night";

export interface UseTankSetupReturn {
    containerRef: RefObject<HTMLDivElement | null>;
    controlsRef: RefObject<OrbitControls | null>;
    tankInfo: TankInfo;
    loading: boolean;
    handleApplySize: (customSize: TankSize) => void;
    handleResetView: () => void;
    addItem: (item: unknown, position?: Vector3Data, transform?: TankItemTransform) => void;
    clearItems: () => void;
    triggerFishRush: (durationSeconds?: number) => void;
    getLayoutSnapshot: () => TankLayoutItem[];
    getAnalysisSnapshot: () => TankAnalysisSnapshot;
}

export interface TankItem {
    id: string;
    type: 'fish' | 'decoration' | 'image';
    catalogItemId?: string;
    userAssetId?: number;
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

export interface TankItemAnalysis {
    instanceId: string;
    catalogItemId?: string;
    userAssetId?: number;
    name: string;
    category?: string;
    sourceType?: string;
    type: 'fish' | 'decoration' | 'image';
    isFish: boolean;
    position: Vector3Data;
    rotation: Vector3Data;
    scale: Vector3Data;
    size: Vector3Data;
    normalizedPosition: Vector3Data;
    zone: {
        horizontal: "left" | "center" | "right";
        vertical: "bottom" | "middle" | "top";
        depth: "front" | "middle" | "back";
    };
}

export interface TankAnalysisSnapshot {
    tank: {
        size: TankSize;
        volumeLiters: number;
        glassThicknessMm: number;
    };
    items: TankItemAnalysis[];
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
    catalogItemId?: string;
    userAssetId?: number;
    sourceType?: string;
    sourceCategory?: string;
    sourceName?: string;
    allowSurfacePlacement: boolean;
}
