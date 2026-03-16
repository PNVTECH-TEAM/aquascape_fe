import axios from "axios";
import type {
    AquariumTank,
    CreateTankPayload,
    TankLayout,
    UpdateTankPayload,
    UpsertTankLayoutPayload,
    TankMetadata,
    TankLayoutDetail,
} from "@app/core/interface/aquarium.interface";
import { mapUserTankToAquariumTank, mapUserTankToLayout } from "./mappers";
import type { ListEnvelope, SaveUserTankRequest, UserTankDto } from "./types";
import { clone, createId, unwrapList } from "./utils";

const fetchUserTanks = async (): Promise<UserTankDto[]> => {
    const response = await axios.get<ListEnvelope<UserTankDto>>("/user-tanks");
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
        previewImageUrl: payload.previewImageUrl,
        presetId: payload.presetId,
    };

    const response = await axios.post<UserTankDto>("/user-tanks", body);

    return clone(mapUserTankToAquariumTank(response.data, payload.size));
};

export const updateTank = async (
    tankId: string,
    updates: UpdateTankPayload
): Promise<AquariumTank | null> => {
    const body: SaveUserTankRequest = {
        id: tankId,
        name: updates.name,
        previewImageUrl: updates.previewImageUrl,
    };

    const response = await axios.post<UserTankDto>("/user-tanks", body);

    return clone(mapUserTankToAquariumTank(response.data, updates.size));
};

export const deleteTank = async (tankId: string): Promise<boolean> => {
    await axios.delete(`/user-tanks/${tankId}`);
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
        name: payload.name,
        previewImageUrl: payload.previewImageUrl,
        presetId: payload.presetId,
    };

    const response = await axios.post<UserTankDto>("/user-tanks", body);

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

export const getTankVersions = async (presetId: string): Promise<TankMetadata[]> => {
    const response = await axios.get<TankMetadata[]>("/user-tanks/versions", {
        params: { presetId }
    });
    return response.data;
};

export const getTankLayoutDetail = async (layoutId: string): Promise<TankLayoutDetail> => {
    const response = await axios.get<TankLayoutDetail>(`/user-tanks/layouts/${layoutId}`);
    return response.data;
};
