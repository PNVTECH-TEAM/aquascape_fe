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

    const ensureActiveTankId = useCallback(async (): Promise<string> => {
        if (activeTankId) return activeTankId;

        const existingTanks = await getTanks();
        if (existingTanks.length > 0) {
            const latestTankId = existingTanks[0].id;
            setActiveTankId(latestTankId);
            return latestTankId;
        }

        const createdTank = await createTank({
            name: `My Tank ${new Date().toISOString().slice(0, 10)}`,
            size,
        });
        setActiveTankId(createdTank.id);
        return createdTank.id;
    }, [activeTankId, size]);

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
