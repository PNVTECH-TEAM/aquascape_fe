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

export interface Vector3Data {
  x: number;
  y: number;
  z: number;
}

export interface TankItemTransform {
  position: Vector3Data;
  rotation: Vector3Data;
  scale: Vector3Data;
}

export interface TankLayoutItem {
  instanceId: string;
  catalogItemId?: string;
  userAssetId?: number;
  transform: TankItemTransform;
}

export interface AquariumTank {
  id: string;
  name: string;
  size: TankSize;
  latestLayoutVersion: number;
  preset?: TankPreset;
  createdAt: string;
  updatedAt: string;
}

export interface TankLayout {
  id: string;
  tankId: string;
  version: number;
  size: TankSize;
  items: TankLayoutItem[];
  savedAt: string;
  updatedAt: string;
}

export interface CreateTankPayload {
  name: string;
  size: TankSize;
  previewImageUrl?: string;
  presetId?: string;
}

export interface UpdateTankPayload {
  name?: string;
  size?: TankSize;
  previewImageUrl?: string;
}

export interface UpsertTankLayoutPayload {
  size: TankSize;
  items: TankLayoutItem[];
  name?: string;
  previewImageUrl?: string;
  presetId?: string;
}

export interface SizePresets {
  [key: string]: TankSize;
}

export interface CategoryTabsProps {
  categories: string[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

export type Category = string;

export type TankAssetType = "rock" | "fish" | "plant" | "decoration";

export interface AquariumCatalogItem {
  id: string;
  name: string;
  imageKey?: string;
  url?: string;
  category: Category;
  type: TankAssetType;
}

export interface Plant {
  id: string;
  name: string;
  image?: string;
  url?: string;
  category: Category;
  type: TankAssetType;
}

export interface Props {
  plant: Plant;
}

export interface TankItem {
  id: string;
  name: string;
  image: string;
  category: Category;
}

export interface TankMetadata {
  layoutId: string;       // ID dùng cho API tiếp theo
  tankId: string;         // ID của dự án gốc
  tankName: string;       // Tên dự án (VD: "Bể Iwagumi 01")
  version: number;        // Số thứ tự phiên bản (VD: 1, 2, 5...)
  previewImageUrl: string; // URL ảnh snapshot của bể
  savedAt: string;        // Thời gian lưu (ISO format)
}

export interface TankLayoutDetail {
  id: string;
  version: number;
  previewImageUrl: string;
  tankLayoutItems: {
    id: string;
    instanceId: string;      // ID duy nhất của object trong scene
    catalogItemId: string;   // ID để map với file .glb trong Catalog
    userAssetId: number | null; // ID nếu là asset do user tự upload
    transform: {
      position: { x: number, y: number, z: number },
      rotation: { x: number, y: number, z: number },
      scale: { x: number, y: number, z: number }
    }
  }[];
}
