import { createBrowserRouter } from "react-router-dom";
import { privateRoutes, publicRoutes } from "./core/routes";
import MainLayout from "./layouts/MainLayout";
import Aquarium3D from "@app/pages/Aquarium3D/Aquarium3D";
import FishDoctorDiagnosis from "./pages/FishDoctorDiagnosis/FishDoctorDiagnosis";

const router = createBrowserRouter([
  ...publicRoutes,

  {
    path: "/",
    element: <MainLayout />,
    children: privateRoutes,
  },
  {
    path: "/aquarium3d",
    element: <Aquarium3D />,
  },
  {
    path: "fish-doctor/diagnosis",
    element: <FishDoctorDiagnosis />,
  },
]);

export default router;
