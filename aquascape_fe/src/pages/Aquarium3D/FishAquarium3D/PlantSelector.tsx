import { useEffect, useState } from "react";
import CategoryTabs from "./CategoryTabs";
import * as aquariumImages from "@app/assets/images";
import PlantCard from "./ItemCard";
import type { AquariumCatalogItem, Category, Plant } from "@app/core/interface";
import { getAquariumCatalog } from "@app/core/services/aquariumAPI";
import { CloudUploadOutlined } from "@ant-design/icons";
import UploadGlbModal from "../components/UploadGlbModal/UploadGlbModal";
import { getUserAssets, deleteUserAsset } from "@app/core/services/uploadAPI";

const getImageFromKey = (imageKey?: string): string | undefined => {
  if (!imageKey) return undefined;
  if (/^https?:\/\//i.test(imageKey) || imageKey.startsWith("/")) return imageKey;
  return (aquariumImages as Record<string, string>)[imageKey];
};

const normalizeCategory = (value?: string): string => {
  const key = String(value ?? "").trim().toLowerCase();
  if (key.includes("fish")) return "Fish";
  if (key.includes("plant")) return "Plants";
  if (key.includes("rock")) return "Rocks";
  if (key.includes("hardscape")) return "Hardscape";
  if (!key) return "Other";
  return key.charAt(0).toUpperCase() + key.slice(1);
};

const mapCatalogItemToPlant = (item: AquariumCatalogItem): Plant => {
  return {
    id: item.id,
    name: item.name,
    image: getImageFromKey(item.imageKey),
    url: item.url,
    category: normalizeCategory(item.category),
    type: item.type,
  };
};

const mapUserAssetToPlant = (asset: any): Plant => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL || "";
  const getFullUrl = (path?: string) => {
    if (!path) return undefined;
    if (/^https?:\/\//i.test(path)) return path;
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    return `${backendUrl}${normalizedPath}`;
  };

  return {
    id: String(asset.id),
    name: asset.name,
    image: getFullUrl(asset.previewImageUrl),
    url: getFullUrl(asset.glbUrl),
    category: "My Assets",
    type: asset.type || "decoration",
  };
};

export default function PlantSelector() {
  const [selectedCategory, setSelectedCategory] = useState<Category>("");
  const [items, setItems] = useState<Plant[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const fetchCatalog = async () => {
    try {
      setLoading(true);
      const [catalogData, userData] = await Promise.all([
        getAquariumCatalog(),
        getUserAssets().catch(() => [])
      ]);

      const mappedCatalog = catalogData.map(mapCatalogItemToPlant);
      const mappedUserAssets = userData.map(mapUserAssetToPlant);
      const combinedItems = [...mappedCatalog, ...mappedUserAssets];

      const catalogCategories = Array.from(new Set(mappedCatalog.map((item) => item.category)));
      const nextCategories = ["My Assets", ...catalogCategories];

      setItems(combinedItems);
      setCategories(nextCategories);
      
      setSelectedCategory((prev) => {
        if (prev && nextCategories.includes(prev)) return prev;
        return nextCategories[0] ?? "";
      });
    } catch (error) {
      console.error("Error fetching items:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAsset = async (id: string) => {
    await deleteUserAsset(id);
    fetchCatalog();
  };

  useEffect(() => {
    fetchCatalog();
  }, []);

  const filtered = selectedCategory
    ? items.filter((item) => item.category === selectedCategory)
    : items;

  return (
    <div className="explorer-selector mt-5 p-4">
      <div className="explorer-top">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div style={{ fontSize: '13px', fontWeight: '700', color: '#b8deff', letterSpacing: '0.05em' }}>
            CATEGORIES
          </div>
          <button 
            className="explorer-upload-btn"
            onClick={() => setIsUploadModalOpen(true)}
            title="Upload your own 3D model"
          >
            <CloudUploadOutlined /> Upload
          </button>
        </div>
        <CategoryTabs
          categories={categories}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />
      </div>

      <div className="explorer-grid">
        {loading ? (
          <div className="explorer-state">Loading catalog...</div>
        ) : filtered.length === 0 ? (
          <div className="explorer-state">No items in this category.</div>
        ) : (
          filtered.map((plant) => (
            <PlantCard 
              key={plant.id} 
              plant={plant} 
              onDelete={handleDeleteAsset}
            />
          ))
        )}
      </div>

      <UploadGlbModal 
        isOpen={isUploadModalOpen} 
        onClose={() => setIsUploadModalOpen(false)}
        onSuccess={fetchCatalog}
      />
    </div>
  );
}
