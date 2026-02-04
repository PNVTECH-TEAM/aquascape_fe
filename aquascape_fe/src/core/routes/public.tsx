import AquaForestSplash from "@app/pages/AquaForestSplash/AquaForestSplash";
import Register from "@app/pages/Register";
import LoginForm from '@app/pages/Login';
import OTPVerification from "@app/pages/UserVerify";

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
    element: <LoginForm />,
    path: 'login',
  },
  {
    path: "userVerify",
    element: <OTPVerification />,
  }
];

