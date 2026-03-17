import type { ChangeEvent, DragEvent, FormEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  downloadTripoAsset,
  generateTripoAsset,
  resolveTripoDownloadHref,
  type GenerateTripoAssetResponse,
  type TripoModelSaveFormat,
  type TripoQuality,
} from "@app/core/services/glbAPI";

export type GenerationStatus = "idle" | "loading" | "ready" | "error";
export type OptionalBool = "auto" | "true" | "false";

const formatFileBaseName = (fileName: string): string => {
  const trimmed = fileName.trim();
  if (!trimmed) return "tripo-model";
  const lastDot = trimmed.lastIndexOf(".");
  return lastDot > 0 ? trimmed.slice(0, lastDot) : trimmed;
};

const parseOptionalNumber = (raw: string): number | undefined => {
  const normalized = raw.trim();
  if (!normalized) return undefined;
  const value = Number(normalized);
  return Number.isFinite(value) ? value : undefined;
};

const parseOptionalBool = (raw: OptionalBool): boolean | undefined => {
  if (raw === "auto") return undefined;
  return raw === "true";
};

export function useTripoGenerator() {
  const { t } = useTranslation();

  const texts = {
    brand: t("TRIPO_GENERATOR.BRAND"),
    headerTitle: t("TRIPO_GENERATOR.HEADER_TITLE"),
    headerFormat: t("TRIPO_GENERATOR.HEADER_FORMAT"),
    reset: t("TRIPO_GENERATOR.RESET"),
    panelTitle: t("TRIPO_GENERATOR.PANEL_TITLE"),
    previewAlt: t("TRIPO_GENERATOR.ALT.PREVIEW"),
    dragDropHint: t("TRIPO_GENERATOR.DRAG_DROP_HINT"),
    takePhoto: t("TRIPO_GENERATOR.ACTIONS.TAKE_PHOTO"),
    chooseImage: t("TRIPO_GENERATOR.ACTIONS.CHOOSE_IMAGE"),
    formatLabel: t("TRIPO_GENERATOR.FORMAT.LABEL"),
    formatGlbStandard: t("TRIPO_GENERATOR.FORMAT.GLB_STANDARD"),
    formatObjMesh: t("TRIPO_GENERATOR.FORMAT.OBJ_MESH"),
    qualityLabel: t("TRIPO_GENERATOR.QUALITY.LABEL"),
    qualityFast: t("TRIPO_GENERATOR.QUALITY.FAST"),
    qualityBalanced: t("TRIPO_GENERATOR.QUALITY.BALANCED"),
    qualityHigh: t("TRIPO_GENERATOR.QUALITY.HIGH"),
    autoRemoveBg: t("TRIPO_GENERATOR.REMOVE_BG"),
    outputDir: t("TRIPO_GENERATOR.OUTPUT_DIR.LABEL"),
    outputDirPlaceholder: t("TRIPO_GENERATOR.OUTPUT_DIR.PLACEHOLDER"),
    foregroundRatio: t("TRIPO_GENERATOR.FOREGROUND_RATIO"),
    advancedShow: t("TRIPO_GENERATOR.ADVANCED.SHOW"),
    advancedHide: t("TRIPO_GENERATOR.ADVANCED.HIDE"),
    mcResolution: t("TRIPO_GENERATOR.ADVANCED.MC_RESOLUTION"),
    threshold: t("TRIPO_GENERATOR.ADVANCED.THRESHOLD"),
    bakeTexture: t("TRIPO_GENERATOR.ADVANCED.BAKE_TEXTURE.LABEL"),
    bakeTextureAuto: t("TRIPO_GENERATOR.ADVANCED.BAKE_TEXTURE.AUTO"),
    bakeTextureOn: t("TRIPO_GENERATOR.ADVANCED.BAKE_TEXTURE.ON"),
    bakeTextureOff: t("TRIPO_GENERATOR.ADVANCED.BAKE_TEXTURE.OFF"),
    textureResolution: t("TRIPO_GENERATOR.ADVANCED.TEXTURE_RESOLUTION"),
    chunkSize: t("TRIPO_GENERATOR.ADVANCED.CHUNK_SIZE"),
    autoPlaceholder: t("TRIPO_GENERATOR.ADVANCED.AUTO_PLACEHOLDER"),
    generate: t("TRIPO_GENERATOR.ACTIONS.GENERATE"),
    generating: t("TRIPO_GENERATOR.ACTIONS.GENERATING"),
    emptyState: t("TRIPO_GENERATOR.STATUS.EMPTY"),
    loadingTitle: t("TRIPO_GENERATOR.STATUS.LOADING_TITLE"),
    loadingSubtitle: t("TRIPO_GENERATOR.STATUS.LOADING_SUBTITLE"),
    success: t("TRIPO_GENERATOR.STATUS.SUCCESS"),
    downloadModel: t("TRIPO_GENERATOR.ACTIONS.DOWNLOAD_MODEL"),
    openDownloadLink: t("TRIPO_GENERATOR.ACTIONS.OPEN_DOWNLOAD_LINK"),
    errorFallback: t("TRIPO_GENERATOR.ERRORS.FALLBACK"),
    cameraTitle: t("TRIPO_GENERATOR.CAMERA.TITLE"),
    cameraClose: t("TRIPO_GENERATOR.CAMERA.CLOSE"),
    cameraCancel: t("TRIPO_GENERATOR.CAMERA.CANCEL"),
    cameraCapture: t("TRIPO_GENERATOR.CAMERA.CAPTURE"),
  };

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [status, setStatus] = useState<GenerationStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [generation, setGeneration] = useState<GenerateTripoAssetResponse | null>(null);

  const [modelSaveFormat, setModelSaveFormat] = useState<Extract<TripoModelSaveFormat, "glb" | "obj">>("glb");
  const [quality, setQuality] = useState<TripoQuality>("balanced");
  const [outputDir, setOutputDir] = useState<string>("output");
  const [removeBg, setRemoveBg] = useState<boolean>(true);
  const [foregroundRatio, setForegroundRatio] = useState<number>(0.85);
  const [mcResolution, setMcResolution] = useState<string>("");
  const [threshold, setThreshold] = useState<string>("");
  const [bakeTexture, setBakeTexture] = useState<OptionalBool>("auto");
  const [textureResolution, setTextureResolution] = useState<string>("");
  const [chunkSize, setChunkSize] = useState<string>("");
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState<boolean>(false);

  const previewUrl = useMemo(() => (imageFile ? URL.createObjectURL(imageFile) : ""), [imageFile]);
  const baseName = useMemo(() => (imageFile ? formatFileBaseName(imageFile.name) : "tripo-model"), [imageFile]);
  const canGenerate = useMemo(() => Boolean(imageFile) && status !== "loading", [imageFile, status]);

  const stopCameraStream = () => {
    if (!cameraStreamRef.current) return;
    cameraStreamRef.current.getTracks().forEach((track) => track.stop());
    cameraStreamRef.current = null;
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  useEffect(() => {
    if (!previewUrl) return;
    return () => URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  useEffect(() => () => stopCameraStream(), []);

  const resetGenerationState = () => {
    setGeneration(null);
    setErrorMessage("");
    setStatus("idle");
  };

  const handleChooseFile = () => fileInputRef.current?.click();

  const handleFileSelected = (file: File | null) => {
    setImageFile(file);
    setErrorMessage("");
    setGeneration(null);
    setStatus("idle");
  };

  const handleSelectImage = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    handleFileSelected(file);
    event.target.value = "";
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0] ?? null;
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setErrorMessage(t("TRIPO_GENERATOR.ERRORS.INVALID_FILE"));
      return;
    }
    handleFileSelected(file);
  };

  const handleOpenCamera = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      cameraInputRef.current?.click();
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });
      cameraStreamRef.current = stream;
      setIsCameraOpen(true);
      setErrorMessage("");

      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          void videoRef.current.play();
        }
      }, 0);
    } catch {
      cameraInputRef.current?.click();
      setErrorMessage(t("TRIPO_GENERATOR.ERRORS.CAMERA_OPEN_FAILED"));
    }
  };

  const handleCloseCamera = () => {
    setIsCameraOpen(false);
    stopCameraStream();
  };

  const handleCaptureFromWebcam = async () => {
    const videoElement = videoRef.current;
    const canvasElement = canvasRef.current;
    if (!videoElement || !canvasElement) return;

    const width = videoElement.videoWidth;
    const height = videoElement.videoHeight;
    if (!width || !height) {
      setErrorMessage(t("TRIPO_GENERATOR.ERRORS.FRAME_UNAVAILABLE"));
      return;
    }

    canvasElement.width = width;
    canvasElement.height = height;
    const context = canvasElement.getContext("2d");
    if (!context) return;
    context.drawImage(videoElement, 0, 0, width, height);

    const blob = await new Promise<Blob | null>((resolve) => {
      canvasElement.toBlob((value) => resolve(value), "image/jpeg", 0.92);
    });

    if (!blob) {
      setErrorMessage(t("TRIPO_GENERATOR.ERRORS.CAPTURE_FAILED"));
      return;
    }

    const capturedFile = new File([blob], `tripo-capture-${Date.now()}.jpg`, {
      type: "image/jpeg",
    });

    handleFileSelected(capturedFile);
    handleCloseCamera();
  };

  const downloadHref = useMemo(() => {
    if (!generation) return "";

    const downloadUrlOrJobId = generation.download_url || generation.job_id;
    return resolveTripoDownloadHref(downloadUrlOrJobId, {
      format: modelSaveFormat,
      name: baseName,
      outputDir: outputDir.trim() || undefined,
    });
  }, [baseName, generation, modelSaveFormat, outputDir]);

  const handleGenerate = async (event: FormEvent) => {
    event.preventDefault();
    if (!imageFile) {
      setErrorMessage(t("TRIPO_GENERATOR.ERRORS.MISSING_IMAGE"));
      return;
    }

    setStatus("loading");
    setErrorMessage("");
    setGeneration(null);

    try {
      const response = await generateTripoAsset({
        image: imageFile,
        modelSaveFormat,
        outputDir: outputDir.trim() || undefined,
        removeBg,
        foregroundRatio,
        quality,
        mcResolution: parseOptionalNumber(mcResolution),
        threshold: parseOptionalNumber(threshold),
        bakeTexture: parseOptionalBool(bakeTexture),
        textureResolution: parseOptionalNumber(textureResolution),
        chunkSize: parseOptionalNumber(chunkSize),
      });

      setGeneration(response);
      setStatus("ready");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : t("TRIPO_GENERATOR.ERRORS.GENERATE_FAILED");
      setErrorMessage(message);
      setStatus("error");
    }
  };

  const handleDownload = async () => {
    if (!generation) return;

    try {
      const downloadUrlOrJobId = generation.download_url || generation.job_id;
      const blob = await downloadTripoAsset(downloadUrlOrJobId, {
        format: modelSaveFormat,
        name: baseName,
        outputDir: outputDir.trim() || undefined,
      });

      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `${baseName}.${modelSaveFormat}`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : t("TRIPO_GENERATOR.ERRORS.DOWNLOAD_FAILED");
      setErrorMessage(message);
      setStatus("error");
    }
  };

  return {
    texts,
    imageFile,
    status,
    errorMessage,
    generation,
    modelSaveFormat,
    setModelSaveFormat,
    quality,
    setQuality,
    outputDir,
    setOutputDir,
    removeBg,
    setRemoveBg,
    foregroundRatio,
    setForegroundRatio,
    mcResolution,
    setMcResolution,
    threshold,
    setThreshold,
    bakeTexture,
    setBakeTexture,
    textureResolution,
    setTextureResolution,
    chunkSize,
    setChunkSize,
    showAdvanced,
    setShowAdvanced,
    fileInputRef,
    cameraInputRef,
    videoRef,
    canvasRef,
    isCameraOpen,
    previewUrl,
    baseName,
    canGenerate,
    downloadHref,
    resetGenerationState,
    handleChooseFile,
    handleSelectImage,
    handleDrop,
    handleOpenCamera,
    handleCloseCamera,
    handleCaptureFromWebcam,
    handleGenerate,
    handleDownload,
  };
}

