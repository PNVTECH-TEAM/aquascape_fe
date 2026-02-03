import AquaForestSplash from "@app/pages/AquaForestSplash/AquaForestSplash";
import Register from "@app/pages/Register";
import OTPVerification from "@app/pages/UserVerify";

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
    path: "userVerify",
    element: <OTPVerification />,
  }
];
