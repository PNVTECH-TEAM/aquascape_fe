import { useState, useEffect, useCallback, useRef, type ChangeEvent } from "react";
import { useTranslation } from "react-i18next";
import type { TankSize, TankPreset } from "@app/core/interface";
import type { TankAnalysisSnapshot, TankLightingMode } from "@app/core/hooks/useTankSetup.types";
import { useTankSetup, calculateTankInfo } from "@app/core/hooks/useTankSetup";
import { getAquariumCatalog, getLatestTankLayout, getTankPresets, getTanks } from "@app/core/services/aquariumAPI";
import * as aquariumImages from "@app/assets/images";
import { useGameMechanics } from "./hooks/useTankStatistics";
import { useLayoutSave } from "./hooks/useLayoutSave";
import "./Aquarium3D.scss";
import FishAquarium3D from "./FishAquarium3D/FishAquarium3D";

export default function Aquarium3D() {
    const { t } = useTranslation();
    const [panelOpen, setPanelOpen] = useState<boolean>(false);
    const [explorerOpen, setExplorerOpen] = useState<boolean>(false);
    const [scoreHudOpen, setScoreHudOpen] = useState<boolean>(true);
    const [lightingMode, setLightingMode] = useState<TankLightingMode>("day");
    const [saveDialogOpen, setSaveDialogOpen] = useState<boolean>(false);
    const [tankNameInput, setTankNameInput] = useState<string>("");
    const [tankPreviewImageUrl, setTankPreviewImageUrl] = useState<string>("");

    const [size, setSize] = useState<TankSize>({ width: 90, height: 45, depth: 45 });
    const [customSize, setCustomSize] = useState<TankSize>({ width: 90, height: 45, depth: 45 });
    const [analysisSnapshot, setAnalysisSnapshot] = useState<TankAnalysisSnapshot>({
        tank: {
            size: { width: 90, height: 45, depth: 45 },
            volumeLiters: calculateTankInfo(90, 45, 45).volume,
            glassThicknessMm: calculateTankInfo(90, 45, 45).thickness,
        },
        items: [],
    });
    const [presets, setPresets] = useState<TankPreset[]>([]);
    const [presetsLoading, setPresetsLoading] = useState<boolean>(true);
    const restoredSizeKeyRef = useRef<string>("");
    const sizeKey = `${size.width}x${size.height}x${size.depth}`;
    const tankNameKey = `My Tank ${sizeKey}`;

    const game = useGameMechanics(analysisSnapshot);

    useEffect(() => {
        game.resetForTank(sizeKey);
    }, [game.resetForTank, sizeKey]);

    useEffect(() => {
        setTankNameInput(tankNameKey);
    }, [tankNameKey]);

    useEffect(() => {
        const fetchPresets = async () => {
            try {
                const data = await getTankPresets();
                setPresets(data);
                if (data.length > 0) {
                    setSize(data[0].size);
                    setCustomSize(data[0].size);
                }
            } catch (error) {
                console.error("Error fetching tank presets:", error);
            } finally {
                setPresetsLoading(false);
            }
        };

        fetchPresets();
    }, []);

    const onLoadingComplete = useCallback(() => {
        // Scene loaded successfully
    }, []);

    const {
        containerRef,
        tankInfo,
        loading,
        handleApplySize,
        handleResetView,
        addItem,
        triggerFishRush,
        getLayoutSnapshot,
    } = useTankSetup(
        size,
        setSize,
        onLoadingComplete,
        lightingMode,
        8,
        game.onTankItemAdded,
        setAnalysisSnapshot
    );

    useEffect(() => {
        if (loading || restoredSizeKeyRef.current === sizeKey) return;
        restoredSizeKeyRef.current = sizeKey;

        const restoreLatestLayout = async () => {
            try {
                const [tanks, catalog] = await Promise.all([getTanks(), getAquariumCatalog()]);
                const isSameSize = (a: TankSize, b: TankSize) =>
                    a.width === b.width && a.height === b.height && a.depth === b.depth;
                const toTimestamp = (value?: string): number => {
                    if (!value) return 0;
                    const timestamp = new Date(value).getTime();
                    return Number.isFinite(timestamp) ? timestamp : 0;
                };
                const pickMostRecentTank = (entries: typeof tanks) =>
                    [...entries].sort((a, b) => {
                        const aTime = Math.max(toTimestamp(a.updatedAt), toTimestamp(a.createdAt));
                        const bTime = Math.max(toTimestamp(b.updatedAt), toTimestamp(b.createdAt));
                        return bTime - aTime;
                    })[0];

                const sameNameTanks = tanks.filter((tank) => tank.name === tankNameKey);
                const sameSizeTanks = tanks.filter((tank) => isSameSize(tank.size, size));
                const selectedTank = pickMostRecentTank(
                    sameNameTanks.length > 0 ? sameNameTanks : sameSizeTanks
                );

                if (!selectedTank) return;
                const latestLayout = await getLatestTankLayout(selectedTank.id);
                if (!latestLayout || latestLayout.items.length === 0) return;

                const catalogById = new Map(catalog.map((item) => [item.id, item]));
                const getImageFromKey = (imageKey?: string): string | undefined => {
                    if (!imageKey) return undefined;
                    if (/^https?:\/\//i.test(imageKey) || imageKey.startsWith("/")) return imageKey;
                    return (aquariumImages as Record<string, string>)[imageKey];
                };

                latestLayout.items.forEach((savedItem) => {
                    const catalogItem = catalogById.get(savedItem.catalogItemId);
                    if (!catalogItem) return;

                    addItem(
                        {
                            id: catalogItem.id,
                            name: catalogItem.name,
                            category: catalogItem.category,
                            type: catalogItem.type,
                            url: catalogItem.url,
                            image: getImageFromKey(catalogItem.imageKey),
                        },
                        savedItem.transform.position,
                        savedItem.transform
                    );
                });
            } catch (error) {
                console.error("Error restoring latest layout:", error);
            }
        };

        restoreLatestLayout();
    }, [addItem, loading, size, sizeKey, tankNameKey]);

    const { savingLayout, handleSaveLayout } = useLayoutSave({
        size,
        getLayoutSnapshot,
        onStatusChange: game.setStatusText,
    });

    const onOpenSaveDialog = () => {
        if (!tankNameInput.trim()) {
            setTankNameInput(tankNameKey);
        }
        setSaveDialogOpen(true);
    };

    const onSelectPreviewImage = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            if (typeof reader.result === "string") {
                setTankPreviewImageUrl(reader.result);
            }
        };
        reader.readAsDataURL(file);
        event.target.value = "";
    };

    const onConfirmSave = async () => {
        const saved = await handleSaveLayout({
            tankName: tankNameInput,
            previewImageUrl: tankPreviewImageUrl,
        });

        if (saved) {
            setSaveDialogOpen(false);
        }
    };

    const onFeedFish = () => {
        game.handleFeedFish();
        triggerFishRush(7);
    };

    return (
        <div className="aquarium3d-page">
            <div className={`loading ${loading ? "" : "hidden"}`}>
                <div className="spinner"></div>
            </div>

            <div ref={containerRef} className="canvas-container" />

            <button
                className="hud-toggle-btn"
                onClick={() => setScoreHudOpen((prev) => !prev)}
                title={scoreHudOpen ? "Hide scoreboard" : "Show scoreboard"}
                aria-label={scoreHudOpen ? "Hide scoreboard" : "Show scoreboard"}
            >
                {scoreHudOpen ? "Hide HUD" : "Show HUD"}
            </button>

            {scoreHudOpen && (
                <div className="game-hud">
                    <div className="hud-top">
                        <div className="hud-metric">
                            <span className="hud-label">Fish</span>
                            <span className="hud-value">{game.stats.fish}</span>
                        </div>
                        <div className="hud-metric">
                            <span className="hud-label">Plants</span>
                            <span className="hud-value">{game.stats.plants}</span>
                        </div>
                        <div className="hud-metric">
                            <span className="hud-label">Rocks</span>
                            <span className="hud-value">{game.stats.rocks}</span>
                        </div>
                    </div>

                    <div className="hud-status">{game.statusText}</div>

                    <div className="hud-quests">
                        <div className="quest-item">
                            <span>Total Items</span>
                            <span>{game.stats.totalItems}</span>
                        </div>
                        <div className="quest-item">
                            <span>Feeds</span>
                            <span>{game.stats.feeds}</span>
                        </div>
                        <div className="quest-item">
                            <span>Suggestion</span>
                            <span>{game.suggestion}</span>
                        </div>
                        <div className="quest-item">
                            <span>Reminder</span>
                            <span>{game.reminder}</span>
                        </div>
                    </div>

                    <button className="feed-btn" onClick={onFeedFish}>
                        Feed Fish
                    </button>
                </div>
            )}

            <div className="control-buttons">
                <button className="control-btn" onClick={() => setPanelOpen(true)} title={t("AQUARIUM3D.SETTINGS")}>S</button>
                <button className="control-btn" onClick={handleResetView} title={t("AQUARIUM3D.RESET_VIEW")}>R</button>
                <button
                    className={`control-btn save-control-btn ${savingLayout ? "disabled" : ""}`}
                    onClick={onOpenSaveDialog}
                    disabled={savingLayout}
                    title={t("AQUARIUM3D.SAVE_LAYOUT")}
                >
                    {savingLayout ? t("AQUARIUM3D.SAVING_SHORT") : t("AQUARIUM3D.SAVE_SHORT")}
                </button>
            </div>

            <button
                className={`explorer-toggle ${explorerOpen ? "active" : ""}`}
                onClick={() => setExplorerOpen((prev) => !prev)}
                title="Aquatic Explorer"
                aria-label="Toggle Aquatic Explorer"
            >
                {explorerOpen ? "<" : ">"}
            </button>

            <div className={`explorer-panel ${explorerOpen ? "active" : ""}`}>
                <div className="explorer-header">Aquatic Explorer</div>
                <div className="explorer-content">
                    <FishAquarium3D />
                </div>
            </div>

            <div className={`control-panel ${panelOpen ? "active" : ""}`}>
                <button className="close-panel" onClick={() => setPanelOpen(false)}>x</button>
                <h1>{t("AQUARIUM3D.TITLE")}</h1>

                <div className="section">
                    <div className="section-title">Lighting</div>
                    <div className="lighting-options">
                        <button
                            className={`lighting-btn ${lightingMode === "day" ? "active" : ""}`}
                            onClick={() => setLightingMode("day")}
                        >
                            Ban ngay
                        </button>
                        <button
                            className={`lighting-btn ${lightingMode === "night" ? "active" : ""}`}
                            onClick={() => setLightingMode("night")}
                        >
                            Ban dem
                        </button>
                    </div>
                </div>

                <div className="section">
                    <div className="section-title">{t("AQUARIUM3D.TANK_SIZE")}</div>
                    <div className="size-options">
                        {presetsLoading ? (
                            <div>Loading presets...</div>
                        ) : (
                            presets.map((preset: TankPreset) => (
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
                                    {preset.name}
                                    <br />
                                    {preset.size.width}x{preset.size.height}x{preset.size.depth}
                                </div>
                            ))
                        )}
                    </div>

                    <div style={{ marginTop: "15px" }}>
                        <div className="section-title">{t("AQUARIUM3D.CUSTOM_SIZE")}</div>
                        <div className="custom-size">
                            <input
                                type="number"
                                className="custom-input"
                                id="widthInput"
                                placeholder={t("AQUARIUM3D.WIDTH")}
                                min="20"
                                max="200"
                                value={customSize.width}
                                onChange={(e) => setCustomSize({
                                    ...customSize,
                                    width: parseInt(e.target.value) || 90,
                                })}
                                step="1"
                            />
                            <input
                                type="number"
                                className="custom-input"
                                id="heightInput"
                                placeholder={t("AQUARIUM3D.HEIGHT")}
                                min="20"
                                max="100"
                                value={customSize.height}
                                onChange={(e) => setCustomSize({
                                    ...customSize,
                                    height: parseInt(e.target.value) || 45,
                                })}
                                step="1"
                            />
                            <input
                                type="number"
                                className="custom-input"
                                id="depthInput"
                                placeholder={t("AQUARIUM3D.DEPTH")}
                                min="20"
                                max="100"
                                value={customSize.depth}
                                onChange={(e) => setCustomSize({
                                    ...customSize,
                                    depth: parseInt(e.target.value) || 45,
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

                <button className="apply-btn" onClick={() => handleApplySize(customSize)}>{t("AQUARIUM3D.APPLY_SIZE")}</button>
            </div>

            <div className="tank-info">
                <div className="info-item">
                    <div className="info-value">{size.width}x{size.height}x{size.depth}</div>
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

            {saveDialogOpen && (
                <div className="save-dialog-overlay" onClick={() => !savingLayout && setSaveDialogOpen(false)}>
                    <div className="save-dialog" onClick={(event) => event.stopPropagation()}>
                        <div className="save-dialog-title">Save Aquarium</div>

                        <label className="save-dialog-label" htmlFor="tankNameInputDialog">
                            Tank name
                        </label>
                        <input
                            id="tankNameInputDialog"
                            className="save-dialog-input"
                            value={tankNameInput}
                            onChange={(event) => setTankNameInput(event.target.value)}
                            placeholder="My dream tank"
                        />

                        <label className="save-dialog-label" htmlFor="tankImageUrlInputDialog">
                            Preview image URL
                        </label>
                        <input
                            id="tankImageUrlInputDialog"
                            className="save-dialog-input"
                            value={tankPreviewImageUrl}
                            onChange={(event) => setTankPreviewImageUrl(event.target.value)}
                            placeholder="https://..."
                        />

                        <label className="save-dialog-upload-btn" htmlFor="tankImageFileInputDialog">
                            Choose image file
                        </label>
                        <input
                            id="tankImageFileInputDialog"
                            className="save-dialog-file-input"
                            type="file"
                            accept="image/*"
                            onChange={onSelectPreviewImage}
                        />

                        {tankPreviewImageUrl && (
                            <img
                                className="save-dialog-preview-image"
                                src={tankPreviewImageUrl}
                                alt="Tank preview"
                            />
                        )}

                        <div className="save-dialog-actions">
                            <button
                                className="save-dialog-btn secondary"
                                onClick={() => setSaveDialogOpen(false)}
                                disabled={savingLayout}
                            >
                                Cancel
                            </button>
                            <button
                                className="save-dialog-btn primary"
                                onClick={onConfirmSave}
                                disabled={savingLayout}
                            >
                                {savingLayout ? "Saving..." : "Save"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
