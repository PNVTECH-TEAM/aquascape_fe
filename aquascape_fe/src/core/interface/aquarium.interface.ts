import type { Plant } from "@app/pages/Aquarium3D/FishAquarium3D/PlantSelector";

import * as THREE from 'three';

export interface TankSize {
  width: number;
  height: number;
  depth: number;
}

export interface TankInfo {
  volume: number;
  thickness: number;
  glassWeight: string;
}

export interface TankBounds {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
    minZ: number;
    maxZ: number;
    center: THREE.Vector3;
    innerWidth: number;
    innerHeight: number;
    innerDepth: number;
}

export interface TankPreset {
    id: string;
    name: string;
    size: TankSize;
}

export interface AquariumConfig {
    id: string;
    name: string;
    size: TankSize;
    tankInfo: TankInfo;
    createdAt: string;
    updatedAt: string;
}

export interface SizePresets {
  [key: string]: TankSize;
}

export interface CategoryTabsProps {
  selectedCategory: "plants" | "fish" | "rocks";
  onCategoryChange: (category: "plants" | "fish" | "rocks") => void;
}

export interface Props {
  plant: Plant;
}
export type Category = "plants" | "fish" | "rocks";

export interface TankItem {
  id: string;
  name: string;
  image: string;
  category: Category;
}