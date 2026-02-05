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
