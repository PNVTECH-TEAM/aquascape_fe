import AquaForestSplash from "@app/pages/AquaForestSplash/AquaForestSplash";
import Aquarium3D from "@app/pages/Aquarium3D/Aquarium3D";
import Register from "@app/pages/Register";

export const publicRoutes = [
  {
    path: "",
    element: <AquaForestSplash />,
  },
  {
    path: "register",
    element: <Register />,
  },
  {
    path: "Aquarium3D",
    element: <Aquarium3D />,
  }
];
