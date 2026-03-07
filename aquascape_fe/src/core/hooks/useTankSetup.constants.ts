export const WATER_LEVEL = 0.9;
export const GLASS_THICKNESS = 0.8;
export const FEED_ORBIT_LOOPS = 3;
export const FEED_ORBIT_DURATION_SECONDS = 4.5;

export const isFishUrl = (url: string): boolean => {
    const lowerUrl = url.toLowerCase();
    return lowerUrl.includes('fish') || lowerUrl.includes('goldfish');
};
