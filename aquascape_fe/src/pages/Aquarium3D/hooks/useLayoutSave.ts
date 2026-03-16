import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import type { TankLayoutItem, TankSize } from "@app/core/interface";
import { createTank, getTanks, saveTankLayout } from "@app/core/services/aquariumAPI";

interface UseLayoutSaveParams {
    size: TankSize;
    getLayoutSnapshot: () => TankLayoutItem[];
    onStatusChange: (message: string) => void;
}

interface SaveTankMetadata {
    tankName: string;
    previewImageUrl?: string;
    presetId?: string;
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

    const ensureActiveTankId = useCallback(async (tankName: string, presetId?: string): Promise<string> => {
        if (activeTankId) {
            const existingTanks = await getTanks();
            const currentTank = existingTanks.find((tank) => tank.id === activeTankId);
            if (currentTank && (currentTank.name === tankName || isSameSize(currentTank.size, size))) {
                return activeTankId;
            }
        }

        const existingTanks = await getTanks();
        const matchedTankByName = existingTanks.find((tank) => tank.name === tankName);
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
            name: tankName,
            size,
            presetId,
        });
        setActiveTankId(createdTank.id);
        return createdTank.id;
    }, [activeTankId, size]);

    const handleSaveLayout = useCallback(async (metadata?: SaveTankMetadata): Promise<boolean> => {
        if (savingLayout) return false;

        try {
            setSavingLayout(true);
            onStatusChange(t("AQUARIUM3D.SAVING_LAYOUT"));

            const normalizedName = metadata?.tankName?.trim() || tankNameKey;
            const normalizedPreviewImage = metadata?.previewImageUrl?.trim() || undefined;
            const presetId = metadata?.presetId;
            const tankId = await ensureActiveTankId(normalizedName, presetId);

            const items = getLayoutSnapshot();

            await saveTankLayout(tankId, {
                size,
                items,
                name: normalizedName,
                previewImageUrl: normalizedPreviewImage,
                presetId,
            });

            onStatusChange(t("AQUARIUM3D.SAVE_SUCCESS"));
            return true;
        } catch (error) {
            console.error("Error saving layout:", error);
            onStatusChange(t("AQUARIUM3D.SAVE_ERROR"));
            return false;
        } finally {
            setSavingLayout(false);
        }
    }, [ensureActiveTankId, getLayoutSnapshot, onStatusChange, savingLayout, size, t, tankNameKey]);

    return {
        savingLayout,
        handleSaveLayout,
    };
};
