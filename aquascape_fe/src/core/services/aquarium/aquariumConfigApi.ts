import axios from "axios";
import type { AquariumConfig } from "@app/core/interface/aquarium.interface";

export const getAquariumConfigs = async (): Promise<AquariumConfig[]> => {
    const response = await axios.get<AquariumConfig[]>("/aquarium/configs");
    return response.data;
};

export const getAquariumConfig = async (id: string): Promise<AquariumConfig | null> => {
    const response = await axios.get<AquariumConfig | null>(`/aquarium/configs/${id}`);
    return response.data;
};

export const createAquariumConfig = async (
    config: Omit<AquariumConfig, "id" | "createdAt" | "updatedAt">
): Promise<AquariumConfig> => {
    const response = await axios.post<AquariumConfig>("/aquarium/configs", config);
    return response.data;
};

export const updateAquariumConfig = async (
    id: string,
    updates: Partial<AquariumConfig>
): Promise<AquariumConfig | null> => {
    const response = await axios.put<AquariumConfig | null>(
        `/aquarium/configs/${id}`,
        updates
    );
    return response.data;
};

export const deleteAquariumConfig = async (id: string): Promise<boolean> => {
    await axios.delete(`/aquarium/configs/${id}`);
    return true;
};
