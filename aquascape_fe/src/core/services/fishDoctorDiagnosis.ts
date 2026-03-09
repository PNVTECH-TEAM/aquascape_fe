import axios from "axios";

export interface FishDiagnosis {
    inference_id: string;
    label_code: string;
    disease_name: string;
    confidence: number;
    source: string;
    vision_note?: string;
}

export interface FishDoctorVisualReference {
    image_url: string;
    description?: string;
}

export interface FishDoctorTreatment {
    name: string;
    image?: string;
    link?: string;
    price?: string;
    description?: string;
}

export interface FishDoctorDiagnosisResult {
    diagnosis: FishDiagnosis;
    doctor_advice: string;
    visual_reference?: FishDoctorVisualReference;
    suggested_treatments?: FishDoctorTreatment[];
}

export interface FishDoctorDiagnosisApiResponse {
    status: string;
    data: FishDoctorDiagnosisResult;
}

const normalizeDiagnosisApiUrl = (rawUrl?: string): string => {
    const fallback = "/api/v1/diagnose";
    if (!rawUrl?.trim()) return fallback;

    const normalized = rawUrl.trim().replace(/\/+$/, "");
    if (normalized.endsWith("/api/v1/diagnose")) return normalized;

    return `${normalized}/api/v1/diagnose`;
};

const FISH_DOCTOR_DIAGNOSIS_API_URL = normalizeDiagnosisApiUrl(
    import.meta.env.VITE_FISH_DOCTOR_DIAGNOSIS_API_URL ||
    import.meta.env.VITE_AQUARIUM_AI_API_URL ||
    import.meta.env.VITE_BACKEND_URL
);

const getApiErrorMessage = (error: unknown): string => {
    if (!axios.isAxiosError(error)) return "Unknown diagnosis error.";

    if (error.code === "ECONNABORTED") {
        return "AI diagnosis timeout. Server can be cold-starting, please retry.";
    }

    if (!error.response) {
        return "Cannot reach diagnosis API. Check network/server/CORS.";
    }

    const detail = error.response?.data?.detail;

    if (typeof detail === "string" && detail.trim()) {
        return detail;
    }

    if (Array.isArray(detail) && detail.length > 0) {
        const first = detail[0];
        if (typeof first === "string") return first;
        if (first?.msg) return String(first.msg);
    }

    return error.message || "Diagnosis request failed.";
};

export const diagnoseFishDiseaseFromImage = async (
    imageFile: File,
    userPrompt?: string
): Promise<FishDoctorDiagnosisResult> => {

    const formData = new FormData();
    formData.append("file", imageFile);

    if (userPrompt?.trim()) {
        formData.append("user_prompt", userPrompt.trim());
    }

    try {
        const response = await axios.post<FishDoctorDiagnosisApiResponse>(
            FISH_DOCTOR_DIAGNOSIS_API_URL,
            formData,
            {
                timeout: 200000
            }
        );

        const payload = response.data;

        if (!payload?.data?.diagnosis) {
            throw new Error("Invalid diagnosis response payload.");
        }

        return payload.data;

    } catch (error) {
        throw new Error(getApiErrorMessage(error));
    }
};
