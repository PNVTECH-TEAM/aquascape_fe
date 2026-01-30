import AquaForestSplash from "@app/pages/AquaForestSplash/AquaForestSplash";
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
];
