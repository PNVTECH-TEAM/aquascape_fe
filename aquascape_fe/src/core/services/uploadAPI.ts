import axios from "axios";

type UploadGlbRequest = {
    name: string;
    glbFile: File;
    previewImage: File;
    onProgress?: (percent: number) => void;
};

type UploadGlbResponse = {
    id: string;
    name: string;
    glbUrl: string;
    previewImageUrl: string;
};

export const uploadGlb = async (request: UploadGlbRequest): Promise<UploadGlbResponse> => {
    const formData = new FormData();
    formData.append("name", request.name);
    formData.append("glbFile", request.glbFile);
    formData.append("previewImage", request.previewImage);

    const response = await axios.post("/user-assets", formData, {
        onUploadProgress: (progressEvent) => {
            if (request.onProgress && progressEvent.total) {
                const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                request.onProgress(percent);
            }
        },
    });
    return response.data;
};

export const getUserAssets = async (): Promise<UploadGlbResponse[]> => {
    const response = await axios.get("/user-assets");
    return response.data;
};

export const deleteUserAsset = async (id: string): Promise<void> => {
    await axios.delete(`/user-assets/${id}`);
};
