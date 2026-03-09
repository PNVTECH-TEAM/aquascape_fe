import { Image } from "antd";
import type { Props } from "@app/core/interface";

export default function ItemCard({ plant }: Props) {
  const is3DModel = Boolean(plant.url && /\.(glb|gltf)$/i.test(plant.url));

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
      <div className="relative w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-sm">
        {is3DModel && (
          <span className="absolute -top-1 -right-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-blue-600 text-white leading-none">
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
