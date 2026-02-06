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

export interface SizePresets {
    [key: string]: TankSize;
}

export interface AquariumConfig {
    id: string;
    name: string;
    size: {
        width: number;
        height: number;
        depth: number;
    };
    tankInfo: {
        volume: number;
        thickness: number;
        glassWeight: string;
    };
    createdAt: string;
    updatedAt: string;
}

export interface TankPreset {
    id: string;
    name: string;
    size: {
        width: number;
        height: number;
        depth: number;
    };
}
