import { Image } from "antd";
import type { Props } from "@app/core/interface";

export default function ItemCard({ plant }: Props) {
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData(
      "item",
      JSON.stringify(plant),
    );
  };

  const is3D = plant.url && plant.url.endsWith('.glb');

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className="flex flex-col items-center cursor-grab group"
    >
      <div className="relative w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-sm">
        {is3D && (
          <span className="absolute top-0 right-0 bg-blue-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full z-10">
            3D
          </span>
        )}
        {plant.image && <Image src={plant.image} preview={false} width={40} />}
      </div>

      <span className="text-xs mt-1 text-center text-gray-300">
        {plant.name}
      </span>
    </div>
  );
}
