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
            setErrorMessage("Khong mo duoc camera. Vui long cap quyen hoac chon anh tu thu vien.");
            console.error("Failed to open camera stream:", error);
        }
    };

    const handleOpenGallery = () => {
        galleryInputRef.current?.click();
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
            setErrorMessage("Khong doc duoc khung hinh camera. Thu lai giup minh.");
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
            setErrorMessage("Khong tao duoc anh tu camera. Thu lai giup minh.");
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
                    <p className="text-gray-500 text-sm">Xin chào,</p>
                    <h1 className="text-2xl font-bold text-[#003f5c]">Người yêu cá 🐠</h1>
                </div>
                <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden border-2 border-white shadow-md">
                    <img src="https://i.pravatar.cc/150?img=12" alt="Avatar" className="w-full h-full object-cover" />
                </div>
            </div>

            <div className="glass-card health-overview-card rounded-3xl p-6 relative overflow-hidden mb-6 text-center">
                <h2 className="text-[#003f5c] font-bold text-lg mb-4">Sức khỏe bể cá</h2>

                <div className="flex justify-center mb-4">
                    <div className="liquid-container">
                        <div className="liquid"></div>
                        <div className="absolute inset-0 flex items-center justify-center z-10">
                            <span className="text-4xl font-black text-white drop-shadow-md">85</span>
                            <span className="text-white text-sm mt-3 ml-1 font-bold">%</span>
                        </div>
                    </div>
                </div>

                <p className="text-[#009688] font-bold bg-teal-50 inline-block px-4 py-1 rounded-full text-sm border border-teal-100">
                    ✨ Trạng thái: Ổn định
                </p>
            </div>

            <div className="metrics-grid grid grid-cols-3 gap-3 mb-6">
                <div className="glass-card metric-card rounded-2xl p-3 flex flex-col items-center shadow-sm">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-500 flex items-center justify-center mb-2">
                        <i className="fa-solid fa-temperature-half"></i>
                    </div>
                    <span className="text-gray-500 text-xs">Nhiệt độ</span>
                    <span className="text-[#003f5c] font-bold text-lg">28°C</span>
                </div>
                <div className="glass-card metric-card metric-card--ph rounded-2xl p-3 flex flex-col items-center shadow-sm border-l-4 border-l-yellow-400">
                    <div className="w-8 h-8 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center mb-2">
                        <i className="fa-solid fa-droplet"></i>
                    </div>
                    <span className="text-gray-500 text-xs">pH</span>
                    <span className="text-[#003f5c] font-bold text-lg">6.5</span>
                </div>
                <div className="glass-card metric-card rounded-2xl p-3 flex flex-col items-center shadow-sm">
                    <div className="w-8 h-8 rounded-full bg-green-100 text-green-500 flex items-center justify-center mb-2">
                        <i className="fa-solid fa-flask"></i>
                    </div>
                    <span className="text-gray-500 text-xs">NO3</span>
                    <span className="text-[#003f5c] font-bold text-lg">0mg</span>
                </div>
            </div>

            <button
                onClick={() => setActiveScreen('scan')}
                className="primary-diagnose-cta w-full bg-gradient-to-r from-[#003f5c] to-[#005b96] text-white rounded-2xl p-5 shadow-lg shadow-blue-900/20 active:scale-[0.98] transition-all flex items-center justify-between group"
            >
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-2xl animate-pulse">
                        🩺
                    </div>
                    <div className="text-left">
                        <p className="font-bold text-lg">AI Bác sĩ cá</p>
                        <p className="text-blue-100 text-sm">Quét & Chẩn đoán ngay</p>
                    </div>
                </div>
                <i className="fa-solid fa-chevron-right group-hover:translate-x-1 transition-transform"></i>
            </button>
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
                        className="w-10 h-10 rounded-full bg-black/40 backdrop-blur flex items-center justify-center active:bg-black/60"
                    >
                        <i className="fa-solid fa-arrow-left"></i>
                    </button>
                    <span className="font-semibold bg-black/40 px-3 py-1 rounded-full text-sm backdrop-blur border border-white/10">
                        🤖 AI Vision Đang hoạt động
                    </span>
                    <div className="w-10 h-10"></div>
                </div>

                <form onSubmit={handleDiagnose} className="scan-diagnose-form flex flex-1 flex-col items-center gap-4">
                    <div className="scan-frame relative w-72 h-72 mx-auto border-2 border-white/30 rounded-3xl overflow-hidden backdrop-blur-[2px] shadow-2xl">
                        <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-[#4db6ac] rounded-tl-xl"></div>
                        <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-[#4db6ac] rounded-tr-xl"></div>
                        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-[#4db6ac] rounded-bl-xl"></div>
                        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-[#4db6ac] rounded-br-xl"></div>

                        {previewUrl ? (
                            <img src={previewUrl} alt="Fish preview" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-black/20 backdrop-blur-sm">
                                <p className="text-white text-center px-4">Chưa có ảnh</p>
                            </div>
                        )}

                        {loading && <div className="laser-line"></div>}

                        <label
                            htmlFor="fish-photo-camera-input"
                            className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-black/40 text-white text-xs font-bold py-1 px-3 rounded-full backdrop-blur cursor-pointer"
                        >
                            Chọn ảnh
                        </label>
                    </div>

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

                    <textarea
                        className="scan-note-input w-72 bg-black/40 backdrop-blur text-white placeholder-white/70 rounded-xl p-3 text-sm border border-white/20"
                        placeholder="Mô tả thêm triệu chứng (không bắt buộc)"
                        value={userPrompt}
                        onChange={(event) => setUserPrompt(event.target.value)}
                        rows={2}
                    />

                    <div className="scan-action-bar mt-auto flex justify-center items-center gap-8 w-full">
                        <button
                            type="button"
                            onClick={handleOpenCamera}
                            className="text-white text-xl w-12 h-12 rounded-full bg-black/20 flex items-center justify-center backdrop-blur"
                            aria-label="Chup anh truc tiep"
                        >
                            <i className="fa-solid fa-camera"></i>
                        </button>

                        <button
                            type="submit"
                            disabled={!canSubmit}
                            className="scan-shutter-btn w-20 h-20 rounded-full border-4 border-white bg-white/10 flex items-center justify-center relative disabled:opacity-50"
                        >
                            <div className={`scan-shutter-core w-16 h-16 rounded-full bg-white transition-transform ${canSubmit ? 'hover:scale-95 active:scale-75' : ''}`}>
                                {loading && (
                                    <div className="w-full h-full rounded-full border-4 border-[#4db6ac] border-t-transparent animate-spin"></div>
                                )}
                            </div>
                        </button>

                        <button
                            type="button"
                            onClick={handleOpenGallery}
                            className="text-white text-xl w-12 h-12 rounded-full bg-black/20 flex items-center justify-center backdrop-blur"
                            aria-label="Chon anh tu thu vien"
                        >
                            <i className="fa-solid fa-image"></i>
                        </button>
                    </div>
                </form>

                {errorMessage && (
                    <div className="scan-error absolute bottom-4 left-4 right-4 bg-red-500/90 text-white p-3 rounded-xl text-sm backdrop-blur">
                        {errorMessage}
                    </div>
                )}

                {isCameraModalOpen && (
                    <div className="camera-modal absolute inset-0 z-30 flex items-center justify-center p-4">
                        <div className="camera-modal__card w-full max-w-sm rounded-2xl overflow-hidden">
                            <div className="camera-modal__header flex items-center justify-between px-4 py-3">
                                <p className="text-sm font-bold text-white">Camera truc tiep</p>
                                <button
                                    type="button"
                                    onClick={handleCloseCameraModal}
                                    className="text-white w-8 h-8 rounded-full bg-white/15 flex items-center justify-center"
                                    aria-label="Dong camera"
                                >
                                    <i className="fa-solid fa-xmark"></i>
                                </button>
                            </div>

                            <div className="camera-modal__preview aspect-[3/4] bg-black">
                                <video ref={videoRef} className="w-full h-full object-cover" playsInline muted autoPlay />
                                <canvas ref={canvasRef} className="hidden" />
                            </div>

                            <div className="camera-modal__actions p-4">
                                <button
                                    type="button"
                                    onClick={handleCaptureFromWebcam}
                                    className="w-full bg-[#0d6987] text-white font-semibold py-3 rounded-xl"
                                >
                                    Chup anh nay
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
                    <button onClick={() => setActiveScreen('scan')} className="text-gray-600 p-2">
                        <i className="fa-solid fa-xmark text-xl"></i>
                    </button>
                    <h1 className="text-lg font-bold text-[#003f5c]">Kết quả chẩn đoán</h1>
                    <div className="w-6"></div>
                </div>

                <div className={`diagnosis-hero bg-gradient-to-br ${isHighRisk ? 'from-[#ff7c43] to-[#f55a42]' : 'from-[#4db6ac] to-[#009688]'} text-white rounded-2xl p-6 mb-6 shadow-lg relative overflow-hidden`}>
                    <div className="absolute -right-4 -top-4 text-white opacity-20 text-8xl rotate-12">
                        <i className={`fa-solid ${isHighRisk ? 'fa-triangle-exclamation' : 'fa-circle-check'}`}></i>
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="bg-white/20 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider backdrop-blur-sm">
                                {isHighRisk ? 'Nguy cơ cao' : 'Nguy cơ thấp'}
                            </span>
                            <span className="text-sm opacity-90">Độ chính xác: {confidencePercent}%</span>
                        </div>
                        <h2 className="text-3xl font-black mb-1">{result.diagnosis.disease_name}</h2>
                        {result.diagnosis.vision_note && (
                            <p className="text-orange-100 font-semibold italic opacity-90">{result.diagnosis.vision_note}</p>
                        )}
                    </div>
                </div>

                {result.visual_reference && (
                    <div className="mb-6">
                        <h3 className="text-[#003f5c] font-bold mb-3 flex items-center gap-2">
                            <i className="fa-solid fa-images text-[#4db6ac]"></i> Hình ảnh tham khảo
                        </h3>
                        <div className="flex gap-3 h-40">
                            <div className="flex-1 rounded-xl bg-gray-200 overflow-hidden relative shadow-md">
                                {previewUrl && (
                                    <img src={previewUrl} className="w-full h-full object-cover" alt="Your fish" />
                                )}
                                <span className="absolute bottom-2 left-2 text-white text-[10px] font-bold backdrop-blur-md bg-black/40 px-2 py-1 rounded-md border border-white/20">
                                    Cá của bạn
                                </span>
                            </div>
                            <div className="flex-1 rounded-xl bg-gray-200 overflow-hidden relative shadow-md">
                                <img
                                    src={result.visual_reference.image_url}
                                    className="w-full h-full object-cover filter grayscale contrast-125 brightness-110"
                                    alt="Disease sample"
                                />
                                <span className="absolute bottom-2 left-2 text-white text-[10px] font-bold backdrop-blur-md bg-red-600/80 px-2 py-1 rounded-md border border-white/20">
                                    Mẫu bệnh
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                <div className="glass-card detail-card rounded-2xl p-5 mb-6">
                    <h3 className="text-[#003f5c] font-bold mb-3">Chẩn đoán chi tiết</h3>
                    <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                            <span>Mã bệnh:</span>
                            <strong className="text-[#003f5c]">{result.diagnosis.label_code}</strong>
                        </div>
                        <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                            <span>ID phân tích:</span>
                            <strong className="text-[#003f5c]">{result.diagnosis.inference_id}</strong>
                        </div>
                        <div className="flex justify-between items-center">
                            <span>Nguồn dữ liệu:</span>
                            <strong className="text-[#003f5c]">{result.diagnosis.source}</strong>
                        </div>
                    </div>
                </div>

                {result.doctor_advice && (
                    <div className="glass-card detail-card rounded-2xl p-5 mb-6">
                        <h3 className="text-[#003f5c] font-bold mb-3">Lời khuyên từ bác sĩ</h3>
                        <p className="text-gray-600 text-sm leading-relaxed">{result.doctor_advice}</p>
                    </div>
                )}

                <button
                    onClick={() => setActiveScreen('treatment')}
                    className="w-full bg-[#003f5c] text-white font-bold rounded-xl py-4 shadow-xl hover:bg-[#002b40] active:scale-[0.98] transition flex justify-center items-center gap-2"
                >
                    Xem phác đồ điều trị <i className="fa-solid fa-arrow-right"></i>
                </button>
            </div>
        );
    };

    const renderTreatment = () => (
        <div className="treatment-screen px-6 pt-5 pb-24">
            <div className="flex justify-between items-center mb-6">
                <button onClick={() => setActiveScreen('result')} className="text-gray-600 p-2">
                    <i className="fa-solid fa-arrow-left text-xl"></i>
                </button>
                <h1 className="text-lg font-bold text-[#003f5c]">Phác đồ điều trị</h1>
                <div className="w-6"></div>
            </div>

            <div className="treatment-timeline relative border-l-4 border-gray-200 ml-4 space-y-8 mb-10">
                {result?.suggested_treatments?.map((treatment, index) => (
                    <div key={index} className="relative pl-8">
                        <div className={`absolute -left-[13px] top-0 w-6 h-6 rounded-full ${index === 0 ? 'bg-[#4db6ac] animate-pulse' : index === 1 ? 'bg-[#ff7c43]' : 'bg-gray-300'} border-4 border-white shadow-md`}>
                        </div>
                        <h3 className={`font-bold text-lg ${index === 0 ? 'text-[#003f5c]' : index === 1 ? 'text-[#ff7c43]' : 'text-gray-400'}`}>
                            {index === 0 ? 'Hôm nay' : index === 1 ? 'Ngày mai' : `Ngày ${index * 2 + 1}`}
                        </h3>
                        <p className="text-xs text-gray-400 mb-3 uppercase font-bold tracking-wider">
                            {index === 0 ? 'Bắt đầu ngay' : index === 1 ? 'Tiếp theo' : 'Theo dõi'}
                        </p>

                        <div className="glass-card treatment-card p-4 rounded-xl shadow-lg border border-teal-100">
                            <div className="flex items-center gap-2 mb-3 border-b pb-2 border-dashed border-gray-200">
                                <i className="fa-solid fa-user-doctor text-[#003f5c]"></i>
                                <span className="text-xs font-bold text-[#003f5c] uppercase">Điều trị</span>
                            </div>
                            <div className="flex gap-4 items-center">
                                {treatment.image ? (
                                    <div className="w-16 h-16 bg-orange-50 rounded-lg overflow-hidden border border-orange-100">
                                        <img src={treatment.image} alt={treatment.name} className="w-full h-full object-cover" />
                                    </div>
                                ) : (
                                    <div className="w-16 h-16 bg-orange-50 rounded-lg flex items-center justify-center text-2xl border border-orange-100">
                                        💊
                                    </div>
                                )}
                                <div className="flex-1">
                                    <h4 className="font-bold text-gray-800">{treatment.name}</h4>
                                    {treatment.price && (
                                        <p className="text-[#ff7c43] font-bold mt-1">{treatment.price}</p>
                                    )}
                                </div>
                            </div>
                            {treatment.link && (
                                <a
                                    href={treatment.link}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="w-full mt-3 bg-[#ff7c43] text-white font-bold py-3 rounded-lg text-sm shadow hover:bg-[#e66b35] active:scale-[0.98] transition flex items-center justify-center gap-2"
                                >
                                    <i className="fa-solid fa-cart-shopping"></i>
                                    Mua ngay
                                </a>
                            )}
                        </div>
                    </div>
                ))}

                {(!result?.suggested_treatments || result.suggested_treatments.length === 0) && (
                    <div className="relative pl-8">
                        <div className="absolute -left-[13px] top-0 w-6 h-6 rounded-full bg-gray-300 border-4 border-white"></div>
                        <h3 className="font-bold text-gray-400 text-lg">Ngày 1: Theo dõi</h3>
                        <p className="text-xs text-gray-400 mb-3 uppercase font-bold tracking-wider">Khuyến nghị</p>
                        <div className="bg-gray-50 p-4 rounded-xl text-gray-500 text-sm border border-gray-100">
                            <p>Quan sát cá thường xuyên. Đảm bảo chất lượng nước tốt.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div className="fish-doctor-page h-screen overflow-hidden bg-gradient-to-b from-[#f0fdfa] to-white">
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

                {/* Bottom Navigation */}
                {activeScreen !== 'scan' && (
                    <div className="bottom-nav rounded-t-2xl">
                        <button
                            onClick={() => setActiveScreen('dashboard')}
                            className={`nav-item ${activeScreen === 'dashboard' ? 'active' : ''}`}
                        >
                            <i className="fa-solid fa-house"></i>
                        </button>
                        <button className="nav-item">
                            <i className="fa-solid fa-cart-shopping"></i>
                        </button>

                        <div className="w-12"></div>

                        <button className="nav-item">
                            <i className="fa-solid fa-globe"></i>
                        </button>
                        <button className="nav-item">
                            <i className="fa-solid fa-gear"></i>
                        </button>

                        <div className="scan-btn-wrapper">
                            <button
                                onClick={() => setActiveScreen('scan')}
                                className="w-16 h-16 bg-[#003f5c] rounded-full text-white text-2xl shadow-[0_4px_15px_rgba(0,63,92,0.4)] flex items-center justify-center border-4 border-[#f0fdfa] active:scale-95 transition-transform"
                            >
                                <i className="fa-solid fa-camera"></i>
                            </button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
