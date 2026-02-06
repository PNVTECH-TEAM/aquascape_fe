import { useState } from 'react'
import { ChevronLeft, ChevronRight, Camera } from 'lucide-react'
import { Button } from 'antd'
import CategoryTabs from './CategoryTabs'
import PlantCard from './PlantCrad'


export interface Plant {
  id: string
  name: string
  image: string
  category: 'plants' | 'fish' | 'rocks'
}

const PLANTS: Plant[] = [
  {
    id: '1',
    name: 'Monte Carlo',
    image: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=300&h=300&fit=crop',
    category: 'plants',
  },
  {
    id: '2',
    name: 'Mayaca Fluviatilis',
    image: 'https://images.unsplash.com/photo-1599599810694-b5ac4dd57acf?w=300&h=300&fit=crop',
    category: 'plants',
  },
  {
    id: '3',
    name: 'Ludwigia Rotundifolia',
    image: 'https://images.unsplash.com/photo-1536882240095-0379873feb4e?w=300&h=300&fit=crop',
    category: 'plants',
  },
  {
    id: '4',
    name: 'Lobelia cardinalis',
    image: 'https://images.unsplash.com/photo-1469022563149-aa64dbd37dae?w=300&h=300&fit=crop',
    category: 'plants',
  },
  {
    id: '5',
    name: 'Java Moss Mat',
    image: 'https://images.unsplash.com/photo-1511707267537-b85faf00021e?w=300&h=300&fit=crop',
    category: 'plants',
  },
  {
    id: '6',
    name: 'Rotala Indica',
    image: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=300&h=300&fit=crop',
    category: 'plants',
  },
  {
    id: '7',
    name: 'Anubias Barteri',
    image: 'https://images.unsplash.com/photo-1520763185298-1b434c919eba?w=300&h=300&fit=crop',
    category: 'plants',
  },
  {
    id: '8',
    name: 'Pearl Grass',
    image: 'https://images.unsplash.com/photo-1487730116645-74489c95b41b?w=300&h=300&fit=crop',
    category: 'plants',
  },
  {
    id: '9',
    name: 'Goldfish',
    image: 'https://images.unsplash.com/photo-1534080564897-61779bdec79f?w=300&h=300&fit=crop',
    category: 'fish',
  },
  {
    id: '10',
    name: 'Neon Tetra',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop',
    category: 'fish',
  },
  {
    id: '11',
    name: 'River Rock',
    image: 'https://images.unsplash.com/photo-1471537521684-b4ad2b381f0c?w=300&h=300&fit=crop',
    category: 'rocks',
  },
  {
    id: '12',
    name: 'Slate Stone',
    image: 'https://images.unsplash.com/photo-1445805566441-c3202e8e2149?w=300&h=300&fit=crop',
    category: 'rocks',
  },
]

export default function PlantSelector() {
  const [selectedCategory, setSelectedCategory] = useState<'plants' | 'fish' | 'rocks'>('plants')
  const [scrollPosition, setScrollPosition] = useState(0)

  const filteredPlants = PLANTS.filter((plant) => plant.category === selectedCategory)

  const scroll = (direction: 'left' | 'right') => {
    const container = document.getElementById('plants-scroll-container')
    if (container) {
      const scrollAmount = 300
      if (direction === 'left') {
        container.scrollBy({ left: -scrollAmount, behavior: 'smooth' })
        setScrollPosition(Math.max(0, scrollPosition - scrollAmount))
      } else {
        container.scrollBy({ left: scrollAmount, behavior: 'smooth' })
        setScrollPosition(scrollPosition + scrollAmount)
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary p-6 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Aquatic Explorer</h1>
          <p className="text-muted-foreground">
            Discover and select plants, fish, and rocks for your aquarium
          </p>
        </div>

        {/* Category Tabs */}
        <div className="mb-8">
          <CategoryTabs selectedCategory={selectedCategory} onCategoryChange={setSelectedCategory} />
        </div>

        {/* Plants Grid with Navigation */}
        <div className="relative">
          {/* Left Navigation Button */}
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-6 z-10 hidden md:flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-colors"
            aria-label="Scroll left"
          >
            <ChevronLeft size={20} />
          </button>

          {/* Plants Container */}
          <div
            id="plants-scroll-container"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 overflow-hidden"
          >
            {filteredPlants.map((plant) => (
              <PlantCard key={plant.id} plant={plant} />
            ))}
          </div>

          {/* Right Navigation Button */}
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-6 z-10 hidden md:flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-colors"
            aria-label="Scroll right"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Camera Action Button */}
        <div className="flex justify-center mt-12">
          <Button
            size="lg"
            className="rounded-full w-16 h-16 flex items-center justify-center shadow-lg hover:shadow-xl transition-all"
          >
            <Camera size={24} />
          </Button>
        </div>
      </div>
    </div>
  )
}
