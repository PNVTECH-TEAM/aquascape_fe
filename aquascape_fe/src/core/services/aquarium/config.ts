const BACKEND_BASE = `${import.meta.env.VITE_BACKEND_URL}`;

export const AQUARIUM_API_BASE = `${BACKEND_BASE}/api/v1/aquarium`;
export const USER_TANKS_API_BASE = `${BACKEND_BASE}/api/v1/user-tanks`;
export const DEFAULT_USER_ID = Number(import.meta.env.VITE_AQUARIUM_USER_ID ?? 1);
