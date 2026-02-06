interface CategoryTabsProps {
  selectedCategory: 'plants' | 'fish' | 'rocks'
  onCategoryChange: (category: 'plants' | 'fish' | 'rocks') => void
}

const categories = [
  { id: 'plants', label: 'Plants' },
  { id: 'fish', label: 'Fish' },
  { id: 'rocks', label: 'Rocks' },
] as const

export default function CategoryTabs({ selectedCategory, onCategoryChange }: CategoryTabsProps) {
  return (
    <div className="flex gap-3 flex-wrap">
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => onCategoryChange(category.id as 'plants' | 'fish' | 'rocks')}
          className={`px-6 py-2 rounded-full font-medium transition-all duration-300 text-sm md:text-base ${
            selectedCategory === category.id
              ? 'bg-primary text-primary-foreground shadow-md hover:shadow-lg'
              : 'bg-secondary text-secondary-foreground hover:bg-muted shadow-sm hover:shadow-md'
          }`}
        >
          {category.label}
        </button>
      ))}
    </div>
  )
}
