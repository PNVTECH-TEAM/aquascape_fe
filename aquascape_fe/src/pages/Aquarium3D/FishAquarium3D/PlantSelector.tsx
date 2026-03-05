import { useEffect, useState } from "react";
import CategoryTabs from "./CategoryTabs";
import * as aquariumImages from "@app/assets/images";
import PlantCard from "./ItemCard";
import type { AquariumCatalogItem, Category, Plant } from "@app/core/interface";
import { getAquariumCatalog } from "@app/core/services/aquariumAPI";

const getImageFromKey = (imageKey?: string): string | undefined => {
  if (!imageKey) return undefined;
  return (aquariumImages as Record<string, string>)[imageKey];
};

const mapCatalogItemToPlant = (item: AquariumCatalogItem): Plant => {
  return {
    id: item.id,
    name: item.name,
    image: getImageFromKey(item.imageKey),
    url: item.url,
    category: item.category,
    type: item.type,
  };
};

export default function PlantSelector() {
  const [selectedCategory, setSelectedCategory] = useState<Category>("");
  const [items, setItems] = useState<Plant[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        const data = await getAquariumCatalog();
        const mappedItems = data.map(mapCatalogItemToPlant);
        const nextCategories = Array.from(new Set(mappedItems.map((item) => item.category)));

        setItems(mappedItems);
        setCategories(nextCategories);
        setSelectedCategory((prev) => {
          if (prev && nextCategories.includes(prev)) return prev;
          return nextCategories[0] ?? "";
        });
      } catch (error) {
        console.error("Error fetching aquarium catalog:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCatalog();
  }, []);

  const filtered = selectedCategory
    ? items.filter((item) => item.category === selectedCategory)
    : items;

  return (
    <div className="explorer-selector">
      <div className="explorer-top">
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
          filtered.map((plant) => <PlantCard key={plant.id} plant={plant} />)
        )}
      </div>
    </div>
  );
}
