import { AquaForestSplash, AquaIntro, TripoGeneratorPage, LoginForm, RegisterForm } from "@app/pages";
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
    path: "generator-glb",
    element: <TripoGeneratorPage />,
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

