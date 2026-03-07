import axios from "axios";
import type { AquariumCatalogItem, TankPreset } from "@app/core/interface/aquarium.interface";
import { AQUARIUM_API_BASE } from "./config";
import { normalizeCatalogResponse } from "./mappers";
import type { CatalogGroupDto, CatalogItemDto, ListEnvelope } from "./types";
import { clone, unwrapList } from "./utils";

export const getTankPresets = async (): Promise<TankPreset[]> => {
    const response = await axios.get<ListEnvelope<TankPreset>>(`${AQUARIUM_API_BASE}/presets`);
    return clone(unwrapList(response.data));
};

export const getAquariumCatalog = async (): Promise<AquariumCatalogItem[]> => {
    const response = await axios.get<ListEnvelope<CatalogItemDto | CatalogGroupDto>>(
        `${AQUARIUM_API_BASE}/catalogs`
    );
    return clone(normalizeCatalogResponse(response.data));
};
