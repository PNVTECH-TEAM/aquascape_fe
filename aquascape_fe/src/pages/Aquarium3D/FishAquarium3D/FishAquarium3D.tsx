import PlantSelector from "./PlantSelector";

interface Props {
  onUploadModalOpen?: () => void;
}

export default function FishAquarium3D({ onUploadModalOpen }: Props) {
  return (
        <PlantSelector onUploadModalOpen={onUploadModalOpen} />
  );
}
