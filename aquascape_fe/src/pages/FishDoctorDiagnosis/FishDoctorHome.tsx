import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./FishDoctorDiagnosis.scss";

export default function FishDoctorHome() {
    const navigate = useNavigate();
    const { t } = useTranslation();

    const handleStartDiagnosis = () => {
        navigate("/fish-doctor/diagnosis");
    };

    return (
        <div className="fish-doctor-page h-screen overflow-hidden bg-gradient-to-b from-[#f0fdfa] to-white">
            <div className="bubble bubble-1"></div>
            <div className="bubble bubble-2"></div>
            <div className="bubble bubble-3"></div>

            <main className="relative h-full overflow-y-auto hide-scrollbar">
                <div className="dashboard-screen px-6 pt-5 pb-24">
                    <div className="glass-card health-overview-card rounded-3xl p-6 relative overflow-hidden mb-6 text-center">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#4db6ac] opacity-5 rounded-full -mr-8 -mt-8"></div>
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#009688] opacity-5 rounded-full -ml-6 -mb-6"></div>

                        <h2 className="text-[#003f5c] font-bold text-lg mb-4 flex items-center justify-center gap-2">
                            <i className="fa-solid fa-heart-pulse text-[#4db6ac]"></i>
                            {t("FISH_DOCTOR.HOME.TITLE")}
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

                        <div className="items-center justify-center gap-2 text-[#009688] font-bold bg-teal-50 inline-block px-4 py-2 rounded-full text-sm border border-teal-100">
                            <i className="fa-regular fa-face-smile text-base"></i>
                            <span>{t("FISH_DOCTOR.HOME.STATUS_STABLE")}</span>
                        </div>
                    </div>

                    <div className="metrics-grid grid grid-cols-3 gap-3 mb-6">
                        <div className="glass-card metric-card rounded-2xl p-4 flex flex-col items-center shadow-sm group hover:bg-white">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-500 text-white flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                                <i className="fa-solid fa-temperature-high"></i>
                            </div>
                            <span className="text-gray-500 text-xs">{t("FISH_DOCTOR.HOME.METRICS.TEMP")}</span>
                            <span className="text-[#003f5c] font-bold text-lg">28°C</span>
                        </div>

                        <div className="glass-card metric-card rounded-2xl p-4 flex flex-col items-center shadow-sm group hover:bg-white">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-500 text-white flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                                <i className="fa-solid fa-flask"></i>
                            </div>
                            <span className="text-gray-500 text-xs">{t("FISH_DOCTOR.HOME.METRICS.PH")}</span>
                            <span className="text-[#003f5c] font-bold text-lg">6.5</span>
                        </div>

                        <div className="glass-card metric-card rounded-2xl p-4 flex flex-col items-center shadow-sm group hover:bg-white">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-green-500 text-white flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                                <i className="fa-solid fa-droplet"></i>
                            </div>
                            <span className="text-gray-500 text-xs">{t("FISH_DOCTOR.HOME.METRICS.NO3")}</span>
                            <span className="text-[#003f5c] font-bold text-lg">0mg</span>
                        </div>
                    </div>

                    <button
                        onClick={handleStartDiagnosis}
                        className="primary-diagnose-cta w-full bg-gradient-to-r from-[#003f5c] to-[#005b96] text-white rounded-2xl p-5 shadow-lg shadow-blue-900/20 active:scale-[0.98] transition-all flex items-center justify-between group relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity"></div>
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-3xl group-hover:rotate-12 transition-transform">
                                <i className="fa-solid fa-robot"></i>
                            </div>
                            <div className="text-left">
                                <p className="font-bold text-lg flex items-center gap-2">
                                    {t("FISH_DOCTOR.HOME.CTA.TITLE")}
                                    <i className="fa-solid fa-stethoscope text-sm opacity-75"></i>
                                </p>
                                <p className="text-blue-100 text-sm flex items-center gap-1">
                                    <i className="fa-regular fa-eye"></i>
                                    {t("FISH_DOCTOR.HOME.CTA.SUBTITLE")}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm opacity-75 group-hover:opacity-100 transition-opacity">{t("FISH_DOCTOR.HOME.CTA.START")}</span>
                            <i className="fa-solid fa-arrow-right-long group-hover:translate-x-1 transition-transform"></i>
                        </div>
                    </button>

                    <div className="mt-6 grid grid-cols-4 gap-2">
                        <button className="flex flex-col items-center p-3 rounded-2xl bg-white/50 backdrop-blur-sm border border-white/60 hover:bg-white/80 transition-all">
                            <i className="fa-solid fa-water text-[#4db6ac] text-xl mb-1"></i>
                            <span className="text-[10px] text-gray-600">{t("FISH_DOCTOR.HOME.SHORTCUTS.QUALITY")}</span>
                        </button>
                        <button className="flex flex-col items-center p-3 rounded-2xl bg-white/50 backdrop-blur-sm border border-white/60 hover:bg-white/80 transition-all">
                            <i className="fa-solid fa-clock text-[#ff7c43] text-xl mb-1"></i>
                            <span className="text-[10px] text-gray-600">{t("FISH_DOCTOR.HOME.SHORTCUTS.REMINDER")}</span>
                        </button>
                        <button className="flex flex-col items-center p-3 rounded-2xl bg-white/50 backdrop-blur-sm border border-white/60 hover:bg-white/80 transition-all">
                            <i className="fa-solid fa-book-open text-[#003f5c] text-xl mb-1"></i>
                            <span className="text-[10px] text-gray-600">{t("FISH_DOCTOR.HOME.SHORTCUTS.LOG")}</span>
                        </button>
                        <button className="flex flex-col items-center p-3 rounded-2xl bg-white/50 backdrop-blur-sm border border-white/60 hover:bg-white/80 transition-all">
                            <i className="fa-solid fa-chart-line text-[#009688] text-xl mb-1"></i>
                            <span className="text-[10px] text-gray-600">{t("FISH_DOCTOR.HOME.SHORTCUTS.STATS")}</span>
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}
