import axios from "axios";

// Mock data for aquarium configurations
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

// API functions using axios to fetch from mock-data.json
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
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    const configs = await getAquariumConfigs();
    return configs.find(config => config.id === id) || null;
};

export const createAquariumConfig = async (config: Omit<AquariumConfig, 'id' | 'createdAt' | 'updatedAt'>): Promise<AquariumConfig> => {
    try {
        // In a real API, this would be a POST request
        // For mock purposes, we'll simulate creating a new config
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
    // Simulate API delay
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
        // In a real API, this would be a DELETE request
        // For mock purposes, we'll simulate deleting the config
        return true;
    } catch (error) {
        console.error('Error deleting aquarium config:', error);
        throw error;
    }
};

// Tank size presets API
export interface TankPreset {
    id: string;
    name: string;
    size: {
        width: number;
        height: number;
        depth: number;
    };
}

export const getTankPresets = async (): Promise<TankPreset[]> => {
    try {
        const response = await axios.get('/mock-data.json');
        return response.data.tankPresets;
    } catch (error) {
        console.error('Error fetching tank presets:', error);
        throw error;
    }
};
