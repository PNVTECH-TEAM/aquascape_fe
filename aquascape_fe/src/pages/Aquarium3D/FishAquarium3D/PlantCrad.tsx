import { useState } from 'react'
import { Image } from 'antd'

export interface Plant {
  id: string
  name: string
  image: string
  category: 'plants' | 'fish' | 'rocks'
}

interface PlantCardProps {
  plant: Plant
}

export default function PlantCard({ plant }: PlantCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      className="flex flex-col items-center p-6 bg-card rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative w-32 h-32 mb-4">
        <div className="relative w-full h-full rounded-full overflow-hidden border-2 border-secondary bg-white shadow-sm">
          <Image
            src={plant.image}
            alt={plant.name}
            width={128}
            height={128}
            className="w-full h-full object-cover"
            preview={false}
          />
        </div>
      </div>

      <h3 className="text-sm font-semibold text-center">
        {plant.name}
      </h3>

      {isHovered && (
        <div className="mt-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs">
          Select
        </div>
      )}
    </div>
  )
}
