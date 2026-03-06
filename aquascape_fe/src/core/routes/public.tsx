import { 
  AquaIntro, 
  LoginForm, 
  RegisterForm, AquaForestSplash
} from "@app/pages";
export const publicRoutes = [
  {
    path: "",
    element: <AquaForestSplash />,
    children: [{ index: true, element: <AquaForestSplash /> }],
  },
  {
    path: 'aquaIntro',   
    element: <AquaIntro />,
  },
  {
    path: "register",
    element: <RegisterForm />,
  },
  {
    element: <LoginForm />,
    path: 'login',
  },
];

