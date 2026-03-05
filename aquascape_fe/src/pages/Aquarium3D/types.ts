export type AddedItemEvent = {
    type: "fish" | "decoration" | "image";
    sourceType?: string;
    category?: string;
    sourceName?: string;
    isFish: boolean;
};

export interface GameProgress {
    fish: number;
    plants: number;
    rocks: number;
    feeds: number;
}

export interface Quest {
    id: string;
    title: string;
    target: number;
    progress: number;
    reward: number;
    done: boolean;
}

export interface QuestDefinition {
    id: string;
    title: string;
    metric: keyof GameProgress;
    target: number;
    reward: number;
}

