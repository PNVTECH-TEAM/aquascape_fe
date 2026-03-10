import { HomePage } from "@app/pages";
import FishAquarium3D from "@app/pages/Aquarium3D/FishAquarium3D/FishAquarium3D";

export const privateRoutes = [
  {
    path: "homePage",
    element: <HomePage />,
  },
   {
    path: 'fishAquarium',   
    element: <FishAquarium3D />,
  },
];
