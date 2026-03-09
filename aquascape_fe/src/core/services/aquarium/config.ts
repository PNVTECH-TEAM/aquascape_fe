import { ACCESS_TOKEN, USER_PROFILE } from "@app/core/constants";

const BACKEND_BASE = `${import.meta.env.VITE_BACKEND_URL}`;

export const AQUARIUM_API_BASE = `${BACKEND_BASE}/api/v1/aquarium`;
export const USER_TANKS_API_BASE = `${BACKEND_BASE}/api/v1/user-tanks`;
export const FALLBACK_AQUARIUM_USER_ID = Number(import.meta.env.VITE_AQUARIUM_USER_ID ?? 1);

const parsePositiveNumber = (value: unknown): number | null => {
    const n = Number(value);
    return Number.isFinite(n) && n > 0 ? n : null;
};

const hashStringToPositiveNumber = (value: string): number => {
    let hash = 0;
    for (let i = 0; i < value.length; i += 1) {
        hash = (hash * 31 + value.charCodeAt(i)) | 0;
    }
    return Math.abs(hash) + 1;
};

const normalizeUserId = (value: unknown): number | null => {
    const numeric = parsePositiveNumber(value);
    if (numeric) return numeric;
    if (typeof value === "string" && value.trim()) {
        return hashStringToPositiveNumber(value.trim());
    }
    return null;
};

const decodeJwtPayload = (token: string): Record<string, unknown> | null => {
    try {
        const parts = token.split(".");
        if (parts.length < 2) return null;
        const base64Url = parts[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
        const json = atob(padded);
        return JSON.parse(json) as Record<string, unknown>;
    } catch {
        return null;
    }
};

const extractUserIdFromProfile = (profile: unknown): number | null => {
    if (!profile || typeof profile !== "object") return null;
    const candidate = profile as Record<string, unknown>;
    return (
        normalizeUserId(candidate.userId) ??
        normalizeUserId(candidate.id) ??
        normalizeUserId(candidate.email) ??
        normalizeUserId(candidate.username) ??
        normalizeUserId(candidate.user?.["id"]) ??
        normalizeUserId(candidate.user?.["userId"]) ??
        normalizeUserId(candidate.user?.["email"]) ??
        normalizeUserId(candidate.user?.["username"])
    );
};

const extractUserIdFromToken = (token: string): number | null => {
    const payload = decodeJwtPayload(token);
    if (!payload) return null;
    return (
        normalizeUserId(payload.userId) ??
        normalizeUserId(payload.id) ??
        normalizeUserId(payload.sub) ??
        normalizeUserId(payload.email) ??
        normalizeUserId(payload.username) ??
        normalizeUserId(payload.preferred_username) ??
        normalizeUserId((payload.user as Record<string, unknown> | undefined)?.id) ??
        normalizeUserId((payload.user as Record<string, unknown> | undefined)?.userId) ??
        normalizeUserId((payload.user as Record<string, unknown> | undefined)?.email)
    );
};

export const getCurrentAquariumUserId = (): number => {
    const profileRaw = localStorage.getItem(USER_PROFILE);
    if (profileRaw) {
        try {
            const parsed = JSON.parse(profileRaw);
            const profileUserId = extractUserIdFromProfile(parsed);
            if (profileUserId) return profileUserId;
        } catch {
            // ignore invalid profile payload
        }
    }

    const accessToken = localStorage.getItem(ACCESS_TOKEN);
    if (accessToken) {
        const tokenUserId = extractUserIdFromToken(accessToken);
        if (tokenUserId) return tokenUserId;
    }

    return FALLBACK_AQUARIUM_USER_ID;
};
