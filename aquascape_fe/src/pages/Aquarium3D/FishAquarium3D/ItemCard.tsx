import { Image, Popconfirm, message } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import type { Plant } from "@app/core/interface";

interface ItemCardProps {
  plant: Plant;
  onDelete?: (id: string) => Promise<void>;
}

export default function ItemCard({ plant, onDelete }: ItemCardProps) {
  const is3DModel = Boolean(plant.url && /\.(glb|gltf)$/i.test(plant.url));
  const isUserAsset = plant.category === "My Assets";

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData(
      "item",
      JSON.stringify(plant),
    );
  };

  const handleDelete = async () => {
    if (onDelete) {
      try {
        await onDelete(plant.id);
        message.success("Deleted successfully");
      } catch (error) {
        message.error("Failed to delete asset");
      }
    }
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className="explorer-item-card group relative" // Đã chuyển sang dùng class trong SCSS để đồng bộ
    >
      {/* Delete Button for User Assets */}
      {isUserAsset && (
        <div className="absolute top-1 right-1 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
          <Popconfirm
            title="Delete Asset"
            description="Are you sure to delete this asset?"
            onConfirm={handleDelete}
            okText="Yes"
            cancelText="No"
            placement="topRight"
          >
            <button 
              className="w-6 h-6 flex items-center justify-center bg-red-500/80 hover:bg-red-600 text-white rounded-md transition-colors"
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <DeleteOutlined style={{ fontSize: '12px' }} />
            </button>
          </Popconfirm>
        </div>
      )}

      <div className="explorer-item-thumb">
        {is3DModel && (
          <span className="explorer-item-badge">
            3D
          </span>
        )}
        {plant.image ? (
          <Image src={plant.image} preview={false} className="explorer-item-image" />
        ) : (
          <div className="explorer-item-fallback">{plant.name.charAt(0)}</div>
        )}
      </div>

      <span className="explorer-item-name">
        {plant.name}
      </span>
    </div>
  );
}
