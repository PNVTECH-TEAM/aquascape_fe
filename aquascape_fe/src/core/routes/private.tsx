import { HomePage } from "@app/pages";
import FishAquarium3D from "@app/pages/Aquarium3D/FishAquarium3D/FishAquarium3D";
import Aquarium3D from "@app/pages/Aquarium3D/Aquarium3D";

export const privateRoutes = [
  {
    path: "homePage",
    element: <HomePage />,
  },
  {
    path: "fishAquarium",
    element: <FishAquarium3D />,
  },
  {
    path: "aquarium3d",
    element: <Aquarium3D />,
  },
];
