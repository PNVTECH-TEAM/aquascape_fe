import axios from "axios";
import type {
    AquariumTank,
    CreateTankPayload,
    TankLayout,
    UpdateTankPayload,
    UpsertTankLayoutPayload,
} from "@app/core/interface/aquarium.interface";
import { getCurrentAquariumUserId, USER_TANKS_API_BASE } from "./config";
import { mapUserTankToAquariumTank, mapUserTankToLayout } from "./mappers";
import type { ListEnvelope, SaveUserTankRequest, UserTankDto } from "./types";
import { clone, createId, unwrapList } from "./utils";

const fetchUserTanks = async (): Promise<UserTankDto[]> => {
    const response = await axios.get<ListEnvelope<UserTankDto>>(USER_TANKS_API_BASE, {
        params: { userId: getCurrentAquariumUserId() },
    });
    return unwrapList(response.data);
};

export const getTanks = async (): Promise<AquariumTank[]> => {
    const tanks = await fetchUserTanks();
    const mapped = tanks.map((tank) => mapUserTankToAquariumTank(tank));
    const sorted = mapped.sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
    return clone(sorted);
};

export const getTank = async (tankId: string): Promise<AquariumTank | null> => {
    const tanks = await fetchUserTanks();
    const tank = tanks.find((entry) => entry.id === tankId);
    return clone(tank ? mapUserTankToAquariumTank(tank) : null);
};

export const createTank = async (payload: CreateTankPayload): Promise<AquariumTank> => {
    const body: SaveUserTankRequest = {
        name: payload.name,
    };

    const response = await axios.post<UserTankDto>(USER_TANKS_API_BASE, body, {
        params: { userId: getCurrentAquariumUserId() },
    });

    return clone(mapUserTankToAquariumTank(response.data, payload.size));
};

export const updateTank = async (
    tankId: string,
    updates: UpdateTankPayload
): Promise<AquariumTank | null> => {
    const body: SaveUserTankRequest = {
        id: tankId,
        name: updates.name,
    };

    const response = await axios.post<UserTankDto>(USER_TANKS_API_BASE, body, {
        params: { userId: getCurrentAquariumUserId() },
    });

    return clone(mapUserTankToAquariumTank(response.data, updates.size));
};

export const deleteTank = async (tankId: string): Promise<boolean> => {
    await axios.delete(`${USER_TANKS_API_BASE}/${tankId}`, {
        params: { userId: getCurrentAquariumUserId() },
    });
    return true;
};

export const getTankLayouts = async (tankId: string): Promise<TankLayout[]> => {
    const tanks = await fetchUserTanks();
    const tank = tanks.find((entry) => entry.id === tankId);
    if (!tank) return [];

    const layout = mapUserTankToLayout(tank);
    if (!layout) return [];

    return [clone(layout)];
};

export const getLatestTankLayout = async (tankId: string): Promise<TankLayout | null> => {
    const layouts = await getTankLayouts(tankId);
    return layouts[0] ?? null;
};

export const getTankLayoutByVersion = async (
    tankId: string,
    version: number
): Promise<TankLayout | null> => {
    const layouts = await getTankLayouts(tankId);
    return layouts.find((layout) => layout.version === version) ?? null;
};

export const saveTankLayout = async (
    tankId: string,
    payload: UpsertTankLayoutPayload
): Promise<TankLayout> => {
    const body: SaveUserTankRequest = {
        id: tankId,
        items: payload.items,
    };

    const response = await axios.post<UserTankDto>(USER_TANKS_API_BASE, body, {
        params: { userId: getCurrentAquariumUserId() },
    });

    const mapped = mapUserTankToLayout(response.data, payload.size);
    if (mapped) {
        return clone(mapped);
    }

    const now = new Date().toISOString();
    return clone({
        id: createId(),
        tankId,
        version: response.data.latestLayoutVersion ?? 1,
        size: payload.size,
        items: payload.items,
        savedAt: now,
        updatedAt: now,
    });
};

export const updateTankLayout = async (
    tankId: string,
    _layoutId: string,
    payload: UpsertTankLayoutPayload
): Promise<TankLayout | null> => saveTankLayout(tankId, payload);
