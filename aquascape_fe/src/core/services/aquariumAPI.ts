import axios from "axios";
import type {
    AquariumConfig,
    TankPreset,
    AquariumCatalogItem,
    AquariumTank,
    TankLayout,
    CreateTankPayload,
    UpdateTankPayload,
    UpsertTankLayoutPayload,
} from "@app/core/interface/aquarium.interface";

interface MockDataResponse {
    aquariumConfigs: AquariumConfig[];
    tankPresets: TankPreset[];
    aquariumCatalog: AquariumCatalogItem[];
    tanks?: AquariumTank[];
    tankLayouts?: TankLayout[];
}

interface MockDatabaseState {
    aquariumConfigs: AquariumConfig[];
    tankPresets: TankPreset[];
    aquariumCatalog: AquariumCatalogItem[];
    tanks: AquariumTank[];
    tankLayouts: TankLayout[];
}

let inMemoryDb: MockDatabaseState | null = null;

const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

const clone = <T>(data: T): T => JSON.parse(JSON.stringify(data)) as T;

const createId = (): string => {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
        return crypto.randomUUID();
    }

    return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

const normalizeState = (seed: MockDataResponse): MockDatabaseState => ({
    aquariumConfigs: seed.aquariumConfigs ?? [],
    tankPresets: seed.tankPresets ?? [],
    aquariumCatalog: seed.aquariumCatalog ?? [],
    tanks: seed.tanks ?? [],
    tankLayouts: seed.tankLayouts ?? [],
});

const fetchSeedData = async (): Promise<MockDatabaseState> => {
    const response = await axios.get<MockDataResponse>("/mock-data.json");
    return normalizeState(response.data);
};

const readDatabase = async (): Promise<MockDatabaseState> => {
    if (!inMemoryDb) {
        inMemoryDb = await fetchSeedData();
    }

    return clone(inMemoryDb);
};

const writeDatabase = (state: MockDatabaseState): void => {
    inMemoryDb = clone(state);
};

export const resetMockAquariumDatabase = (): void => {
    inMemoryDb = null;
};

export const getAquariumConfigs = async (): Promise<AquariumConfig[]> => {
    try {
        await sleep(180);
        const db = await readDatabase();
        return clone(db.aquariumConfigs);
    } catch (error) {
        console.error("Error fetching aquarium configs:", error);
        throw error;
    }
};

export const getAquariumConfig = async (id: string): Promise<AquariumConfig | null> => {
    await sleep(180);
    const db = await readDatabase();
    return clone(db.aquariumConfigs.find((config) => config.id === id) ?? null);
};

export const createAquariumConfig = async (
    config: Omit<AquariumConfig, "id" | "createdAt" | "updatedAt">
): Promise<AquariumConfig> => {
    try {
        await sleep(300);
        const db = await readDatabase();
        const now = new Date().toISOString();

        const newConfig: AquariumConfig = {
            ...config,
            id: createId(),
            createdAt: now,
            updatedAt: now,
        };

        db.aquariumConfigs.push(newConfig);
        writeDatabase(db);

        return clone(newConfig);
    } catch (error) {
        console.error("Error creating aquarium config:", error);
        throw error;
    }
};

export const updateAquariumConfig = async (
    id: string,
    updates: Partial<AquariumConfig>
): Promise<AquariumConfig | null> => {
    await sleep(300);
    const db = await readDatabase();

    const index = db.aquariumConfigs.findIndex((config) => config.id === id);
    if (index < 0) return null;

    const updated: AquariumConfig = {
        ...db.aquariumConfigs[index],
        ...updates,
        id,
        updatedAt: new Date().toISOString(),
    };

    db.aquariumConfigs[index] = updated;
    writeDatabase(db);

    return clone(updated);
};

export const deleteAquariumConfig = async (id: string): Promise<boolean> => {
    try {
        await sleep(280);
        const db = await readDatabase();
        const before = db.aquariumConfigs.length;
        db.aquariumConfigs = db.aquariumConfigs.filter((config) => config.id !== id);
        writeDatabase(db);
        return db.aquariumConfigs.length < before;
    } catch (error) {
        console.error("Error deleting aquarium config:", error);
        throw error;
    }
};

export const getTankPresets = async (): Promise<TankPreset[]> => {
    try {
        await sleep(160);
        const db = await readDatabase();
        return clone(db.tankPresets);
    } catch (error) {
        console.error("Error fetching tank presets:", error);
        throw error;
    }
};

export const getAquariumCatalog = async (): Promise<AquariumCatalogItem[]> => {
    try {
        await sleep(160);
        const db = await readDatabase();
        return clone(db.aquariumCatalog);
    } catch (error) {
        console.error("Error fetching aquarium catalog:", error);
        throw error;
    }
};

export const getTanks = async (): Promise<AquariumTank[]> => {
    await sleep(180);
    const db = await readDatabase();

    const sorted = [...db.tanks].sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );

    return clone(sorted);
};

export const getTank = async (tankId: string): Promise<AquariumTank | null> => {
    await sleep(160);
    const db = await readDatabase();
    return clone(db.tanks.find((tank) => tank.id === tankId) ?? null);
};

export const createTank = async (payload: CreateTankPayload): Promise<AquariumTank> => {
    await sleep(320);
    const db = await readDatabase();
    const now = new Date().toISOString();

    const newTank: AquariumTank = {
        id: createId(),
        name: payload.name,
        size: payload.size,
        latestLayoutVersion: 0,
        createdAt: now,
        updatedAt: now,
    };

    db.tanks.push(newTank);
    writeDatabase(db);

    return clone(newTank);
};

export const updateTank = async (
    tankId: string,
    updates: UpdateTankPayload
): Promise<AquariumTank | null> => {
    await sleep(280);
    const db = await readDatabase();
    const index = db.tanks.findIndex((tank) => tank.id === tankId);
    if (index < 0) return null;

    const updatedTank: AquariumTank = {
        ...db.tanks[index],
        ...updates,
        id: tankId,
        updatedAt: new Date().toISOString(),
    };

    db.tanks[index] = updatedTank;
    writeDatabase(db);

    return clone(updatedTank);
};

export const deleteTank = async (tankId: string): Promise<boolean> => {
    await sleep(280);
    const db = await readDatabase();
    const before = db.tanks.length;

    db.tanks = db.tanks.filter((tank) => tank.id !== tankId);
    db.tankLayouts = db.tankLayouts.filter((layout) => layout.tankId !== tankId);
    writeDatabase(db);

    return db.tanks.length < before;
};

export const getTankLayouts = async (tankId: string): Promise<TankLayout[]> => {
    await sleep(180);
    const db = await readDatabase();

    const layouts = db.tankLayouts
        .filter((layout) => layout.tankId === tankId)
        .sort((a, b) => b.version - a.version);

    return clone(layouts);
};

export const getLatestTankLayout = async (tankId: string): Promise<TankLayout | null> => {
    const layouts = await getTankLayouts(tankId);
    return layouts[0] ?? null;
};

export const getTankLayoutByVersion = async (
    tankId: string,
    version: number
): Promise<TankLayout | null> => {
    await sleep(160);
    const db = await readDatabase();

    const layout = db.tankLayouts.find(
        (entry) => entry.tankId === tankId && entry.version === version
    );

    return clone(layout ?? null);
};

export const saveTankLayout = async (
    tankId: string,
    payload: UpsertTankLayoutPayload
): Promise<TankLayout> => {
    await sleep(340);
    const db = await readDatabase();
    const tankIndex = db.tanks.findIndex((tank) => tank.id === tankId);

    if (tankIndex < 0) {
        throw new Error(`Tank ${tankId} not found`);
    }

    const currentVersion = db.tankLayouts
        .filter((layout) => layout.tankId === tankId)
        .reduce((maxVersion, layout) => Math.max(maxVersion, layout.version), 0);

    const now = new Date().toISOString();
    const nextVersion = currentVersion + 1;

    const layout: TankLayout = {
        id: createId(),
        tankId,
        version: nextVersion,
        size: payload.size,
        items: payload.items,
        savedAt: now,
        updatedAt: now,
    };

    db.tankLayouts.push(layout);

    db.tanks[tankIndex] = {
        ...db.tanks[tankIndex],
        size: payload.size,
        latestLayoutVersion: nextVersion,
        updatedAt: now,
    };

    writeDatabase(db);

    return clone(layout);
};

export const updateTankLayout = async (
    tankId: string,
    layoutId: string,
    payload: UpsertTankLayoutPayload
): Promise<TankLayout | null> => {
    await sleep(320);
    const db = await readDatabase();
    const layoutIndex = db.tankLayouts.findIndex(
        (layout) => layout.id === layoutId && layout.tankId === tankId
    );

    if (layoutIndex < 0) {
        return null;
    }

    const now = new Date().toISOString();
    const currentLayout = db.tankLayouts[layoutIndex];

    const updatedLayout: TankLayout = {
        ...currentLayout,
        size: payload.size,
        items: payload.items,
        updatedAt: now,
        savedAt: now,
    };

    db.tankLayouts[layoutIndex] = updatedLayout;

    const tankIndex = db.tanks.findIndex((tank) => tank.id === tankId);
    if (tankIndex >= 0 && db.tanks[tankIndex].latestLayoutVersion === updatedLayout.version) {
        db.tanks[tankIndex] = {
            ...db.tanks[tankIndex],
            size: payload.size,
            updatedAt: now,
        };
    }

    writeDatabase(db);

    return clone(updatedLayout);
};
