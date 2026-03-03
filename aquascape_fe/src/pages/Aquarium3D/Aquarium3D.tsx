import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import type { TankSize, TankPreset } from "@app/core/interface";
import { useTankSetup, calculateTankInfo } from "@app/core/hooks/useTankSetup";
import { getTankPresets } from "@app/core/services/aquariumAPI";
import "./Aquarium3D.scss";
import FishAquarium3D from "./FishAquarium3D/FishAquarium3D";

export default function Aquarium3D() {
    const { t } = useTranslation();
    const [panelOpen, setPanelOpen] = useState<boolean>(false);
    const [size, setSize] = useState<TankSize>({ width: 90, height: 45, depth: 45 });
    const [customSize, setCustomSize] = useState<TankSize>({ width: 90, height: 45, depth: 45 });
    const [presets, setPresets] = useState<TankPreset[]>([]);
    const [presetsLoading, setPresetsLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchPresets = async () => {
            try {
                const data = await getTankPresets();
                setPresets(data);
            } catch (error) {
                console.error('Error fetching tank presets:', error);
            } finally {
                setPresetsLoading(false);
            }
        };

        fetchPresets();
    }, []);

    // 🔒 Memoize callback để không recreate mỗi render
    const onLoadingComplete = useCallback(() => {
        // Scene loaded successfully
    }, []);

    const {
        containerRef,
        tankInfo,
        loading,
        handleApplySize,
        handleResetView
    } = useTankSetup(size, setSize, onLoadingComplete);

    return (
        <>
            <div className={`loading ${loading ? "" : "hidden"}`}>
                <div className="spinner"></div>
            </div>

            <div ref={containerRef} className="canvas-container" />

            <div className="control-buttons">
                <button className="control-btn" onClick={() => setPanelOpen(true)} title={t("AQUARIUM3D.SETTINGS")}>⚙️</button>
                <button className="control-btn" onClick={handleResetView} title={t("AQUARIUM3D.RESET_VIEW")}>↺</button>
            </div>

            <div className={`control-panel ${panelOpen ? "active" : ""}`}>
                <button className="close-panel" onClick={() => setPanelOpen(false)}>×</button>
                <h1>{t("AQUARIUM3D.TITLE")}</h1>

                <div className="section">
                    <div className="section-title">{t("AQUARIUM3D.TANK_SIZE")}</div>
                    <div className="size-options">
                        {presetsLoading ? (
                            <div>Loading presets...</div>
                        ) : (
                            presets.map((preset: TankPreset) => {
                                const labelKey = preset.id.toUpperCase();
                                const label = t(`AQUARIUM3D.${labelKey}`);
                                return (
                                    <div
                                        key={preset.id}
                                        className={`size-btn ${size.width === preset.size.width &&
                                            size.height === preset.size.height &&
                                            size.depth === preset.size.depth ? "active" : ""
                                            }`}
                                        onClick={() => {
                                            setSize(preset.size);
                                            setCustomSize(preset.size);
                                        }}
                                    >
                                        {label}
                                        <br />
                                        {preset.size.width}×{preset.size.height}×{preset.size.depth}
                                    </div>
                                );
                            })
                        )}
                    </div>

                    <div style={{ marginTop: "15px" }}>
                        <div className="section-title">{t("AQUARIUM3D.CUSTOM_SIZE")}</div>
                        <div className="custom-size">
                            <input type="number" className="custom-input" id="widthInput" placeholder={t("AQUARIUM3D.WIDTH")} min="20" max="200"
                                value={customSize.width}
                                onChange={(e) => setCustomSize({
                                    ...customSize,
                                    width: parseInt(e.target.value) || 90
                                })}
                                step="1"
                            />
                            <input type="number" className="custom-input" id="heightInput" placeholder={t("AQUARIUM3D.HEIGHT")} min="20" max="100"
                                value={customSize.height}
                                onChange={(e) => setCustomSize({
                                    ...customSize,
                                    height: parseInt(e.target.value) || 45
                                })}
                                step="1"
                            />
                            <input type="number" className="custom-input" id="depthInput" placeholder={t("AQUARIUM3D.DEPTH")} min="20" max="100"
                                value={customSize.depth}
                                onChange={(e) => setCustomSize({
                                    ...customSize,
                                    depth: parseInt(e.target.value) || 45
                                })}
                                step="1"
                            />
                        </div>
                    </div>

                    <div className="dimension-display">
                        <div className="dimension-item">
                            <div className="dimension-value">{customSize.width}</div>
                            <div className="dimension-label">{t("AQUARIUM3D.WIDE_LABEL")}</div>
                        </div>
                        <div className="dimension-item">
                            <div className="dimension-value">{customSize.height}</div>
                            <div className="dimension-label">{t("AQUARIUM3D.HEIGHT_LABEL")}</div>
                        </div>
                        <div className="dimension-item">
                            <div className="dimension-value">{customSize.depth}</div>
                            <div className="dimension-label">{t("AQUARIUM3D.DEPTH_LABEL")}</div>
                        </div>
                    </div>

                </div>

                <div className="section">
                    <div className="dimension-display">
                        <div className="dimension-item">
                            <div className="dimension-value">
                                {calculateTankInfo(customSize.width, customSize.height, customSize.depth).volume}
                            </div>
                            <div className="dimension-label">{t("AQUARIUM3D.VOLUME")}</div>
                        </div>
                        <div className="dimension-item">
                            <div className="dimension-value">
                                {calculateTankInfo(customSize.width, customSize.height, customSize.depth).thickness}
                            </div>
                            <div className="dimension-label">{t("AQUARIUM3D.GLASS_THICKNESS")}</div>
                        </div>
                    </div>

                </div>

                <div className="section">
                    <FishAquarium3D />
                </div>

                <button className="apply-btn" onClick={() => handleApplySize(customSize)}>{t("AQUARIUM3D.APPLY_SIZE")}</button>
            </div>
            <div className="tank-info">
                <div className="info-item">
                    <div className="info-value">
                        {size.width}×{size.height}×{size.depth}
                    </div>
                    <div className="info-label">{t("AQUARIUM3D.TANK_DIMENSION")}</div>
                </div>
                <div className="info-item">
                    <div className="info-value">{tankInfo.volume}</div>
                    <div className="info-label">{t("AQUARIUM3D.WATER_VOLUME")}</div>
                </div>
                <div className="info-item">
                    <div className="info-value">{tankInfo.glassWeight}</div>
                    <div className="info-label">{t("AQUARIUM3D.GLASS_WEIGHT")}</div>
                </div>
            </div>
        </>
    );
}