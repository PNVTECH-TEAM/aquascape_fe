import { ChangeEvent, FormEvent, useEffect, useMemo, useRef, useState } from "react";
import {
    diagnoseFishDiseaseFromImage,
    FishDoctorDiagnosisResult,
} from "@app/core/services/fishDoctorDiagnosis";
import "./FishDoctorDiagnosis.scss";

export default function FishDoctorDiagnosis() {
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [userPrompt, setUserPrompt] = useState<string>("");
    const [previewUrl, setPreviewUrl] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>("");
    const [result, setResult] = useState<FishDoctorDiagnosisResult | null>(null);
    const [activeScreen, setActiveScreen] = useState<'dashboard' | 'scan' | 'result' | 'treatment'>('dashboard');
    const [isCameraModalOpen, setIsCameraModalOpen] = useState<boolean>(false);
    const cameraInputRef = useRef<HTMLInputElement | null>(null);
    const galleryInputRef = useRef<HTMLInputElement | null>(null);
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const cameraStreamRef = useRef<MediaStream | null>(null);

    const stopCameraStream = () => {
        if (!cameraStreamRef.current) return;
        cameraStreamRef.current.getTracks().forEach((track) => track.stop());
        cameraStreamRef.current = null;
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
    };

    useEffect(() => {
        if (!imageFile) {
            setPreviewUrl("");
            return;
        }

        const url = URL.createObjectURL(imageFile);
        setPreviewUrl(url);

        return () => URL.revokeObjectURL(url);
    }, [imageFile]);

    useEffect(() => () => stopCameraStream(), []);

    const canSubmit = useMemo(() => Boolean(imageFile) && !loading, [imageFile, loading]);

    const handleSelectImage = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0] ?? null;
        setImageFile(file);
        setErrorMessage("");
        event.target.value = "";
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
            setIsCameraModalOpen(true);
            setErrorMessage("");

            setTimeout(() => {
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    void videoRef.current.play();
                }
            }, 0);
        } catch (error) {
            cameraInputRef.current?.click();
            setErrorMessage("Không mở được camera. Vui lòng cấp quyền hoặc chọn ảnh từ thư viện.");
            console.error("Failed to open camera stream:", error);
        }
    };

    const handleOpenGallery = () => {
        galleryInputRef.current?.click();
    };

    const handleStartDiagnosisFromDashboard = async () => {
        setActiveScreen('scan');
        await handleOpenCamera();
    };

    const handleCloseCameraModal = () => {
        setIsCameraModalOpen(false);
        stopCameraStream();
    };

    const handleCaptureFromWebcam = async () => {
        const videoElement = videoRef.current;
        const canvasElement = canvasRef.current;
        if (!videoElement || !canvasElement) return;

        const width = videoElement.videoWidth;
        const height = videoElement.videoHeight;
        if (!width || !height) {
            setErrorMessage("Không đọc được khung hình camera. Thử lại giúp mình.");
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
            setErrorMessage("Không tạo được ảnh từ camera. Thử lại giúp mình.");
            return;
        }

        const capturedFile = new File([blob], `fish-capture-${Date.now()}.jpg`, {
            type: "image/jpeg",
        });

        setImageFile(capturedFile);
        setErrorMessage("");
        handleCloseCameraModal();
    };

    const handleDiagnose = async (event: FormEvent) => {
        event.preventDefault();
        if (!imageFile) {
            setErrorMessage("Vui lòng chọn ảnh cá trước khi chẩn đoán.");
            return;
        }

        setLoading(true);
        setErrorMessage("");

        try {
            const diagnosisResult = await diagnoseFishDiseaseFromImage(imageFile, userPrompt);
            setResult(diagnosisResult);
            setActiveScreen('result');
        } catch (error) {
            console.error("Failed to diagnose fish disease:", error);
            setErrorMessage(error instanceof Error ? error.message : "Không thể chẩn đoán lúc này. Vui lòng thử lại sau.");
        } finally {
            setLoading(false);
        }
    };

    const renderDashboard = () => (
        <div className="dashboard-screen px-6 pt-5 pb-24">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <p className="text-gray-500 text-sm flex items-center gap-1">
                        <i className="fa-regular fa-hand-peace text-[#4db6ac]"></i>
                        Xin chào,
                    </p>
                    <h1 className="text-2xl font-bold text-[#003f5c] flex items-center gap-2">
                        Người yêu cá
                        <span className="animate-bounce">🐠</span>
                    </h1>
                </div>
                <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#4db6ac] to-[#009688] p-0.5">
                        <div className="w-full h-full rounded-full bg-white overflow-hidden border-2 border-white">
                            <img src="https://i.pravatar.cc/150?img=12" alt="Avatar" className="w-full h-full object-cover" />
                        </div>
                    </div>
                    <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></span>
                </div>
            </div>

            <div className="glass-card health-overview-card rounded-3xl p-6 relative overflow-hidden mb-6 text-center">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#4db6ac] opacity-5 rounded-full -mr-8 -mt-8"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#009688] opacity-5 rounded-full -ml-6 -mb-6"></div>

                <h2 className="text-[#003f5c] font-bold text-lg mb-4 flex items-center justify-center gap-2">
                    <i className="fa-solid fa-heart-pulse text-[#4db6ac]"></i>
                    Sức khỏe bể cá
                </h2>

                <div className="flex justify-center mb-4">
                    <div className="liquid-container">
                        <div className="liquid"></div>
                        <div className="absolute inset-0 flex items-center justify-center z-10">
                            <span className="text-4xl font-black text-white drop-shadow-md">85</span>
                            <span className="text-white text-sm mt-3 ml-1 font-bold">%</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-center gap-2 text-[#009688] font-bold bg-teal-50 inline-block px-4 py-2 rounded-full text-sm border border-teal-100">
                    <i className="fa-regular fa-face-smile text-base"></i>
                    <span>Trạng thái: Ổn định</span>
                </div>
            </div>

            <div className="metrics-grid grid grid-cols-3 gap-3 mb-6">
                <div className="glass-card metric-card rounded-2xl p-4 flex flex-col items-center shadow-sm group hover:bg-white">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-500 text-white flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                        <i className="fa-solid fa-temperature-high"></i>
                    </div>
                    <span className="text-gray-500 text-xs">Nhiệt độ</span>
                    <span className="text-[#003f5c] font-bold text-lg">28°C</span>
                </div>

                <div className="glass-card metric-card rounded-2xl p-4 flex flex-col items-center shadow-sm group hover:bg-white">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-500 text-white flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                        <i className="fa-solid fa-flask"></i>
                    </div>
                    <span className="text-gray-500 text-xs">pH</span>
                    <span className="text-[#003f5c] font-bold text-lg">6.5</span>
                </div>

                <div className="glass-card metric-card rounded-2xl p-4 flex flex-col items-center shadow-sm group hover:bg-white">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-green-500 text-white flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                        <i className="fa-solid fa-droplet"></i>
                    </div>
                    <span className="text-gray-500 text-xs">NO3</span>
                    <span className="text-[#003f5c] font-bold text-lg">0mg</span>
                </div>
            </div>

            <button
                onClick={handleStartDiagnosisFromDashboard}
                className="primary-diagnose-cta w-full bg-gradient-to-r from-[#003f5c] to-[#005b96] text-white rounded-2xl p-5 shadow-lg shadow-blue-900/20 active:scale-[0.98] transition-all flex items-center justify-between group relative overflow-hidden"
            >
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity"></div>
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-3xl group-hover:rotate-12 transition-transform">
                        <i className="fa-solid fa-robot"></i>
                    </div>
                    <div className="text-left">
                        <p className="font-bold text-lg flex items-center gap-2">
                            AI Bác sĩ cá
                            <i className="fa-solid fa-stethoscope text-sm opacity-75"></i>
                        </p>
                        <p className="text-blue-100 text-sm flex items-center gap-1">
                            <i className="fa-regular fa-eye"></i>
                            Quét & Chẩn đoán ngay
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-sm opacity-75 group-hover:opacity-100 transition-opacity">Bắt đầu</span>
                    <i className="fa-solid fa-arrow-right-long group-hover:translate-x-1 transition-transform"></i>
                </div>
            </button>

            {/* Quick Actions */}
            <div className="mt-6 grid grid-cols-4 gap-2">
                <button className="flex flex-col items-center p-3 rounded-2xl bg-white/50 backdrop-blur-sm border border-white/60 hover:bg-white/80 transition-all">
                    <i className="fa-solid fa-water text-[#4db6ac] text-xl mb-1"></i>
                    <span className="text-[10px] text-gray-600">Chất lượng</span>
                </button>
                <button className="flex flex-col items-center p-3 rounded-2xl bg-white/50 backdrop-blur-sm border border-white/60 hover:bg-white/80 transition-all">
                    <i className="fa-solid fa-clock text-[#ff7c43] text-xl mb-1"></i>
                    <span className="text-[10px] text-gray-600">Nhắc nhở</span>
                </button>
                <button className="flex flex-col items-center p-3 rounded-2xl bg-white/50 backdrop-blur-sm border border-white/60 hover:bg-white/80 transition-all">
                    <i className="fa-solid fa-book-open text-[#003f5c] text-xl mb-1"></i>
                    <span className="text-[10px] text-gray-600">Nhật ký</span>
                </button>
                <button className="flex flex-col items-center p-3 rounded-2xl bg-white/50 backdrop-blur-sm border border-white/60 hover:bg-white/80 transition-all">
                    <i className="fa-solid fa-chart-line text-[#009688] text-xl mb-1"></i>
                    <span className="text-[10px] text-gray-600">Thống kê</span>
                </button>
            </div>
        </div>
    );

    const renderScan = () => (
        <div className="scan-screen relative h-full">
            <img
                src="https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                className="scan-bg-image absolute inset-0 w-full h-full object-cover opacity-80"
                alt="Fish Camera"
            />

            <div className="scan-overlay absolute inset-0 z-10 flex flex-col p-5 pt-8 pb-8">
                <div className="flex justify-between items-center text-white mb-6">
                    <button
                        onClick={() => setActiveScreen('dashboard')}
                        className="w-11 h-11 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center active:bg-black/50 border border-white/20 hover:scale-110 transition-transform"
                    >
                        <i className="fa-solid fa-arrow-left text-lg"></i>
                    </button>

                    <div className="flex items-center gap-2 bg-black/30 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
                        <i className="fa-solid fa-microchip text-[#4db6ac] animate-pulse"></i>
                        <span className="font-semibold text-sm">AI Vision</span>
                        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                    </div>

                    <button className="w-11 h-11 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center border border-white/20 hover:scale-110 transition-transform">
                        <i className="fa-regular fa-circle-question text-lg"></i>
                    </button>
                </div>

                <form onSubmit={handleDiagnose} className="scan-diagnose-form flex flex-1 flex-col items-center gap-4">
                    {previewUrl && (
                        <>
                    <div className="scan-frame relative w-72 h-72 mx-auto rounded-3xl overflow-hidden shadow-2xl">
                        <div className="absolute inset-0 border-2 border-white/30 rounded-3xl"></div>

                        {/* Corner decorations */}
                        <div className="absolute top-3 left-3 w-8 h-8 border-t-3 border-l-3 border-[#4db6ac] rounded-tl-xl"></div>
                        <div className="absolute top-3 right-3 w-8 h-8 border-t-3 border-r-3 border-[#4db6ac] rounded-tr-xl"></div>
                        <div className="absolute bottom-3 left-3 w-8 h-8 border-b-3 border-l-3 border-[#4db6ac] rounded-bl-xl"></div>
                        <div className="absolute bottom-3 right-3 w-8 h-8 border-b-3 border-r-3 border-[#4db6ac] rounded-br-xl"></div>

                        {previewUrl && (<img src={previewUrl} alt="Fish preview" className="w-full h-full object-cover" />)}

                        {loading && (
                            <>
                                <div className="laser-line"></div>
                                <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px] flex items-center justify-center">
                                    <div className="bg-black/50 rounded-full px-4 py-2 flex items-center gap-2">
                                        <i className="fa-solid fa-spinner fa-spin-pulse text-[#4db6ac]"></i>
                                        <span className="text-white text-sm">Đang phân tích...</span>
                                    </div>
                                </div>
                            </>
                        )}

                        <label
                            htmlFor="fish-photo-camera-input"
                            className="absolute bottom-3 left-1/2 transform -translate-x-1/2 bg-black/50 backdrop-blur-md text-white text-xs font-bold py-2 px-4 rounded-full border border-white/30 cursor-pointer hover:bg-black/70 transition-all flex items-center gap-2"
                        >
                            <i className="fa-regular fa-images"></i>
                            Chọn ảnh
                        </label>
                    </div>
                        </>
                    )}

                    <input
                        ref={cameraInputRef}
                        id="fish-photo-camera-input"
                        className="hidden"
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={handleSelectImage}
                    />
                    <input
                        ref={galleryInputRef}
                        id="fish-photo-gallery-input"
                        className="hidden"
                        type="file"
                        accept="image/*"
                        onChange={handleSelectImage}
                    />

                    {previewUrl && (
                        <>
                    <div className="w-72 relative">
                        <textarea
                            className="scan-note-input w-full bg-black/30 backdrop-blur-md text-white placeholder-white/60 rounded-2xl p-4 text-sm border border-white/20 focus:border-[#4db6ac] focus:ring-1 focus:ring-[#4db6ac] transition-all"
                            placeholder="Mô tả thêm triệu chứng... (VD: Cá bơi lờ đờ, có đốm trắng)"
                            value={userPrompt}
                            onChange={(event) => setUserPrompt(event.target.value)}
                            rows={2}
                        />
                        {userPrompt && (
                            <button
                                type="button"
                                onClick={() => setUserPrompt("")}
                                className="absolute right-3 top-3 text-white/50 hover:text-white"
                            >
                                <i className="fa-regular fa-circle-xmark"></i>
                            </button>
                        )}
                    </div>
                        </>
                    )}

                    <div className="scan-action-bar mt-auto flex justify-center items-center gap-6 w-full">
                        <button
                            type="button"
                            onClick={handleOpenCamera}
                            className="text-white text-xl w-14 h-14 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center border border-white/20 hover:bg-black/40 hover:scale-110 transition-all"
                            aria-label="Chụp ảnh trực tiếp"
                        >
                            <i className="fa-solid fa-camera-retro"></i>
                        </button>

                        {previewUrl && (
                            <button
                                type="submit"
                                disabled={!canSubmit}
                                className="scan-shutter-btn relative group"
                            >
                                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#4db6ac] to-[#009688] opacity-0 group-hover:opacity-100 transition-opacity blur-md"></div>
                                <div className={`relative w-20 h-20 rounded-full border-4 border-white bg-gradient-to-br from-[#4db6ac] to-[#009688] flex items-center justify-center ${!canSubmit ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-105 active:scale-95'} transition-transform`}>
                                    {loading ? (
                                        <i className="fa-solid fa-circle-notch fa-spin text-white text-3xl"></i>
                                    ) : (
                                        <i className="fa-solid fa-magnifying-glass text-white text-3xl"></i>
                                    )}
                                </div>
                            </button>
                        )}

                        <button
                            type="button"
                            onClick={handleOpenGallery}
                            className="text-white text-xl w-14 h-14 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center border border-white/20 hover:bg-black/40 hover:scale-110 transition-all"
                            aria-label="Chọn ảnh từ thư viện"
                        >
                            <i className="fa-regular fa-images"></i>
                        </button>
                    </div>
                </form>

                {isCameraModalOpen && (
                    <div className="camera-modal absolute inset-0 z-30 flex items-center justify-center p-4">
                        <div className="camera-modal__card w-full max-w-sm rounded-3xl overflow-hidden backdrop-blur-xl bg-black/80 border border-white/20">
                            <div className="camera-modal__header flex items-center justify-between px-5 py-4 border-b border-white/10">
                                <div className="flex items-center gap-2">
                                    <i className="fa-solid fa-camera text-[#4db6ac]"></i>
                                    <p className="font-bold text-white">Chụp ảnh trực tiếp</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleCloseCameraModal}
                                    className="text-white/70 w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center transition-all hover:rotate-90"
                                    aria-label="Đóng camera"
                                >
                                    <i className="fa-solid fa-xmark text-xl"></i>
                                </button>
                            </div>

                            <div className="camera-modal__preview relative aspect-[3/4] bg-black">
                                <video ref={videoRef} className="w-full h-full object-cover" playsInline muted autoPlay />
                                <div className="absolute inset-0 border-3 border-[#4db6ac] border-opacity-50 m-4 rounded-2xl pointer-events-none"></div>
                                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 backdrop-blur-md px-4 py-2 rounded-full text-white text-xs flex items-center gap-2">
                                    <i className="fa-regular fa-circle-dot text-red-500 animate-pulse"></i>
                                    <span>Đang tìm cá...</span>
                                </div>
                                <canvas ref={canvasRef} className="hidden" />
                            </div>

                            <div className="camera-modal__actions p-5">
                                <button
                                    type="button"
                                    onClick={handleCaptureFromWebcam}
                                    className="w-full bg-gradient-to-r from-[#4db6ac] to-[#009688] text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-3 hover:shadow-lg hover:shadow-[#4db6ac]/30 transition-all active:scale-[0.98]"
                                >
                                    <i className="fa-regular fa-circle-dot"></i>
                                    Chụp ảnh ngay
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );

    const renderResult = () => {
        if (!result) return null;

        const confidencePercent = (result.diagnosis.confidence * 100).toFixed(1);
        const isHighRisk = result.diagnosis.confidence > 0.7;

        return (
            <div className="result-screen px-6 pt-5 pb-24">
                <div className="flex justify-between items-center mb-6">
                    <button
                        onClick={() => setActiveScreen('scan')}
                        className="w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-all hover:scale-105 active:scale-95"
                    >
                        <i className="fa-solid fa-arrow-left text-gray-600"></i>
                    </button>

                    <h1 className="text-lg font-bold text-[#003f5c] flex items-center gap-2">
                        <i className="fa-solid fa-file-waveform text-[#4db6ac]"></i>
                        Kết quả chẩn đoán
                    </h1>

                    <button
                        onClick={() => setActiveScreen('dashboard')}
                        className="w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-all hover:scale-105 active:scale-95"
                    >
                        <i className="fa-solid fa-house text-gray-600"></i>
                    </button>
                </div>

                <div className={`diagnosis-hero bg-gradient-to-br ${isHighRisk ? 'from-[#ff7c43] to-[#f55a42]' : 'from-[#4db6ac] to-[#009688]'} text-white rounded-3xl p-6 mb-6 shadow-lg relative overflow-hidden`}>
                    <div className="absolute -right-6 -top-6 text-white opacity-10 text-9xl">
                        <i className={`fa-solid ${isHighRisk ? 'fa-biohazard' : 'fa-shield-heart'}`}></i>
                    </div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-3">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-md flex items-center gap-1 ${isHighRisk ? 'bg-red-500/30' : 'bg-green-500/30'}`}>
                                <i className={`fa-solid ${isHighRisk ? 'fa-triangle-exclamation' : 'fa-circle-check'}`}></i>
                                {isHighRisk ? 'Nguy cơ cao' : 'Nguy cơ thấp'}
                            </span>
                            <span className="text-sm opacity-90 flex items-center gap-1">
                                <i className="fa-regular fa-chart-line"></i>
                                Độ chính xác: {confidencePercent}%
                            </span>
                        </div>

                        <h2 className="text-3xl font-black mb-2 flex items-center gap-2">
                            <i className="fa-solid fa-disease text-2xl opacity-75"></i>
                            {result.diagnosis.disease_name}
                        </h2>

                        {result.diagnosis.vision_note && (
                            <p className="bg-white/20 p-3 rounded-xl text-sm backdrop-blur-sm flex items-start gap-2">
                                <i className="fa-regular fa-eye mt-0.5"></i>
                                <span>{result.diagnosis.vision_note}</span>
                            </p>
                        )}
                    </div>
                </div>

                {result.visual_reference && (
                    <div className="mb-6">
                        <h3 className="text-[#003f5c] font-bold mb-3 flex items-center gap-2">
                            <i className="fa-solid fa-images text-[#4db6ac]"></i>
                            Hình ảnh tham khảo
                        </h3>
                        <div className="flex gap-3">
                            <div className="flex-1 rounded-2xl bg-gray-100 overflow-hidden relative aspect-square shadow-md group">
                                {previewUrl && (
                                    <img src={previewUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform" alt="Your fish" />
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <span className="absolute bottom-2 left-2 text-white text-xs font-bold backdrop-blur-md bg-black/40 px-3 py-1.5 rounded-full border border-white/20 flex items-center gap-1">
                                    <i className="fa-regular fa-user"></i>
                                    Cá của bạn
                                </span>
                            </div>
                            <div className="flex-1 rounded-2xl bg-gray-100 overflow-hidden relative aspect-square shadow-md group">
                                <img
                                    src={result.visual_reference.image_url}
                                    className="w-full h-full object-cover filter grayscale contrast-125 brightness-110 group-hover:scale-105 transition-transform"
                                    alt="Disease sample"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <span className="absolute bottom-2 left-2 text-white text-xs font-bold backdrop-blur-md bg-red-600/80 px-3 py-1.5 rounded-full border border-white/20 flex items-center gap-1">
                                    <i className="fa-regular fa-hospital"></i>
                                    Mẫu bệnh
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                <div className="glass-card detail-card rounded-2xl p-5 mb-4">
                    <h3 className="text-[#003f5c] font-bold mb-3 flex items-center gap-2">
                        <i className="fa-solid fa-clipboard-list text-[#4db6ac]"></i>
                        Chẩn đoán chi tiết
                    </h3>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                            <span className="text-gray-600 flex items-center gap-2">
                                <i className="fa-regular fa-hashtag text-[#4db6ac]"></i>
                                Mã bệnh:
                            </span>
                            <strong className="text-[#003f5c] bg-white px-3 py-1 rounded-lg">{result.diagnosis.label_code}</strong>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                            <span className="text-gray-600 flex items-center gap-2">
                                <i className="fa-regular fa-id-card text-[#4db6ac]"></i>
                                ID phân tích:
                            </span>
                            <strong className="text-[#003f5c] bg-white px-3 py-1 rounded-lg text-sm">{result.diagnosis.inference_id}</strong>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                            <span className="text-gray-600 flex items-center gap-2">
                                <i className="fa-regular fa-database text-[#4db6ac]"></i>
                                Nguồn dữ liệu:
                            </span>
                            <strong className="text-[#003f5c] bg-white px-3 py-1 rounded-lg">{result.diagnosis.source}</strong>
                        </div>
                    </div>
                </div>

                {result.doctor_advice && (
                    <div className="glass-card detail-card rounded-2xl p-5 mb-6">
                        <h3 className="text-[#003f5c] font-bold mb-3 flex items-center gap-2">
                            <i className="fa-solid fa-user-doctor text-[#4db6ac]"></i>
                            Lời khuyên từ bác sĩ
                        </h3>
                        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                            <p className="text-gray-700 text-sm leading-relaxed flex items-start gap-2">
                                <i className="fa-regular fa-message text-[#4db6ac] mt-1"></i>
                                <span>{result.doctor_advice}</span>
                            </p>
                        </div>
                    </div>
                )}

                <button
                    onClick={() => setActiveScreen('treatment')}
                    className="w-full bg-gradient-to-r from-[#003f5c] to-[#005b96] text-white font-bold rounded-2xl py-4 shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 group"
                >
                    <i className="fa-solid fa-kit-medical group-hover:rotate-12 transition-transform"></i>
                    Xem phác đồ điều trị
                    <i className="fa-solid fa-arrow-right group-hover:translate-x-1 transition-transform"></i>
                </button>
            </div>
        );
    };

    const renderTreatment = () => (
        <div className="treatment-screen px-6 pt-5 pb-24">
            <div className="flex justify-between items-center mb-6">
                <button
                    onClick={() => setActiveScreen('result')}
                    className="w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-all hover:scale-105 active:scale-95"
                >
                    <i className="fa-solid fa-arrow-left text-gray-600"></i>
                </button>

                <h1 className="text-lg font-bold text-[#003f5c] flex items-center gap-2">
                    <i className="fa-solid fa-prescription-bottle text-[#4db6ac]"></i>
                    Phác đồ điều trị
                </h1>

                <button
                    onClick={() => setActiveScreen('dashboard')}
                    className="w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-all hover:scale-105 active:scale-95"
                >
                    <i className="fa-solid fa-house text-gray-600"></i>
                </button>
            </div>

            <div className="timeline relative ml-4 space-y-8 mb-10">
                {result?.suggested_treatments?.map((treatment, index) => (
                    <div key={index} className="timeline-item relative">
                        <div className={`timeline-dot ${index === 0 ? 'today' : index === 1 ? 'tomorrow' : 'future'}`}>
                            <i className={`fa-solid ${index === 0 ? 'fa-play' : index === 1 ? 'fa-clock' : 'fa-calendar'} text-white text-[8px] absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2`}></i>
                        </div>

                        <div className="timeline-date">
                            <span className="day">
                                {index === 0 ? 'Hôm nay' : index === 1 ? 'Ngày mai' : `Ngày ${index * 2 + 1}`}
                            </span>
                            <span className="sub">
                                {index === 0 ? 'Bắt đầu ngay' : index === 1 ? 'Tiếp theo' : 'Theo dõi'}
                            </span>
                        </div>

                        <div className="treatment-card">
                            <div className="card-header">
                                <i className="fa-solid fa-syringe"></i>
                                <span>Điều trị {index + 1}</span>
                            </div>

                            <div className="treatment-content">
                                <div className="treatment-image">
                                    {treatment.image ? (
                                        <img src={treatment.image} alt={treatment.name} />
                                    ) : (
                                        <div className="placeholder-icon">
                                            <i className="fa-solid fa-pills"></i>
                                        </div>
                                    )}
                                </div>

                                <div className="treatment-info">
                                    <h4>{treatment.name}</h4>
                                    {treatment.price && (
                                        <div className="price">
                                            <i className="fa-regular fa-tag"></i> {treatment.price}
                                        </div>
                                    )}
                                    {treatment.description && (
                                        <p className="description">{treatment.description}</p>
                                    )}
                                </div>
                            </div>

                            {treatment.link && (
                                <a
                                    href={treatment.link}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="buy-btn"
                                >
                                    <i className="fa-solid fa-cart-shopping"></i>
                                    Mua ngay
                                    <i className="fa-solid fa-arrow-up-right-from-squares"></i>
                                </a>
                            )}
                        </div>
                    </div>
                ))}

                {(!result?.suggested_treatments || result.suggested_treatments.length === 0) && (
                    <div className="timeline-item relative">
                        <div className="timeline-dot future"></div>
                        <div className="timeline-date">
                            <span className="day">Ngày 1</span>
                            <span className="sub">Khuyến nghị</span>
                        </div>
                        <div className="bg-gradient-to-br from-blue-50 to-white p-5 rounded-2xl border border-blue-100">
                            <div className="flex items-start gap-3">
                                <i className="fa-regular fa-face-smile text-[#4db6ac] text-2xl"></i>
                                <div>
                                    <p className="text-gray-700 font-medium mb-1">Theo dõi và quan sát</p>
                                    <p className="text-gray-500 text-sm">Quan sát cá thường xuyên. Đảm bảo chất lượng nước tốt.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Additional info */}
            <div className="mt-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-200">
                <div className="flex items-start gap-3">
                    <i className="fa-regular fa-lightbulb text-amber-500 text-xl mt-1"></i>
                    <div>
                        <p className="text-sm font-medium text-amber-800 mb-1">Lưu ý quan trọng</p>
                        <p className="text-xs text-amber-700">Tuân thủ liều lượng và theo dõi phản ứng của cá trong quá trình điều trị.</p>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="fish-doctor-page h-screen overflow-hidden bg-gradient-to-b from-[#f0fdfa] to-white">
            {/* Background decorations */}
            <div className="bubble bubble-1"></div>
            <div className="bubble bubble-2"></div>
            <div className="bubble bubble-3"></div>

            <main className="relative h-full overflow-y-auto hide-scrollbar">
                {/* Screens */}
                <div className={`screen ${activeScreen === 'dashboard' ? 'active' : ''}`}>
                    {renderDashboard()}
                </div>

                <div className={`screen scan-screen-wrapper ${activeScreen === 'scan' ? 'active' : ''}`}>
                    {renderScan()}
                </div>

                <div className={`screen ${activeScreen === 'result' ? 'active' : ''}`}>
                    {renderResult()}
                </div>

                <div className={`screen ${activeScreen === 'treatment' ? 'active' : ''}`}>
                    {renderTreatment()}
                </div>

                {/* Bottom Navigation (temporarily disabled)
                {activeScreen !== 'scan' && (
                    <div className="bottom-nav">
                        <button
                            onClick={() => setActiveScreen('dashboard')}
                            className={`nav-item ${activeScreen === 'dashboard' ? 'active' : ''}`}
                        >
                            <i className="fa-solid fa-house"></i>
                        </button>

                        <button className="nav-item">
                            <i className="fa-solid fa-store"></i>
                        </button>

                        <div className="scan-btn-wrapper">
                            <button
                                onClick={() => setActiveScreen('scan')}
                                className="scan-btn"
                            >
                                <i className="fa-solid fa-camera"></i>
                            </button>
                        </div>

                        <button className="nav-item">
                            <i className="fa-regular fa-compass"></i>
                        </button>

                        <button className="nav-item">
                            <i className="fa-regular fa-user"></i>
                        </button>
                    </div>
                )}
                */}

                {/* Error Message */}
                {errorMessage && (
                    <div className="error-message">
                        <i className="fa-solid fa-circle-exclamation"></i>
                        <span>{errorMessage}</span>
                        <button
                            className="close-btn"
                            onClick={() => setErrorMessage("")}
                        >
                            <i className="fa-solid fa-xmark"></i>
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
}

