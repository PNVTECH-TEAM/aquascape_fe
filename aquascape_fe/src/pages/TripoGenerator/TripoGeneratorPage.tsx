import { useState } from "react";
import type { OptionalBool } from "./hooks/useTripoGenerator";
import { useTripoGenerator } from "./hooks/useTripoGenerator";
import "./TripoGeneratorPage.scss";
import ThreeGlbPreview from "./components/ThreeGlbPreview";

export default function TripoGeneratorPage() {
  const {
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
  } = useTripoGenerator();

  // State cho các dropdown
  const [openFormat, setOpenFormat] = useState(false);
  const [openQuality, setOpenQuality] = useState(false);

  // Options cho format
  const formatOptions = [
    { value: "glb", label: texts.formatGlbStandard},
    { value: "obj", label: texts.formatObjMesh},
  ];

  // Options cho quality
  const qualityOptions = [
    { value: "fast", label: texts.qualityFast},
    { value: "balanced", label: texts.qualityBalanced},
    { value: "quality", label: texts.qualityHigh },
  ];

  const qualityTone = (value: string) => {
    switch (value) {
      case "fast":
      case "balanced":
      case "quality":
        return {
          item: "hover:bg-emerald-50",
          itemActive: "bg-emerald-50",
          text: "text-[#102a43]",
          textActive: "text-emerald-700",
          icon: "text-emerald-600",
          badge: "bg-emerald-100 text-emerald-800",
        };
      default:
        return {
          item: "hover:bg-gray-50",
          itemActive: "bg-gray-50",
          text: "text-[#102a43]",
          textActive: "text-[#102a43]",
          icon: "text-gray-500",
          badge: "bg-gray-100 text-gray-700",
        };
    }
  };

  return (
    <div className="tripo-generator-page min-h-screen">
      {/* Header với hiệu ứng gradient */}
      <div className="tg-hero relative overflow-hidden px-6 py-8 shadow-xl">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:60px_60px]" />
        <div className="relative mx-auto max-w-7xl">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
                {texts.headerTitle}{" "}
              </h1>
            </div>
            <button
              type="button"
              onClick={resetGenerationState}
              className="group relative overflow-hidden rounded-xl bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm transition-all hover:bg-white/20"
            >
              <span className="relative z-10 flex items-center gap-2">
                <svg className="h-4 w-4 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {texts.reset}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Left Panel - Input Form */}
          <div className="group relative">
            <div className="pointer-events-none absolute -inset-1 rounded-3xl bg-gradient-to-r from-blue-500/15 to-sky-500/15 opacity-60 blur-xl transition group-hover:opacity-90" />
              <div className="mb-6 flex items-center gap-3">
              <div className="tg-gradient flex h-10 w-10 items-center justify-center rounded-xl text-emerald-600 shadow-lg">
                  ⚡
                </div>
              <h2 className="text-xl font-bold text-emerald-600">{texts.panelTitle}</h2>
              </div>

              <form onSubmit={handleGenerate} className="space-y-6">
                {/* Upload Area */}
                <div
                  onClick={handleChooseFile}
                  onDrop={handleDrop}
                  onDragOver={(e) => e.preventDefault()}
                  className="group/card relative cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed border-[#102a43]/10 bg-white/40 transition-all hover:border-emerald-400 hover:bg-emerald-50/30"
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
                    <div className="p-4">
                      <div className="relative mx-auto aspect-square max-h-64 overflow-hidden rounded-xl">
                        <img
                          src={previewUrl}
                          alt={texts.previewAlt}
                          className="h-full w-full object-contain transition-transform duration-300 group-hover/card:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 transition-opacity group-hover/card:opacity-100" />
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <span className="truncate rounded-full bg-white/70 px-3 py-1 text-xs font-medium text-[#334e68] ring-1 ring-[#102a43]/10">
                          {imageFile?.name}
                        </span>
                        <span className="text-xs text-emerald-600">✓ Ready</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center p-8">
                      <div className="mb-4 rounded-full bg-emerald-50 p-4 text-4xl text-emerald-600 shadow-lg shadow-emerald-900/5 ring-1 ring-emerald-200/60 transition-transform group-hover/card:scale-110">
                        📸
                      </div>
                      <p className="text-center text-sm text-emerald-600">
                        {texts.dragDropHint}
                      </p>
                    </div>
                  )}

                <div className="flex items-center justify-center gap-3 border-t border-emerald-600 bg-white/40 p-4 backdrop-blur-sm">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        void handleOpenCamera();
                      }}
                      className="inline-flex items-center gap-2 rounded-xl bg-white/70 px-4 py-2 text-sm font-medium text-[#102a43] shadow-sm ring-1 ring-[#102a43]/10 transition-all hover:bg-white hover:ring-emerald-200/80"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {texts.takePhoto}
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleChooseFile();
                      }}
                      className="tg-btn-primary inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-white transition-all"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {texts.chooseImage}
                    </button>
                  </div>
                </div>

                {/* Format & Quality */}
                <div className="grid grid-cols-2 gap-6">
                  {/* FORMAT DROPDOWN */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      <svg className="h-3.5 w-3.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                      </svg>
                      {texts.formatLabel}
                    </label>

                    <div className="relative">
                      <div
                        onClick={() => setOpenFormat(!openFormat)}
                        className="flex w-full cursor-pointer items-center justify-between rounded-xl border border-gray-200 bg-white/80 px-4 py-3 text-sm text-gray-800 shadow-sm transition-all hover:border-emerald-400 hover:shadow-md"
                      >
                        <span className="flex items-center gap-2">
                          <span>{formatOptions.find(o => o.value === modelSaveFormat)?.label}</span>
                        </span>
                        <svg
                          className={`h-4 w-4 text-gray-400 transition-transform ${openFormat ? 'rotate-180' : ''}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>

                      {openFormat && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setOpenFormat(false)} />
                          <div className="absolute left-0 right-0 z-50 mt-2 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl">
                            {formatOptions.map((opt) => (
                              <div
                                key={opt.value}
                                onClick={() => {
                                  setModelSaveFormat(opt.value as "glb" | "obj");
                                  setOpenFormat(false);
                                }}
                                className={`group cursor-pointer px-4 py-3 transition-all hover:bg-emerald-50 ${modelSaveFormat === opt.value ? 'bg-emerald-50' : ''}`}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <div>
                                      <div className={`text-sm font-medium ${modelSaveFormat === opt.value ? 'text-emerald-700' : 'text-gray-700'}`}>
                                        {opt.label}
                                      </div>
                                    </div>
                                  </div>
                                  {modelSaveFormat === opt.value && (
                                    <svg className="h-4 w-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                    </svg>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* QUALITY DROPDOWN */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      <svg className="h-3.5 w-3.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                      {texts.qualityLabel}
                    </label>

                    <div className="relative">
                      <div
                        onClick={() => setOpenQuality(!openQuality)}
                        className="flex w-full cursor-pointer items-center justify-between rounded-xl border border-gray-200 bg-white/80 px-4 py-3 text-sm text-gray-800 shadow-sm transition-all hover:border-emerald-400 hover:shadow-md"
                      >
                        <span className="flex items-center gap-2">
                          <span>{qualityOptions.find(o => o.value === quality)?.label}</span>
                        </span>
                        <svg
                          className={`h-4 w-4 text-gray-400 transition-transform ${openQuality ? 'rotate-180' : ''}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>

                      {openQuality && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setOpenQuality(false)} />
                          <div className="absolute left-0 right-0 z-50 mt-2 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl">
                            {qualityOptions.map((opt) => {
                              const tone = qualityTone(opt.value);
                              const isActive = quality === opt.value;
                              return (
                                <div
                                  key={opt.value}
                                  onClick={() => {
                                    setQuality(opt.value as typeof quality);
                                    setOpenQuality(false);
                                  }}
                                  className={`group cursor-pointer px-4 py-3 transition-all ${tone.item} ${isActive ? tone.itemActive : ''}`}
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                      <div>
                                        <div className={`text-sm font-medium ${isActive ? tone.textActive : tone.text}`}>
                                          {opt.label}
                                        </div>
                                      </div>
                                    </div>
                                    {isActive && (
                                      <svg className={`h-4 w-4 ${tone.icon}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                      </svg>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </>
                      )}
                    </div>

                    {/* Quality Badge */}
                    <div className="mt-1 flex justify-end">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${qualityTone(quality).badge}`}>
                        {quality === 'fast' && 'Fast Mode'}
                        {quality === 'balanced' && 'Balanced'}
                        {quality === 'quality' && 'HD Quality'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Options */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <label className="flex cursor-pointer items-center gap-3 rounded-xl bg-white/60 p-3 ring-1 ring-[#102a43]/10 transition hover:bg-white">
                    <input
                      type="checkbox"
                      checked={removeBg}
                      onChange={(e) => setRemoveBg(e.target.checked)}
                      className="h-5 w-5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-400"
                    />
                    <span className="text-sm font-medium text-[#102a43]">{texts.autoRemoveBg}</span>
                  </label>

                  <div className="space-y-2">
                  <label className="text-xs font-medium uppercase tracking-wider text-emerald-600">
                      {texts.outputDir}
                    </label>
                    <input
                      value={outputDir}
                      onChange={(e) => setOutputDir(e.target.value)}
                      className="w-full rounded-xl border border-gray-200 bg-white/80 px-4 py-3 text-sm text-gray-800 transition-all placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-300"
                      placeholder={texts.outputDirPlaceholder}
                    />
                  </div>
                </div>

                {/* Foreground Ratio */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                  <label className="text-xs font-medium uppercase tracking-wider text-emerald-600">
                      {texts.foregroundRatio}
                    </label>
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800">
                      {foregroundRatio.toFixed(2)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0.1}
                    max={1}
                    step={0.01}
                    value={foregroundRatio}
                    onChange={(e) => setForegroundRatio(Number(e.target.value))}
                    className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-emerald-500 [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:shadow-emerald-500/30"
                  />
                </div>

                {/* Advanced Toggle */}
                <button
                  type="button"
                  onClick={() => setShowAdvanced((prev) => !prev)}
                  className="group/advanced flex w-full items-center justify-between rounded-xl bg-gradient-to-r from-gray-50 to-white px-4 py-3 text-sm font-medium text-gray-700 ring-1 ring-gray-200 transition-all hover:from-emerald-50 hover:to-white"
                >
                  <span className="flex items-center gap-2">
                    <svg className={`h-4 w-4 transition-transform ${showAdvanced ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                    {showAdvanced ? texts.advancedHide : texts.advancedShow}
                  </span>
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-800">
                    Advanced
                  </span>
                </button>

                {/* Advanced Options */}
                {showAdvanced ? (
                  <div className="grid grid-cols-1 gap-4 rounded-xl bg-white/70 p-4 shadow-inner ring-1 ring-gray-200 sm:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-gray-500">{texts.mcResolution}</label>
                      <input
                        value={mcResolution}
                        onChange={(e) => setMcResolution(e.target.value)}
                        className="w-full rounded-lg border border-gray-200 bg-white/80 px-3 py-2 text-sm text-gray-800 shadow-sm transition-all placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-300"
                        placeholder={texts.autoPlaceholder}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-gray-500">{texts.threshold}</label>
                      <input
                        value={threshold}
                        onChange={(e) => setThreshold(e.target.value)}
                        className="w-full rounded-lg border border-gray-200 bg-white/80 px-3 py-2 text-sm text-gray-800 shadow-sm transition-all placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-300"
                        placeholder={texts.autoPlaceholder}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-gray-500">{texts.bakeTexture}</label>
                      <select
                        value={bakeTexture}
                        onChange={(e) => setBakeTexture(e.target.value as OptionalBool)}
                        className="w-full rounded-lg border border-gray-200 bg-white/80 px-3 py-2 text-sm text-gray-800 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-emerald-300"
                      >
                        <option value="auto">{texts.bakeTextureAuto}</option>
                        <option value="true">{texts.bakeTextureOn}</option>
                        <option value="false">{texts.bakeTextureOff}</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-gray-500">{texts.textureResolution}</label>
                      <input
                        value={textureResolution}
                        onChange={(e) => setTextureResolution(e.target.value)}
                        className="w-full rounded-lg border border-gray-200 bg-white/80 px-3 py-2 text-sm text-gray-800 shadow-sm transition-all placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-300"
                        placeholder={texts.autoPlaceholder}
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-xs font-medium text-gray-500">{texts.chunkSize}</label>
                      <input
                        value={chunkSize}
                        onChange={(e) => setChunkSize(e.target.value)}
                        className="w-full rounded-lg border border-gray-200 bg-white/80 px-3 py-2 text-sm text-gray-800 shadow-sm transition-all placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-300"
                        placeholder={texts.autoPlaceholder}
                      />
                    </div>
                  </div>
                ) : null}

                {/* Error Message */}
                {errorMessage ? (
                  <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-700 shadow-lg shadow-red-900/10">
                    <div className="flex items-center gap-3">
                      <div className="rounded-full bg-red-500/20 p-1">
                        <svg className="h-4 w-4 text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      {errorMessage}
                    </div>
                  </div>
                ) : null}

                {/* Generate Button */}
                <button
                  type="submit"
                  disabled={!canGenerate}
                  className="tg-btn-primary group/btn relative w-full overflow-hidden rounded-xl py-4 font-bold text-white transition-all disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {status === "loading" ? (
                      <>
                        <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        {texts.generating}
                      </>
                    ) : texts.generate}
                  </span>
                  <div className="absolute inset-0 -translate-x-full transform bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform group-hover/btn:translate-x-full" />
                </button>
              </form>
          </div>

          {/* Right Panel - Result */}
          <div className="group relative">
            <div className="pointer-events-none absolute -inset-1 rounded-3xl bg-gradient-to-r from-blue-500/15 to-sky-500/15 opacity-60 blur-xl transition group-hover:opacity-90" />
            <div className="tg-card relative min-h-[500px] overflow-hidden p-6 backdrop-blur-xl lg:p-8">
              {/* Background Pattern */}
              <div className="absolute inset-0 bg-grid-white/[0.04] bg-[size:50px_50px]" />

              {/* Content */}
              <div className="relative z-10 flex h-full flex-col items-center justify-center">
                {status === "idle" ? (
                  <div className="text-center">
                    <div className="mb-4 text-gray-500 italic">{texts.emptyState}</div>
                    <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full border-4 border-gray-200 opacity-50">
                      <span className="text-4xl text-gray-400">?</span>
                    </div>
                    <p className="mt-4 text-sm text-gray-500">Upload an image to start generating</p>
                  </div>
                ) : null}

                {status === "loading" ? (
                  <div className="flex flex-col items-center gap-4 text-center">
                    <div className="tg-spinner" />
                    <div className="tg-loading-text uppercase tracking-widest">AI is thinking...</div>
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-gray-800">{texts.loadingTitle}</p>
                      <p className="text-xs text-gray-500">{texts.loadingSubtitle}</p>
                    </div>
                  </div>
                ) : null}

                {status === "ready" && generation ? (
                  <div className="w-full text-center">
                    <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-green-500/15 px-4 py-2 text-sm font-semibold text-green-700 shadow-lg shadow-emerald-900/10">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      {texts.success}
                    </div>

                    {modelSaveFormat === "glb" ? (
                      <div className="mx-auto mb-8 h-64 w-full overflow-hidden rounded-2xl bg-white/70 ring-1 ring-emerald-200/70 shadow-sm">
                        <ThreeGlbPreview url={downloadHref} className="h-full w-full" />
                      </div>
                    ) : (
                    <div className="mb-8">
                      <div className="relative mx-auto w-fit">
                        <div className="absolute inset-0 animate-pulse rounded-full bg-blue-500/10 blur-2xl" />
                        <div className="relative flex h-32 w-32 items-center justify-center rounded-full bg-emerald-50 text-5xl text-emerald-600 shadow-2xl shadow-emerald-900/10 ring-1 ring-emerald-200/70">
                          📦
                        </div>
                      </div>
                    </div>
                    )}

                    <div className="mb-8 space-y-2">
                      <div className="inline-block rounded-lg bg-gray-50 px-3 py-1 ring-1 ring-gray-200">
                        <code className="text-xs text-gray-600">ID: {generation.job_id}</code>
                      </div>
                      {generation.mesh_path ? (
                        <div className="text-xs text-gray-500 break-all px-4">
                          {generation.mesh_path}
                        </div>
                      ) : null}
                    </div>

                    <div className="space-y-4">
                      <button
                        type="button"
                        onClick={() => void handleDownload()}
                        className="tg-btn-secondary group/btn inline-flex items-center gap-3 rounded-full px-8 py-4 font-bold transition-all"
                      >
                        <span>{texts.downloadModel}</span>
                        <svg className="h-5 w-5 transition-transform group-hover/btn:translate-y-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                      </button>

                      {downloadHref ? (
                        <a
                          href={downloadHref}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-block text-sm text-blue-400 underline decoration-blue-400/30 underline-offset-4 transition-all hover:text-blue-300 hover:decoration-blue-400"
                        >
                          {texts.openDownloadLink} →
                        </a>
                      ) : null}
                    </div>
                  </div>
                ) : null}

                {status === "error" ? (
                  <div className="text-center">
                    <div className="mb-6 inline-flex rounded-2xl bg-red-500/10 p-4 ring-1 ring-red-500/20">
                      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-500/15 text-4xl text-red-700 shadow-2xl shadow-red-900/10">
                        ⚠️
                      </div>
                    </div>
                    <p className="text-lg font-medium text-red-200">{errorMessage || texts.errorFallback}</p>
                    <p className="mt-2 text-sm text-gray-500">Please try again</p>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
      </div>

      </div>

      {/* Camera Modal */}
      {isCameraOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#102a43]/60 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-gray-200">
            <div className="tg-gradient px-6 py-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">{texts.cameraTitle}</h3>
                <button
                  type="button"
                  onClick={handleCloseCamera}
                  className="rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="overflow-hidden rounded-xl bg-[#102a43] shadow-2xl">
                <video ref={videoRef} className="h-64 w-full object-cover" playsInline muted />
              </div>
              <canvas ref={canvasRef} className="hidden" />

              <div className="mt-6 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCloseCamera}
                  className="rounded-xl bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-200"
                >
                  {texts.cameraCancel}
                </button>
                <button
                  type="button"
                  onClick={() => void handleCaptureFromWebcam()}
                  className="tg-btn-primary rounded-xl px-4 py-2 text-sm font-bold text-white transition"
                >
                  {texts.cameraCapture}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
