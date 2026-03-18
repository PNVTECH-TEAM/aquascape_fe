import { createBrowserRouter } from "react-router-dom";
import { lazy, Suspense } from "react";
import { privateRoutes, publicRoutes } from "./core/routes";
import MainLayout from "./layouts/MainLayout";
import FishDoctorDiagnosis from "./pages/FishDoctorDiagnosis/FishDoctorDiagnosis";

const Aquarium3D = lazy(() => import("@app/pages/Aquarium3D/Aquarium3D"));

const router = createBrowserRouter([
  ...publicRoutes,

  {
    path: "/",
    element: <MainLayout />,
    children: privateRoutes,
  },
  {
    path: "/aquarium3d",
    element: (
      <Suspense
        fallback={(
          <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
            Loading 3D scene...
          </div>
        )}
      >
        <Aquarium3D />
      </Suspense>
    ),
  },
  {
    path: "fish-doctor/diagnosis",
    element: <FishDoctorDiagnosis />,
  },
]);

export default router;
