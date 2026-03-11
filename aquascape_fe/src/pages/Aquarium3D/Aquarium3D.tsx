import { useState, useEffect, useCallback, useRef, type ChangeEvent } from "react";
import { useTranslation } from "react-i18next";
import type { TankSize, TankPreset } from "@app/core/interface";
import type { TankAnalysisSnapshot, TankLightingMode } from "@app/core/hooks/useTankSetup.types";
import { useTankSetup, calculateTankInfo } from "@app/core/hooks/useTankSetup";
import { getAquariumCatalog, getLatestTankLayout, getTankPresets, getTanks, getUserAssets } from "@app/core/services/aquariumAPI";
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
    const [userTanks, setUserTanks] = useState<any[]>([]);
    const [selectedTankId, setSelectedTankId] = useState<string | null>(null);
    
    // Flag to ensure initial restoration only happens once
    const initialRestorationDoneRef = useRef<boolean>(false);
    
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
        const fetchPresetsAndTanks = async () => {
            try {
                const [presetData, tanksData] = await Promise.all([
                    getTankPresets(),
                    getTanks()
                ]);
                
                setPresets(presetData);
                setUserTanks(tanksData);

                // Initial restoration logic: load the most recent tank across all sizes
                if (!initialRestorationDoneRef.current && tanksData.length > 0) {
                    initialRestorationDoneRef.current = true;
                    
                    const toTimestamp = (value?: string): number => {
                        if (!value) return 0;
                        const timestamp = new Date(value).getTime();
                        return Number.isFinite(timestamp) ? timestamp : 0;
                    };

                    const mostRecentTank = [...tanksData].sort((a, b) => {
                        const aTime = Math.max(toTimestamp(a.updatedAt), toTimestamp(a.createdAt));
                        const bTime = Math.max(toTimestamp(b.updatedAt), toTimestamp(b.createdAt));
                        return bTime - aTime;
                    })[0];

                    if (mostRecentTank) {
                        if (mostRecentTank.size) {
                            setSize(mostRecentTank.size);
                            setCustomSize(mostRecentTank.size);
                        }
                        setTankNameInput(mostRecentTank.name);
                        // Delay loading items until the scene is likely initialized for the new size
                        setTimeout(() => loadTankItems(mostRecentTank.id), 500);
                    }
                } else if (presetData.length > 0 && !initialRestorationDoneRef.current) {
                    // Fallback to first preset if no user tanks
                    setSize(presetData[0].size);
                    setCustomSize(presetData[0].size);
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setPresetsLoading(false);
            }
        };

        fetchPresetsAndTanks();
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
        clearItems,
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

    const loadTankItems = useCallback(async (tankId: string) => {
        try {
            const [catalog, userAssets, latestLayout] = await Promise.all([
                getAquariumCatalog().catch(() => []),
                getUserAssets().catch(() => []),
                getLatestTankLayout(tankId)
            ]);

            // Clear current items before adding new ones
            clearItems();
            setSelectedTankId(tankId);

            if (!latestLayout || latestLayout.items.length === 0) return;

            // Merge system catalog and user assets into one lookup map
            const backendUrl = import.meta.env.VITE_BACKEND_URL || "";
            const getFullUrl = (path?: string) => {
                if (!path) return undefined;
                if (/^https?:\/\//i.test(path)) return path;
                const normalizedPath = path.startsWith("/") ? path : `/${path}`;
                return `${backendUrl}${normalizedPath}`;
            };

            const mappedUserAssets = userAssets.map((asset) => ({
                id: String(asset.id),
                name: asset.name,
                category: "My Assets",
                type: asset.type as any,
                url: getFullUrl(asset.glbUrl),
                imageKey: getFullUrl(asset.previewImageUrl),
            }));

            const allCatalogItems = [...catalog, ...mappedUserAssets];
            const catalogById = new Map(allCatalogItems.map((item) => [String(item.id), item]));
            const getImageFromKey = (imageKey?: string): string | undefined => {
                if (!imageKey) return undefined;
                if (/^https?:\/\//i.test(imageKey) || imageKey.startsWith("/")) return imageKey;
                return (aquariumImages as Record<string, string>)[imageKey];
            };

            latestLayout.items.forEach((savedItem: any) => {
                const itemId = savedItem.userAssetId || savedItem.catalogItemId;
                const catalogItem = catalogById.get(String(itemId));
                if (!catalogItem) return;

                addItem(
                    {
                        id: catalogItem.id,
                        name: catalogItem.name,
                        category: catalogItem.category,
                        type: catalogItem.type,
                        url: catalogItem.url as string,
                        image: getImageFromKey(catalogItem.imageKey),
                    },
                    savedItem.transform.position,
                    savedItem.transform
                );
            });
        } catch (error) {
            console.error("Error loading tank items:", error);
        }
    }, [addItem, clearItems]);

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
            // Update local state with fresh tank list
            getTanks().then(setUserTanks);
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
                    </div>
                    <button className="feed-btn" onClick={onFeedFish}>
                        Feed Fish
                    </button>
                </div>
            )}

            <div className="control-buttons">
                <button className="control-btn" onClick={() => setPanelOpen(true)}>S</button>
                <button className="control-btn" onClick={handleResetView}>R</button>
                <button
                    className={`control-btn save-control-btn ${savingLayout ? "disabled" : ""}`}
                    onClick={onOpenSaveDialog}
                    disabled={savingLayout}
                >
                    {savingLayout ? "..." : "Save"}
                </button>
            </div>

            <button
                className={`explorer-toggle ${explorerOpen ? "active" : ""}`}
                onClick={() => setExplorerOpen((prev) => !prev)}
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
                            Daylight
                        </button>
                        <button
                            className={`lighting-btn ${lightingMode === "night" ? "active" : ""}`}
                            onClick={() => setLightingMode("night")}
                        >
                            Nightlight
                        </button>
                    </div>
                </div>

                <div className="section">
                    <div className="section-title">{t("AQUARIUM3D.TANK_SIZE")}</div>
                    <div className="size-options">
                        {presetsLoading ? (
                            <div>Loading...</div>
                        ) : (
                            presets.map((preset: TankPreset) => (
                                <div
                                    key={preset.id}
                                    className={`size-btn ${size.width === preset.size.width &&
                                        size.height === preset.size.height &&
                                        size.depth === preset.size.depth ? "active" : ""
                                        }`}
                                    onClick={() => {
                                        const s = preset.size;
                                        
                                        // 1. Switch size immediately using handleApplySize for 3D logic
                                        handleApplySize(s);
                                        setCustomSize(s);
                                        
                                        // 2. Clear current items
                                        clearItems();
                                        
                                        // 3. Find and load latest tank for this new size
                                        const sameSizeTanks = userTanks.filter(tank => 
                                            tank.size.width === s.width && 
                                            tank.size.height === s.height && 
                                            tank.size.depth === s.depth
                                        );
                                        
                                        if (sameSizeTanks.length > 0) {
                                            const toTimestamp = (value?: string): number => {
                                                if (!value) return 0;
                                                const timestamp = new Date(value).getTime();
                                                return Number.isFinite(timestamp) ? timestamp : 0;
                                            };
                                            
                                            const latestForSize = [...sameSizeTanks].sort((a, b) => {
                                                const aTime = Math.max(toTimestamp(a.updatedAt), toTimestamp(a.createdAt));
                                                const bTime = Math.max(toTimestamp(b.updatedAt), toTimestamp(b.createdAt));
                                                return bTime - aTime;
                                            })[0];
                                            
                                            if (latestForSize) {
                                                setTankNameInput(latestForSize.name);
                                                // Slight delay to allow the 3D scene to reset
                                                setTimeout(() => loadTankItems(latestForSize.id), 300);
                                            }
                                        } else {
                                            setSelectedTankId(null);
                                            setTankNameInput(`My Tank ${s.width}x${s.height}x${s.depth}`);
                                        }
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
                                value={customSize.width}
                                onChange={(e) => setCustomSize({
                                    ...customSize,
                                    width: parseInt(e.target.value) || 90,
                                })}
                            />
                            <input
                                type="number"
                                className="custom-input"
                                value={customSize.height}
                                onChange={(e) => setCustomSize({
                                    ...customSize,
                                    height: parseInt(e.target.value) || 45,
                                })}
                            />
                            <input
                                type="number"
                                className="custom-input"
                                value={customSize.depth}
                                onChange={(e) => setCustomSize({
                                    ...customSize,
                                    depth: parseInt(e.target.value) || 45,
                                })}
                            />
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
            </div>

            {saveDialogOpen && (
                <div className="save-dialog-overlay" onClick={() => !savingLayout && setSaveDialogOpen(false)}>
                    <div className="save-dialog" onClick={(event) => event.stopPropagation()}>
                        <div className="save-dialog-title">Save Aquarium</div>
                        <input
                            className="save-dialog-input"
                            value={tankNameInput}
                            onChange={(event) => setTankNameInput(event.target.value)}
                            placeholder="Tank name"
                        />
                        <div className="save-dialog-actions">
                            <button onClick={() => setSaveDialogOpen(false)}>Cancel</button>
                            <button onClick={onConfirmSave} disabled={savingLayout}>
                                {savingLayout ? "Saving..." : "Save"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
