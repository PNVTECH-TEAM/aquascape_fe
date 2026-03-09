import type { CategoryTabsProps } from "@app/core/interface";

const formatCategoryLabel = (category: string): string =>
  category.charAt(0).toUpperCase() + category.slice(1);

export default function CategoryTabs({
  categories,
  selectedCategory,
  onCategoryChange,
}: CategoryTabsProps) {
  return (
    <div className="explorer-tabs">
      {categories.map((category) => {
        const isActive = selectedCategory === category;

        return (
          <button
            key={category}
            onClick={() => onCategoryChange(category)}
            className={`explorer-tab ${isActive ? "active" : ""}`}
          >
            {formatCategoryLabel(category)}
          </button>
        );
      })}
    </div>
  );
}

