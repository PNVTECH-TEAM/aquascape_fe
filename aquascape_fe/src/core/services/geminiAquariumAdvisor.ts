import axios from "axios";

export interface AquariumAdviceRequest {
    fish: number;
    plants: number;
    rocks: number;
    feeds: number;
    totalItems: number;
    itemNames: string[];
}

export interface AquariumAdviceResponse {
    suggestion: string;
    reminder: string;
}

export class AquariumAdviceRateLimitError extends Error {
    retryAfterSeconds: number;

    constructor(retryAfterSeconds: number) {
        super("AI advice rate limited");
        this.name = "AquariumAdviceRateLimitError";
        this.retryAfterSeconds = retryAfterSeconds;
    }
}

const normalizeAquariumAdviceApiUrl = (rawUrl?: string): string => {
    const fallback = "/api/v1/aquarium/advice";
    if (!rawUrl?.trim()) return fallback;

    const normalized = rawUrl.trim().replace(/\/+$/, "");
    if (normalized.endsWith("/api/v1/aquarium/advice")) return normalized;

    // Support when shared env var is set to diagnosis endpoint.
    if (normalized.endsWith("/api/v1/diagnose")) {
        return normalized.replace(/\/api\/v1\/diagnose$/, "/api/v1/aquarium/advice");
    }

    return `${normalized}/api/v1/aquarium/advice`;
};

const BACKEND_URL = normalizeAquariumAdviceApiUrl(
    import.meta.env.VITE_AQUARIUM_ADVICE_API_URL ||
    import.meta.env.VITE_AQUARIUM_AI_API_URL ||
    import.meta.env.VITE_BACKEND_URL
);

let rateLimitUntilMs = 0;
const adviceCache = new Map<string, AquariumAdviceResponse>();

const buildCacheKey = (payload: AquariumAdviceRequest): string => {
    const names = Array.from(new Set(payload.itemNames.map((name) => name.trim()).filter(Boolean))).sort();
    return JSON.stringify({
        fish: payload.fish,
        plants: payload.plants,
        rocks: payload.rocks,
        feeds: payload.feeds,
        totalItems: payload.totalItems,
        names,
    });
};

export const isGeminiConfigured = (): boolean => true;

export const isAquariumAdviceRateLimitError = (
    error: unknown
): error is AquariumAdviceRateLimitError => error instanceof AquariumAdviceRateLimitError;

export const getAquariumAdviceFromAI = async (
    payload: AquariumAdviceRequest
): Promise<AquariumAdviceResponse> => {
    const cacheKey = buildCacheKey(payload);
    const cached = adviceCache.get(cacheKey);
    if (cached) return cached;

    if (Date.now() < rateLimitUntilMs) {
        const remainingSeconds = Math.max(1, Math.ceil((rateLimitUntilMs - Date.now()) / 1000));
        throw new AquariumAdviceRateLimitError(remainingSeconds);
    }

    try {
        const response = await axios.post(
            BACKEND_URL,
            payload,
            {
                headers: { "Content-Type": "application/json" },
                timeout: 20000,
            }
        );

        const advice = response.data?.data ?? response.data;
        const parsed: AquariumAdviceResponse = {
            suggestion: String(advice?.suggestion ?? "").trim() || "No suggestion.",
            reminder: String(advice?.reminder ?? "").trim() || "No reminder.",
        };

        adviceCache.set(cacheKey, parsed);
        return parsed;
    } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 429) {
            const retryAfter = Number.parseInt(String(error.response.headers?.["retry-after"] ?? "30"), 10);
            const retryAfterSeconds = Number.isNaN(retryAfter) || retryAfter <= 0 ? 30 : retryAfter;
            rateLimitUntilMs = Date.now() + retryAfterSeconds * 1000;
            throw new AquariumAdviceRateLimitError(retryAfterSeconds);
        }
        throw error;
    }
};
