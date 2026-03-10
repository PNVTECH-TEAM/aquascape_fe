import { AquaForestSplash, AquaIntro, LoginForm, RegisterForm } from "@app/pages";

export const publicRoutes = [
  {
    path: "",
    element: <AquaForestSplash />,
    children: [{ index: true, element: <AquaForestSplash /> }],
  },
  {
    path: "aquaIntro",
    element: <AquaIntro />,
  },
  {
    path: "register",
    element: <RegisterForm />,
  },
  {
    path: "login",
    element: <LoginForm />,
  },
];

