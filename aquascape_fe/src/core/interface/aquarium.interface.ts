import * as THREE from 'three';

export interface TankSize {
    width: number;
    height: number;
    depth: number;
}

export interface TankInfo {
    volume: number;
    thickness: number;
    glassWeight: string;
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

export interface TankPreset {
    id: string;
    name: string;
    size: TankSize;
}

export interface AquariumConfig {
    id: string;
    name: string;
    size: TankSize;
    tankInfo: TankInfo;
    createdAt: string;
    updatedAt: string;
}

export interface SizePresets {
    [key: string]: TankSize;
}