import axios from "axios";
import type { AquariumConfig, TankPreset } from "@app/core/interface/aquarium.interface";

export const getAquariumConfigs = async (): Promise<AquariumConfig[]> => {
    try {
        const response = await axios.get('/mock-data.json');
        return response.data.aquariumConfigs;
    } catch (error) {
        console.error('Error fetching aquarium configs:', error);
        throw error;
    }
};

export const getAquariumConfig = async (id: string): Promise<AquariumConfig | null> => {
    await new Promise(resolve => setTimeout(resolve, 300));

    const configs = await getAquariumConfigs();
    return configs.find(config => config.id === id) || null;
};

export const createAquariumConfig = async (config: Omit<AquariumConfig, 'id' | 'createdAt' | 'updatedAt'>): Promise<AquariumConfig> => {
    try {
        const newConfig: AquariumConfig = {
            ...config,
            id: Date.now().toString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        return newConfig;
    } catch (error) {
        console.error('Error creating aquarium config:', error);
        throw error;
    }
};

export const updateAquariumConfig = async (id: string, updates: Partial<AquariumConfig>): Promise<AquariumConfig | null> => {
    await new Promise(resolve => setTimeout(resolve, 400));

    const existingConfig = await getAquariumConfig(id);
    if (!existingConfig) return null;

    return {
        ...existingConfig,
        ...updates,
        updatedAt: new Date().toISOString()
    };
};

export const deleteAquariumConfig = async (_id: string): Promise<boolean> => {
    try {
        return true;
    } catch (error) {
        console.error('Error deleting aquarium config:', error);
        throw error;
    }
};

export const getTankPresets = async (): Promise<TankPreset[]> => {
    try {
        const response = await axios.get('/mock-data.json');
        return response.data.tankPresets;
    } catch (error) {
        console.error('Error fetching tank presets:', error);
        throw error;
    }
};
