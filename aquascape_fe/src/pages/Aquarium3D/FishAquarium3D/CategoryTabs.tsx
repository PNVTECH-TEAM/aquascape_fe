import type { CategoryTabsProps } from "@app/core/interface";

const categories = [
  { id: "plants", label: "Plants" },
  { id: "fish", label: "Fish" },
  { id: "rocks", label: "Rocks" },
] as const;

export default function CategoryTabs({
  selectedCategory,
  onCategoryChange,
}: CategoryTabsProps) {
  return (
    <div className="flex gap-3 flex-nowrap">
      {categories.map((category) => {
        const isActive = selectedCategory === category.id;

        return (
          <button
            key={category.id}
            onClick={() =>
              onCategoryChange(category.id as "plants" | "fish" | "rocks")
            }
            className={`
              px-6 py-2
              rounded-full
              font-medium
              text-sm md:text-base
              transition-all duration-300
              border
              ${
                isActive
                  ? "text-white shadow-md hover:shadow-lg"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
              }
            `}
            style={
              isActive
                ? {
                    background:
                      "linear-gradient(90deg, #006AFF 0%, #2AA8FF 100%)",
                  }
                : {}
            }
          >
            {category.label}
          </button>
        );
      })}
    </div>
  );
}

