import type {
    AquariumCatalogItem,
    AquariumTank,
    TankLayout,
    TankLayoutItem,
    TankSize,
} from "@app/core/interface/aquarium.interface";
import type {
    CatalogGroupDto,
    CatalogItemDto,
    ListEnvelope,
    UserTankDto,
} from "./types";
import { createId, unwrapList } from "./utils";

const defaultTankSize = (fallback?: TankSize): TankSize =>
    fallback ?? {
        width: 120,
        height: 50,
        depth: 45,
    };

const normalizeAssetType = (value?: string): AquariumCatalogItem["type"] => {
    const normalized = String(value ?? "").toLowerCase();
    if (normalized.includes("fish")) return "fish";
    if (
        normalized.includes("plant") ||
        normalized.includes("foreground") ||
        normalized.includes("midground") ||
        normalized.includes("background")
    ) {
        return "plant";
    }
    if (normalized.includes("rock")) return "rock";
    return "decoration";
};

const mapCatalogItem = (
    item: CatalogItemDto,
    fallbackCategory?: string
): AquariumCatalogItem | null => {
    if (!item.id || !item.name) return null;

    return {
        id: item.id,
        name: item.name,
        imageKey: item.imageKey ?? item.imageUrl,
        url: item.url ?? item.modelUrl ?? item.imageUrl,
        category: item.category ?? fallbackCategory ?? "Other",
        type: normalizeAssetType(item.type),
    };
};

export const normalizeCatalogResponse = (
    payload: ListEnvelope<CatalogItemDto | CatalogGroupDto>
): AquariumCatalogItem[] => {
    const rawList = unwrapList(payload);
    if (rawList.length === 0) return [];

    const first = rawList[0] as CatalogItemDto | CatalogGroupDto;
    const hasGroupedShape =
        typeof first === "object" &&
        first !== null &&
        "items" in first &&
        Array.isArray((first as CatalogGroupDto).items);

    if (hasGroupedShape) {
        const grouped = rawList as CatalogGroupDto[];
        return grouped.flatMap((group) =>
            (group.items ?? [])
                .map((item) => mapCatalogItem(item, group.category))
                .filter((entry): entry is AquariumCatalogItem => Boolean(entry))
        );
    }

    return (rawList as CatalogItemDto[])
        .map((item) => mapCatalogItem(item))
        .filter((entry): entry is AquariumCatalogItem => Boolean(entry));
};

export const mapUserTankToAquariumTank = (
    tank: UserTankDto,
    fallbackSize?: TankSize
): AquariumTank => {
    const now = new Date().toISOString();

    return {
        id: tank.id,
        name: tank.name ?? "Untitled Tank",
        size: tank.preset?.size ?? defaultTankSize(fallbackSize),
        latestLayoutVersion: tank.latestLayoutVersion ?? tank.layout?.version ?? 1,
        createdAt: tank.createdAt ?? now,
        updatedAt: tank.updatedAt ?? now,
    };
};

const normalizeTransform = (
    transform?: TankLayoutItem["transform"]
): TankLayoutItem["transform"] => ({
    position: {
        x: transform?.position?.x ?? 0,
        y: transform?.position?.y ?? 0,
        z: transform?.position?.z ?? 0,
    },
    rotation: {
        x: transform?.rotation?.x ?? 0,
        y: transform?.rotation?.y ?? 0,
        z: transform?.rotation?.z ?? 0,
    },
    scale: {
        x: transform?.scale?.x ?? 1,
        y: transform?.scale?.y ?? 1,
        z: transform?.scale?.z ?? 1,
    },
});

export const mapUserTankToLayout = (
    tank: UserTankDto,
    fallbackSize?: TankSize
): TankLayout | null => {
    if (!tank.layout) return null;

    const now = new Date().toISOString();
    const size = tank.preset?.size ?? defaultTankSize(fallbackSize);
    const latestLayoutId = tank.layout.id;
    const rawItems = tank.layout.tankLayoutItems ?? [];
    const filteredByLayout = latestLayoutId
        ? rawItems.filter((item) => !item.tankLayoutId || item.tankLayoutId === latestLayoutId)
        : rawItems;

    const dedupedByInstance = new Map<string, TankLayoutItem>();
    filteredByLayout.forEach((item) => {
        const instanceId = item.instanceId ?? createId();
        dedupedByInstance.set(instanceId, {
            instanceId,
            catalogItemId: item.catalogItemId ?? "",
            transform: normalizeTransform(item.transform),
        });
    });
    const items = Array.from(dedupedByInstance.values());

    return {
        id: latestLayoutId ?? createId(),
        tankId: tank.id,
        version: tank.layout.version ?? tank.latestLayoutVersion ?? 1,
        size,
        items,
        savedAt: tank.updatedAt ?? now,
        updatedAt: tank.updatedAt ?? now,
    };
};
