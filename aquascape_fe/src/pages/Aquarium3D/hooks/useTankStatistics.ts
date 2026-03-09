import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import type { AddedItemEvent } from "../types";
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

export const useGameMechanics = () => {
    const { t } = useTranslation();

    const [stats, setStats] = useState<TankStatistics>({
        fish: 0,
        plants: 0,
        rocks: 0,
        feeds: 0,
        totalItems: 0,
    });

    const [addedItems, setAddedItems] = useState<AddedItemEvent[]>([]);
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
        setAddedItems([]);
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
        setAddedItems((prev) => [...prev, item]);

        setStats((prev) => {
            const next = { ...prev };

            if (kind === "fish") {
                next.fish += 1;
            } else if (kind === "plants") {
                next.plants += 1;
            } else if (kind === "rocks") {
                next.rocks += 1;
            }

            next.totalItems += 1;
            return next;
        });

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
        return {
            fish: stats.fish,
            plants: stats.plants,
            rocks: stats.rocks,
            feeds: stats.feeds,
            totalItems: stats.totalItems,
            itemNames: addedItems.map(
                (item) => item.sourceName || item.category || item.sourceType || item.type
            ),
        };
    }, [addedItems, stats.feeds, stats.fish, stats.plants, stats.rocks, stats.totalItems]);

    const adviceRequestKey = useMemo(() => {
        const names = Array.from(
            new Set(advicePayload.itemNames.map((name) => name.trim()).filter(Boolean))
        ).sort();

        return JSON.stringify({
            fish: advicePayload.fish,
            plants: advicePayload.plants,
            rocks: advicePayload.rocks,
            feeds: advicePayload.feeds,
            totalItems: advicePayload.totalItems,
            names,
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
