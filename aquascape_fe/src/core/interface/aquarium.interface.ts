import type { Plant } from "@app/pages/Aquarium3D/FishAquarium3D/PlantSelector";

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