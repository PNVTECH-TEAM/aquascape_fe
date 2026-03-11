import { AquaForestSplash, AquaIntro, LoginForm, RegisterForm } from "@app/pages";
import Aquarium3D from "@app/pages/Aquarium3D/Aquarium3D";
import FishDoctorHome from "@app/pages/FishDoctorDiagnosis/FishDoctorHome";
import FishDoctorDiagnosis from "@app/pages/FishDoctorDiagnosis/FishDoctorDiagnosis";

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
    path: "aquarium3d",
    element: <Aquarium3D />,
  },
  {
    path: "fish-doctor",
    element: <FishDoctorHome />,
  },
  {
    path: "fish-doctor/diagnosis",
    element: <FishDoctorDiagnosis />,
  },
  {
    path: "login",
    element: <LoginForm />,
  },
];

