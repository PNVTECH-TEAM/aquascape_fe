import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import type { AddedItemEvent } from "../types";
import type { TankAnalysisSnapshot } from "@app/core/hooks/useTankSetup.types";
import {
    getAquariumAdviceFromAI,
    isAquariumAdviceRateLimitError,
    isGeminiConfigured,
} from "@app/core/services/geminiAquariumAdvisor";

export interface TankStatistics {
    fish: number;
    plants: number;
    rocks: number;
    feeds: number;
    totalItems: number;
}

const classifyItem = (item: AddedItemEvent): "fish" | "plants" | "rocks" | "other" => {
    if (item.isFish || item.type === "fish") return "fish";

    const category = (item.category ?? "").toLowerCase();
    const sourceType = (item.sourceType ?? "").toLowerCase();
    const sourceName = (item.sourceName ?? "").toLowerCase();

    if (category === "plants" || sourceType === "plant") return "plants";
    if (category === "rocks" || sourceType === "rock") return "rocks";
    if (sourceName.includes("plant") || sourceName.includes("coral")) return "plants";
    if (sourceName.includes("rock") || sourceName.includes("stone")) return "rocks";
    return "other";
};

const EMPTY_ANALYSIS_SNAPSHOT: TankAnalysisSnapshot = {
    tank: {
        size: { width: 0, height: 0, depth: 0 },
        volumeLiters: 0,
        glassThicknessMm: 0,
    },
    items: [],
};

export const useGameMechanics = (layoutSnapshot: TankAnalysisSnapshot = EMPTY_ANALYSIS_SNAPSHOT) => {
    const { t } = useTranslation();

    const [stats, setStats] = useState<TankStatistics>({
        fish: 0,
        plants: 0,
        rocks: 0,
        feeds: 0,
        totalItems: 0,
    });

    const [statusText, setStatusText] = useState<string>(
        t("AQUARIUM3D.GAME_START_HINT")
    );
    const [suggestion, setSuggestion] = useState<string>("AI is analyzing your aquarium...");
    const [reminder, setReminder] = useState<string>("AI reminder will appear here.");
    const currentTankKeyRef = useRef<string>("");
    const lastRequestedKeyRef = useRef<string>("");
    const inFlightRef = useRef<boolean>(false);

    const resetForTank = useCallback((tankKey: string) => {
        if (!tankKey || currentTankKeyRef.current === tankKey) return;
        currentTankKeyRef.current = tankKey;
        lastRequestedKeyRef.current = "";
        setStats({
            fish: 0,
            plants: 0,
            rocks: 0,
            feeds: 0,
            totalItems: 0,
        });
        setStatusText(t("AQUARIUM3D.GAME_START_HINT"));
        setSuggestion("Add items to the tank, then AI will analyze compatibility.");
        setReminder("No reminder yet.");
    }, [t]);

    const onTankItemAdded = useCallback((item: AddedItemEvent) => {
        const kind = classifyItem(item);

        if (kind === "fish") {
            setStatusText(`Fish added: ${item.sourceName ?? "Unknown fish"}.`);
            return;
        }

        if (kind === "plants") {
            setStatusText(`Plant added: ${item.sourceName ?? "Unknown plant"}.`);
            return;
        }

        if (kind === "rocks") {
            setStatusText(`Rock added: ${item.sourceName ?? "Unknown rock"}.`);
            return;
        }

        setStatusText(`Item added: ${item.sourceName ?? "Unknown item"}.`);
    }, []);

    useEffect(() => {
        const nextStats = layoutSnapshot.items.reduce<TankStatistics>((acc, item) => {
            const kind = classifyItem({
                type: item.type,
                sourceType: item.sourceType,
                category: item.category,
                sourceName: item.name,
                isFish: item.isFish,
            });

            if (kind === "fish") acc.fish += 1;
            if (kind === "plants") acc.plants += 1;
            if (kind === "rocks") acc.rocks += 1;
            acc.totalItems += 1;
            return acc;
        }, {
            fish: 0,
            plants: 0,
            rocks: 0,
            feeds: stats.feeds,
            totalItems: 0,
        });

        setStats((prev) => ({
            ...nextStats,
            feeds: prev.feeds,
        }));
    }, [layoutSnapshot]);

    const handleFeedFish = useCallback((): boolean => {
        if (stats.fish === 0) {
            setStatusText(t("AQUARIUM3D.NEED_FISH_BEFORE_FEED"));
            return false;
        }

        setStats((prev) => ({
            ...prev,
            feeds: prev.feeds + 1,
        }));
        setStatusText("Fish have been fed.");
        return true;
    }, [stats.fish, t]);

    const advicePayload = useMemo(() => {
        const { size, volumeLiters, glassThicknessMm } = layoutSnapshot.tank;
        const snapshot = {
            tank: {
                size: {
                    x: size.width,
                    y: size.height,
                    z: size.depth,
                },
                volumeLiters,
                glassThicknessMm,
            },
            items: layoutSnapshot.items,
        };

        return {
            userPrompt: "Hồ của tôi trông có vẻ hơi đơn điệu, tôi có thể thêm những loại cá nào để hợp với bầy neon xanh hiện tại?",
            fish: stats.fish,
            plants: stats.plants,
            rocks: stats.rocks,
            feeds: stats.feeds,
            totalItems: stats.totalItems,
            itemNames: layoutSnapshot.items.map(
                (item) => item.name || item.category || item.sourceType || item.type
            ),
            tank: layoutSnapshot.tank,
            items: layoutSnapshot.items,
            snapshot,
        };
    }, [layoutSnapshot, stats.feeds, stats.fish, stats.plants, stats.rocks, stats.totalItems]);

    const adviceRequestKey = useMemo(() => {
        const names = Array.from(
            new Set(advicePayload.itemNames.map((name) => name.trim()).filter(Boolean))
        ).sort();

        return JSON.stringify({
            tank: advicePayload.tank,
            fish: advicePayload.fish,
            plants: advicePayload.plants,
            rocks: advicePayload.rocks,
            feeds: advicePayload.feeds,
            totalItems: advicePayload.totalItems,
            names,
            items: advicePayload.items.map((item) => ({
                catalogItemId: item.catalogItemId,
                name: item.name,
                type: item.type,
                isFish: item.isFish,
                category: item.category,
                sourceType: item.sourceType,
                position: item.position,
                size: item.size,
                zone: item.zone,
            })),
        });
    }, [advicePayload]);

    useEffect(() => {
        if (stats.totalItems === 0) {
            setSuggestion("Add items to the tank, then AI will analyze compatibility.");
            setReminder("No reminder yet.");
            lastRequestedKeyRef.current = "";
            return;
        }

        if (!isGeminiConfigured()) {
            setSuggestion("Gemini API key is missing.");
            setReminder("Set VITE_GEMINI_API_KEY to enable AI reminder.");
            return;
        }

        if (adviceRequestKey === lastRequestedKeyRef.current) {
            return;
        }

        const timer = setTimeout(async () => {
            if (inFlightRef.current) return;
            if (adviceRequestKey === lastRequestedKeyRef.current) return;

            inFlightRef.current = true;
            try {
                const advice = await getAquariumAdviceFromAI(advicePayload);

                setSuggestion(advice.suggestion || "AI did not return a suggestion.");
                setReminder(advice.reminder || "AI did not return a reminder.");
                lastRequestedKeyRef.current = adviceRequestKey;
            } catch (error) {
                if (isAquariumAdviceRateLimitError(error)) {
                    setSuggestion("Gemini dang qua tai do goi qua nhanh.");
                    setReminder(`Vui long thu lai sau ${error.retryAfterSeconds}s.`);
                    return;
                }

                console.error("Failed to fetch AI aquarium advice:", error);
                setSuggestion("Unable to get suggestion from AI.");
                setReminder("Unable to get reminder from AI.");
            } finally {
                inFlightRef.current = false;
            }
        }, 1200);

        return () => clearTimeout(timer);
    }, [advicePayload, adviceRequestKey, stats.totalItems]);

    return {
        stats,
        suggestion,
        reminder,
        statusText,
        setStatusText,
        resetForTank,
        onTankItemAdded,
        handleFeedFish,
    };
};

export const useTankStatistics = useGameMechanics;
