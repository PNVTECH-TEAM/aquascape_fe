import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import type { TankLayoutItem, TankSize } from "@app/core/interface";
import { createTank, getTanks, saveTankLayout } from "@app/core/services/aquariumAPI";

interface UseLayoutSaveParams {
    size: TankSize;
    getLayoutSnapshot: () => TankLayoutItem[];
    onStatusChange: (message: string) => void;
}

export const useLayoutSave = ({
    size,
    getLayoutSnapshot,
    onStatusChange,
}: UseLayoutSaveParams) => {
    const { t } = useTranslation();
    const [savingLayout, setSavingLayout] = useState<boolean>(false);
    const [activeTankId, setActiveTankId] = useState<string>("");
    const sizeKey = `${size.width}x${size.height}x${size.depth}`;
    const tankNameKey = `My Tank ${sizeKey}`;
    const isSameSize = (a: TankSize, b: TankSize) =>
        a.width === b.width && a.height === b.height && a.depth === b.depth;

    const ensureActiveTankId = useCallback(async (): Promise<string> => {
        if (activeTankId) {
            const existingTanks = await getTanks();
            const currentTank = existingTanks.find((tank) => tank.id === activeTankId);
            if (currentTank && (currentTank.name === tankNameKey || isSameSize(currentTank.size, size))) {
                return activeTankId;
            }
        }

        const existingTanks = await getTanks();
        const matchedTankByName = existingTanks.find((tank) => tank.name === tankNameKey);
        if (matchedTankByName) {
            setActiveTankId(matchedTankByName.id);
            return matchedTankByName.id;
        }

        const matchedTank = existingTanks.find((tank) => isSameSize(tank.size, size));
        if (matchedTank) {
            setActiveTankId(matchedTank.id);
            return matchedTank.id;
        }

        const createdTank = await createTank({
            name: tankNameKey,
            size,
        });
        setActiveTankId(createdTank.id);
        return createdTank.id;
    }, [activeTankId, size, sizeKey, tankNameKey]);

    const handleSaveLayout = useCallback(async () => {
        if (savingLayout) return;

        try {
            setSavingLayout(true);
            onStatusChange(t("AQUARIUM3D.SAVING_LAYOUT"));

            const tankId = await ensureActiveTankId();
            const items = getLayoutSnapshot();

            await saveTankLayout(tankId, {
                size,
                items,
            });

            onStatusChange(t("AQUARIUM3D.SAVE_SUCCESS"));
        } catch (error) {
            console.error("Error saving layout:", error);
            onStatusChange(t("AQUARIUM3D.SAVE_ERROR"));
        } finally {
            setSavingLayout(false);
        }
    }, [ensureActiveTankId, getLayoutSnapshot, onStatusChange, savingLayout, size, t]);

    return {
        savingLayout,
        handleSaveLayout,
    };
};
