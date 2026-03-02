import { Image } from "antd";
import type { Props } from "@app/core/interface";

export default function ItemCard({ plant }: Props) {
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData(
      "item",
      JSON.stringify(plant),
    );
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className="flex flex-col items-center cursor-grab group"
    >
      <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-sm">
        <Image src={plant.image} preview={false} width={40} />
      </div>

      <span className="text-xs mt-1 text-center text-gray-300">
        {plant.name}
      </span>
    </div>
  );
}
