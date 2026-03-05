import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import type { AddedItemEvent } from "../types";

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

    if (category === "plants" || sourceType === "plant") return "plants";
    if (category === "rocks" || sourceType === "rock") return "rocks";
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

    const [statusText, setStatusText] = useState<string>(
        t("AQUARIUM3D.GAME_START_HINT")
    );

    const onTankItemAdded = useCallback((item: AddedItemEvent) => {
        const kind = classifyItem(item);

        setStats((prev) => {
            const next = { ...prev };

            if (kind === "fish") {
                next.fish += 1;
            }
            else if (kind === "plants") {
                next.plants += 1;
            }
            else if (kind === "rocks") {
                next.rocks += 1;
            }

            next.totalItems += 1;
            return next;
        });

        if (kind === "fish") {
            setStatusText("Fish added to tank.");
            return;
        }

        if (kind === "plants") {
            setStatusText("Plant added to tank.");
            return;
        }

        if (kind === "rocks") {
            setStatusText("Rock added to tank.");
            return;
        }

        setStatusText("Item added.");
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

    const suggestion = useMemo(() => {
        if (stats.fish === 0) {
            return "You should add fish to bring life to the tank.";
        }

        if (stats.plants < stats.fish) {
            return "Consider adding more plants for a natural ecosystem.";
        }

        if (stats.rocks < Math.ceil(stats.plants / 2)) {
            return "Adding rocks can improve the layout depth.";
        }

        return "Your aquarium is well balanced.";
    }, [stats.fish, stats.plants, stats.rocks]);

    const reminder = useMemo(() => {
        if (stats.fish > 0 && stats.feeds === 0) {
            return "Reminder: Feed your fish.";
        }

        if (stats.totalItems >= 8 && stats.plants === 0) {
            return "Reminder: Add some plants for better balance.";
        }

        if (stats.totalItems >= 12 && stats.rocks === 0) {
            return "Reminder: Add rocks to create hiding spots.";
        }

        return "No urgent reminder.";
    }, [stats.feeds, stats.fish, stats.plants, stats.rocks, stats.totalItems]);

    return {
        stats,
        suggestion,
        reminder,
        statusText,
        setStatusText,
        onTankItemAdded,
        handleFeedFish,
    };
};

export const useTankStatistics = useGameMechanics;
