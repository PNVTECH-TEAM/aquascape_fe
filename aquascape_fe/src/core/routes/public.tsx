import AquaForestSplash from "@app/pages/AquaForestSplash/AquaForestSplash";
import Aquarium3D from "@app/pages/Aquarium3D/Aquarium3D";
import Register from "@app/pages/Register";
import LoginForm from '@app/pages/Login';

export const publicRoutes = [
  {
    path: "",
    element: <AquaForestSplash />,
    children: [{ index: true, element: <AquaForestSplash /> }],
  },
  {
    path: "register",
    element: <Register />,
  },
  {
    path: "Aquarium3D",
    element: <Aquarium3D />,
  },
  {
    path: 'login',
    element: <LoginForm />,
  }
];

