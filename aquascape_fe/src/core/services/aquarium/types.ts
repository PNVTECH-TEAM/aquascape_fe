import type { TankLayoutItem, TankPreset } from "@app/core/interface/aquarium.interface";

export type ListEnvelope<T> = T[] | { data?: T[]; items?: T[]; results?: T[] };

export type SaveUserTankRequest = {
    id?: string | null; // null = create new tank
    name?: string;
    presetId?: number | string;
    previewImageUrl?: string | null;
    items?: Array<{
        id?: string;
        instanceId: string;
        catalogItemId?: string;
        userAssetId?: number;
        transform: TankLayoutItem["transform"];
    }>;
};

export interface UserTankLayoutItemDto {
    id?: string;
    tankLayoutId?: string;
    instanceId?: string;
    catalogItemId?: string;
    userAssetId?: number;
    transform?: TankLayoutItem["transform"];
}

export interface UserTankLayoutDto {
    id?: string;
    version?: number;
    previewImageUrl?: string | null;
    tankLayoutItems?: UserTankLayoutItemDto[];
}

export interface UserTankDto {
    id: string;
    userId?: number;
    name?: string;
    latestLayoutVersion?: number;
    createdAt?: string;
    updatedAt?: string;
    preset?: TankPreset | null;
    layout?: UserTankLayoutDto | null;
}

export interface CatalogItemDto {
    id?: string;
    name?: string;
    imageUrl?: string;
    modelUrl?: string;
    imageKey?: string;
    url?: string;
    category?: string;
    type?: string;
}

export interface CatalogGroupDto {
    category?: string;
    items?: CatalogItemDto[];
}
