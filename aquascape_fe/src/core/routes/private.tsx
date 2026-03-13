import { HomePage } from "@app/pages";
import FishAquarium3D from "@app/pages/Aquarium3D/FishAquarium3D/FishAquarium3D";
import Profile from "@app/pages/Profile/Profile";

export const privateRoutes = [
  {
    path: "homePage",
    element: <HomePage />,
  },
  {
    path: "profile",
    element: <Profile />,
  },
  {
    path: "fishAquarium",
    element: <FishAquarium3D />,
  },
];