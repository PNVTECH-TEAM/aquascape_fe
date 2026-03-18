import type { ChangeEvent, DragEvent, FormEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  downloadTripoAsset,
  generateTripoAsset,
  resolveTripoDownloadHref,
  type GenerateTripoAssetResponse,
  type TripoModelSaveFormat,
  type TripoQuality,
} from "@app/core/services/glbAPI";

type GenerationStatus = "idle" | "loading" | "ready" | "error";
type OptionalBool = "auto" | "true" | "false";

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

export default function TripoGeneratorPage() {
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
      setErrorMessage("File không hợp lệ. Vui lòng chọn ảnh (png/jpg/webp...).");
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
      setErrorMessage("Không thể mở camera trong trình duyệt. Thử chụp từ thiết bị.");
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
      setErrorMessage("Chưa đọc được khung hình camera. Vui lòng thử lại.");
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
      setErrorMessage("Chụp ảnh thất bại. Vui lòng thử lại.");
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
      setErrorMessage("Vui lòng chọn/chụp ảnh trước khi generate.");
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
          : "Không thể generate model. Vui lòng thử lại.";
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
          : "Download thất bại. Vui lòng thử lại.";
      setErrorMessage(message);
      setStatus("error");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 px-4 py-8">
      <div className="mx-auto w-full max-w-5xl">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-sky-300/80">TripoSR</div>
            <h1 className="text-2xl font-extrabold tracking-tight">
              3D Generator <span className="text-sky-400">GLB/OBJ</span>
            </h1>
          </div>

          <button
            type="button"
            onClick={resetGenerationState}
            className="rounded-full border border-sky-400/25 bg-white/5 px-4 py-2 text-sm font-semibold text-sky-100 hover:bg-white/10 active:scale-[0.99]"
          >
            Reset
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-md">
            <h2 className="mb-6 flex items-center gap-2 text-lg font-bold">
              <span className="text-sky-400">⚡</span> TripoSR 3D Gen
            </h2>

            <form onSubmit={handleGenerate} className="space-y-4">
              <div
                onClick={handleChooseFile}
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                className="group cursor-pointer rounded-xl border-2 border-dashed border-slate-700 p-6 text-center transition-colors hover:border-sky-500"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleSelectImage}
                />

                <input
                  ref={cameraInputRef}
                  type="file"
                  className="hidden"
                  accept="image/*"
                  capture="environment"
                  onChange={handleSelectImage}
                />

                {previewUrl ? (
                  <div className="mb-3">
                    <img
                      src={previewUrl}
                      alt="preview"
                      className="mx-auto max-h-44 rounded-lg border border-white/10 object-contain shadow-lg"
                    />
                    <div className="mt-2 truncate px-2 text-xs text-slate-400">{imageFile?.name}</div>
                  </div>
                ) : (
                  <div>
                    <div className="mb-2 text-4xl transition-transform group-hover:scale-110">📸</div>
                    <p className="text-sm text-slate-400">Kéo thả hoặc click để chọn ảnh</p>
                  </div>
                )}

                <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      void handleOpenCamera();
                    }}
                    className="rounded-full bg-slate-900/70 px-4 py-2 text-xs font-semibold text-slate-100 ring-1 ring-white/10 hover:bg-slate-900"
                  >
                    Chụp ảnh
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleChooseFile();
                    }}
                    className="rounded-full bg-slate-900/70 px-4 py-2 text-xs font-semibold text-slate-100 ring-1 ring-white/10 hover:bg-slate-900"
                  >
                    Chọn ảnh
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <label className="mb-1 block text-slate-400">Định dạng</label>
                  <select
                    value={modelSaveFormat}
                    onChange={(e) => setModelSaveFormat(e.target.value as "glb" | "obj")}
                    className="w-full rounded bg-slate-900/60 px-2 py-2 ring-1 ring-white/10 focus:outline-none focus:ring-sky-500/60"
                  >
                    <option value="glb">GLB (Standard)</option>
                    <option value="obj">OBJ (Mesh)</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-slate-400">Chất lượng</label>
                  <select
                    value={quality}
                    onChange={(e) => setQuality(e.target.value as TripoQuality)}
                    className="w-full rounded bg-slate-900/60 px-2 py-2 ring-1 ring-white/10 focus:outline-none focus:ring-sky-500/60"
                  >
                    <option value="fast">Fast</option>
                    <option value="balanced">Balanced</option>
                    <option value="quality">High Quality</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="flex items-center gap-2 text-sm text-slate-300">
                  <input
                    type="checkbox"
                    checked={removeBg}
                    onChange={(e) => setRemoveBg(e.target.checked)}
                    className="h-4 w-4 accent-sky-500"
                  />
                  Tự động xoá phông
                </label>

                <div>
                  <label className="mb-1 block text-sm text-slate-400">Output dir</label>
                  <input
                    value={outputDir}
                    onChange={(e) => setOutputDir(e.target.value)}
                    className="w-full rounded bg-slate-900/60 px-3 py-2 text-sm text-slate-100 ring-1 ring-white/10 focus:outline-none focus:ring-sky-500/60"
                    placeholder="output"
                  />
                </div>
              </div>

              <div>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <label className="text-slate-400">Foreground ratio</label>
                  <span className="font-mono text-xs text-slate-300">{foregroundRatio.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min={0.1}
                  max={1}
                  step={0.01}
                  value={foregroundRatio}
                  onChange={(e) => setForegroundRatio(Number(e.target.value))}
                  className="w-full accent-sky-500"
                />
              </div>

              <button
                type="button"
                onClick={() => setShowAdvanced((prev) => !prev)}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-100 hover:bg-white/10"
              >
                {showAdvanced ? "Ẩn nâng cao" : "Tuỳ chọn nâng cao"}
              </button>

              {showAdvanced ? (
                <div className="grid grid-cols-1 gap-3 rounded-xl border border-white/10 bg-slate-950/40 p-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs text-slate-400">MC resolution</label>
                    <input
                      value={mcResolution}
                      onChange={(e) => setMcResolution(e.target.value)}
                      inputMode="numeric"
                      className="w-full rounded bg-slate-900/60 px-3 py-2 text-sm ring-1 ring-white/10 focus:outline-none focus:ring-sky-500/60"
                      placeholder="(auto)"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-slate-400">Threshold</label>
                    <input
                      value={threshold}
                      onChange={(e) => setThreshold(e.target.value)}
                      inputMode="decimal"
                      className="w-full rounded bg-slate-900/60 px-3 py-2 text-sm ring-1 ring-white/10 focus:outline-none focus:ring-sky-500/60"
                      placeholder="(auto)"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-slate-400">Bake texture</label>
                    <select
                      value={bakeTexture}
                      onChange={(e) => setBakeTexture(e.target.value as OptionalBool)}
                      className="w-full rounded bg-slate-900/60 px-2 py-2 text-sm ring-1 ring-white/10 focus:outline-none focus:ring-sky-500/60"
                    >
                      <option value="auto">Auto</option>
                      <option value="true">On</option>
                      <option value="false">Off</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-slate-400">Texture resolution</label>
                    <input
                      value={textureResolution}
                      onChange={(e) => setTextureResolution(e.target.value)}
                      inputMode="numeric"
                      className="w-full rounded bg-slate-900/60 px-3 py-2 text-sm ring-1 ring-white/10 focus:outline-none focus:ring-sky-500/60"
                      placeholder="(auto)"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-xs text-slate-400">Chunk size</label>
                    <input
                      value={chunkSize}
                      onChange={(e) => setChunkSize(e.target.value)}
                      inputMode="numeric"
                      className="w-full rounded bg-slate-900/60 px-3 py-2 text-sm ring-1 ring-white/10 focus:outline-none focus:ring-sky-500/60"
                      placeholder="(auto)"
                    />
                  </div>
                </div>
              ) : null}

              {errorMessage ? (
                <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-200">
                  {errorMessage}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={!canGenerate}
                className="w-full rounded-xl bg-gradient-to-r from-sky-500 to-emerald-400 py-3 font-extrabold text-slate-950 shadow-lg shadow-sky-900/25 transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {status === "loading" ? "ĐANG GENERATE..." : "GENERATE 3D MODEL"}
              </button>
            </form>
          </div>

          <div className="relative min-h-[320px] overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-md">
            {status === "idle" ? (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <div className="mb-4 italic text-slate-500">Chưa có dữ liệu xử lý</div>
                <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-slate-800/80 opacity-30">
                  <span className="text-4xl">?</span>
                </div>
              </div>
            ) : null}

            {status === "loading" ? (
              <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
                <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-sky-400/30 border-t-sky-400 shadow-[0_0_15px_rgba(64,164,255,0.2)]" />
                <div className="text-xs font-semibold uppercase tracking-[0.25em] text-sky-300 animate-pulse">
                  AI is thinking...
                </div>
                <p className="text-xs text-slate-500">Đang khởi tạo mesh và texture</p>
              </div>
            ) : null}

            {status === "ready" && generation ? (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <div className="mb-6 inline-flex items-center gap-2 rounded-lg bg-emerald-500/15 px-3 py-2 text-sm text-emerald-200 ring-1 ring-emerald-400/25">
                  ✓ Tạo thành công!
                </div>

                <div className="mb-6 w-full">
                  <div className="mb-3 text-5xl">📦</div>
                  <div className="mx-auto max-w-full truncate px-4 font-mono text-xs text-slate-400">
                    ID: {generation.job_id}
                  </div>
                  {generation.mesh_path ? (
                    <div className="mx-auto mt-2 max-w-full truncate px-4 text-xs text-slate-500">
                      {generation.mesh_path}
                    </div>
                  ) : null}
                </div>

                <div className="flex flex-col items-center gap-3">
                  <button
                    type="button"
                    onClick={() => void handleDownload()}
                    className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-6 py-3 font-extrabold text-slate-900 transition-colors hover:bg-white"
                  >
                    <span>DOWNLOAD MODEL</span>
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                      />
                    </svg>
                  </button>

                  {downloadHref ? (
                    <a
                      href={downloadHref}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-sky-300/90 underline decoration-sky-400/40 underline-offset-4 hover:text-sky-200"
                    >
                      Mở link download
                    </a>
                  ) : null}
                </div>
              </div>
            ) : null}

            {status === "error" ? (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <div className="mb-3 text-4xl">⚠️</div>
                <div className="max-w-sm text-sm text-rose-200">{errorMessage || "Có lỗi xảy ra."}</div>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {isCameraOpen ? (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur">
          <div className="w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-slate-950/80 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <div className="text-sm font-bold text-slate-100">Camera</div>
              <button
                type="button"
                onClick={handleCloseCamera}
                className="rounded-full bg-white/5 px-3 py-1 text-xs font-semibold text-slate-200 hover:bg-white/10"
              >
                Đóng
              </button>
            </div>
            <div className="p-4">
              <div className="overflow-hidden rounded-xl border border-white/10 bg-black">
                <video ref={videoRef} className="h-64 w-full object-cover" playsInline muted />
              </div>

              <canvas ref={canvasRef} className="hidden" />

              <div className="mt-4 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={handleCloseCamera}
                  className="rounded-xl bg-white/5 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-white/10"
                >
                  Huỷ
                </button>
                <button
                  type="button"
                  onClick={() => void handleCaptureFromWebcam()}
                  className="rounded-xl bg-gradient-to-r from-sky-500 to-emerald-400 px-4 py-2 text-sm font-extrabold text-slate-950"
                >
                  Chụp
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
