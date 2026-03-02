import { useState } from "react";
import CategoryTabs from "./CategoryTabs";

import {
  rock1,
  rock2,
  rock3,
  bettaFishBlue,
  orangeCometGoldfish,
  pandaMoorGoldfish,
  redCapOrandaGoldfish,
  artificialParrotFeatherPlant,
  greenSeaweedPlant,
  purpleCoralAquariumPlant,
  romanRuinsDoubleFeature,
} from "@app/assets/images";
import PlantCard from "./ItemCard";
import type { Category } from "@app/core/interface";

export interface Plant {
  id: string;
  name: string;
  image: string;
  category: Category;
  type: "rock" | "fish" | "plant";
}

const ITEMS: Plant[] = [
  { id: "rock1", name: "Rock 1", image: rock1, category: "rocks", type: "rock" },
  { id: "rock2", name: "Rock 2", image: rock2, category: "rocks", type: "rock" },
  { id: "rock3", name: "Rock 3", image: rock3, category: "rocks", type: "rock" },

  { id: "fish1", name: "Betta Fish", image: bettaFishBlue, category: "fish", type: "fish" },
  { id: "fish2", name: "Comet", image: orangeCometGoldfish, category: "fish", type: "fish" },
  { id: "fish3", name: "Panda Moor", image: pandaMoorGoldfish, category: "fish", type: "fish" },
  { id: "fish4", name: "Red Cap", image: redCapOrandaGoldfish, category: "fish", type: "fish" },

  { id: "plant1", name: "Parrot Feather", image: artificialParrotFeatherPlant, category: "plants", type: "plant" },
  { id: "plant2", name: "Seaweed", image: greenSeaweedPlant, category: "plants", type: "plant" },
  { id: "plant3", name: "Purple Coral", image: purpleCoralAquariumPlant, category: "plants", type: "plant" },
  { id: "plant4", name: "Roman Ruins", image: romanRuinsDoubleFeature, category: "plants", type: "plant" },
];

export default function PlantSelector() {
  const [selectedCategory, setSelectedCategory] = useState<Category>("rocks");

  const filtered = ITEMS.filter((item) => item.category === selectedCategory);

  return (
    <div className="h-full flex flex-col">
      <div className="border-b">
        <div className="section-title">Aquatic Explorer</div>
      </div>

      <div className="mt-3">
        <CategoryTabs
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />
      </div>

      <div
        className="
  flex-1
  overflow-y-auto
  mt-3
  grid
  grid-cols-3
  gap-4
  justify-items-center
"
      >
        {filtered.map((plant) => (
          <PlantCard key={plant.id} plant={plant} />
        ))}
      </div>
    </div>
  );
}
