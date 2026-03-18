import axios from "axios";

export type TripoQuality = "fast" | "balanced" | "quality";
export type TripoModelSaveFormat = "glb" | "obj" | "ply";

export interface TripoGenerationSettings {
    image: File;
    removeBg: boolean;
    foregroundRatio: number;
    quality: TripoQuality;
    outputDir?: string;
    mcResolution?: number;
    threshold?: number;
    bakeTexture?: boolean;
    textureResolution?: number;
    chunkSize?: number;
}

export interface GenerateGlbRequest extends TripoGenerationSettings {}

export interface GenerateTripoAssetRequest extends TripoGenerationSettings {
    modelSaveFormat?: TripoModelSaveFormat;
}

export interface GenerateTripoAssetResponse {
    job_id: string;
    mesh_path?: string;
    download_url?: string;
    settings?: Record<string, unknown>;
}

export interface TripoHealthResponse {
    status?: string;
    [key: string]: unknown;
}

const DEFAULT_TRIPO_PATH = "/tripo";

const shouldUseDevProxy = (rawBaseUrl: string): boolean => {
    if (!import.meta.env.DEV) {
        return false;
    }

    try {
        const parsedUrl = new URL(rawBaseUrl);
        return ["localhost", "127.0.0.1"].includes(parsedUrl.hostname);
    } catch {
        return false;
    }
};

const normalizeTripoBaseUrl = (rawBaseUrl?: string): string => {
    const trimmed = String(rawBaseUrl ?? "").trim();
    if (!trimmed) {
        return DEFAULT_TRIPO_PATH;
    }

    if (shouldUseDevProxy(trimmed)) {
        return DEFAULT_TRIPO_PATH;
    }

    const normalized = trimmed.replace(/\/+$/, "");

    if (/\/tripo$/i.test(normalized)) {
        return normalized;
    }

    if (/\/generate-glb$/i.test(normalized)) {
        return normalized.replace(/\/generate-glb$/i, "");
    }

    if (/\/generate$/i.test(normalized)) {
        return normalized.replace(/\/generate$/i, "");
    }

    if (/^https?:\/\//i.test(normalized)) {
        return `${normalized}/tripo`;
    }

    const relativePath = normalized.startsWith("/") ? normalized : `/${normalized}`;
    return `${relativePath}/tripo`;
};

const TRIPO_BASE_URL = normalizeTripoBaseUrl(
    import.meta.env.VITE_TRIPO_API_URL ||
    import.meta.env.VITE_AQUARIUM_AI_API_URL ||
    import.meta.env.VITE_BACKEND_URL
);

const tripoHttp = axios.create({
    baseURL: TRIPO_BASE_URL,
});

const GENERATION_TIMEOUT_MS = 600000;

const logTripoRequest = (label: string, path: string, formData?: FormData) => {
    const payload = formData
        ? Array.from(formData.entries()).map(([key, value]) => ({
            key,
            value:
                value instanceof File
                    ? {
                        name: value.name,
                        type: value.type,
                        size: value.size,
                    }
                    : value,
        }))
        : [];

    console.warn(`[Tripo API] ${label}`);
    console.warn("[Tripo API] baseURL:", TRIPO_BASE_URL);
    console.warn("[Tripo API] url:", `${TRIPO_BASE_URL}${path}`);
    console.warn("[Tripo API] method:", "POST");
    console.warn("[Tripo API] payload:", payload);
};

const createGenerationFormData = (
    request: TripoGenerationSettings,
    modelSaveFormat?: TripoModelSaveFormat
): FormData => {
    const formData = new FormData();
    formData.append("image", request.image);
    formData.append("remove_bg", String(request.removeBg));
    formData.append("foreground_ratio", String(request.foregroundRatio));
    formData.append("quality", request.quality);

    if (request.outputDir) {
        formData.append("output_dir", request.outputDir);
    }

    if (typeof request.mcResolution === "number") {
        formData.append("mc_resolution", String(request.mcResolution));
    }

    if (typeof request.threshold === "number") {
        formData.append("threshold", String(request.threshold));
    }

    if (typeof request.bakeTexture === "boolean") {
        formData.append("bake_texture", String(request.bakeTexture));
    }

    if (typeof request.textureResolution === "number") {
        formData.append("texture_resolution", String(request.textureResolution));
    }

    if (typeof request.chunkSize === "number") {
        formData.append("chunk_size", String(request.chunkSize));
    }

    if (modelSaveFormat) {
        formData.append("model_save_format", modelSaveFormat);
    }

    return formData;
};

const resolveTripoRequestUrl = (pathOrUrl: string): string => {
    if (/^https?:\/\//i.test(pathOrUrl)) {
        return pathOrUrl;
    }

    if (pathOrUrl.startsWith("/")) {
        return pathOrUrl.replace(/^\/tripo/i, "");
    }

    return `/${pathOrUrl.replace(/^\/+/, "")}`;
};

export const generateGlbFromImage = async (
    request: GenerateGlbRequest
): Promise<Blob> => {
    const formData = createGenerationFormData(request);
    logTripoRequest("generate-glb", "/generate-glb", formData);

    const response = await tripoHttp.post("/generate-glb", formData, {
        responseType: "blob",
        timeout: GENERATION_TIMEOUT_MS,
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });

    return response.data;
};

export const generateTripoAsset = async (
    request: GenerateTripoAssetRequest
): Promise<GenerateTripoAssetResponse> => {
    const formData = createGenerationFormData(request, request.modelSaveFormat ?? "glb");
    logTripoRequest("generate", "/generate", formData);

    const response = await tripoHttp.post(
        "/generate",
        formData,
        {
            timeout: GENERATION_TIMEOUT_MS,
            headers: {
                "Content-Type": "multipart/form-data",
            },
        }
    );

    return response.data;
};

export const buildTripoDownloadUrl = (
    jobId: string,
    options?: { format?: TripoModelSaveFormat; name?: string; outputDir?: string }
): string => {
    const searchParams = new URLSearchParams();

    if (options?.format) {
        searchParams.set("format", options.format);
    }

    if (options?.name) {
        searchParams.set("name", options.name);
    }

    if (options?.outputDir) {
        searchParams.set("output_dir", options.outputDir);
    }

    const queryString = searchParams.toString();
    const downloadUrl = `/download/${jobId}`;

    return queryString ? `${downloadUrl}?${queryString}` : downloadUrl;
};

export const resolveTripoDownloadHref = (
    downloadUrlOrJobId: string,
    options?: { format?: TripoModelSaveFormat; name?: string; outputDir?: string }
): string => {
    if (/^https?:\/\//i.test(downloadUrlOrJobId)) {
        return downloadUrlOrJobId;
    }

    const relativeUrl = downloadUrlOrJobId.startsWith("/")
        ? resolveTripoRequestUrl(downloadUrlOrJobId)
        : buildTripoDownloadUrl(downloadUrlOrJobId, options);

    if (/^https?:\/\//i.test(TRIPO_BASE_URL)) {
        return `${TRIPO_BASE_URL}${relativeUrl}`;
    }

    return `/tripo${relativeUrl}`;
};

export const downloadTripoAsset = async (
    downloadUrlOrJobId: string,
    options?: { format?: TripoModelSaveFormat; name?: string; outputDir?: string }
): Promise<Blob> => {
    const requestUrl =
        /^https?:\/\//i.test(downloadUrlOrJobId) || downloadUrlOrJobId.startsWith("/")
            ? resolveTripoRequestUrl(downloadUrlOrJobId)
            : buildTripoDownloadUrl(downloadUrlOrJobId, options);

    const response = await tripoHttp.get(requestUrl, {
        responseType: "blob",
        timeout: 120000,
    });

    return response.data;
};
