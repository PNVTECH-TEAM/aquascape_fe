import { createBrowserRouter } from "react-router-dom";
import { lazy, Suspense } from "react";
import { privateRoutes, publicRoutes } from "./core/routes";
import MainLayout from "./layouts/MainLayout";
import FishDoctorDiagnosis from "./pages/FishDoctorDiagnosis/FishDoctorDiagnosis";
import ProtectedRoute from "./core/components/ProtectedRoute";

const Aquarium3D = lazy(() => import("@app/pages/Aquarium3D/Aquarium3D"));

const router = createBrowserRouter([
  ...publicRoutes,

  {
    path: "/",
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: privateRoutes,
  },
  {
    path: "/aquarium3d",
    element: (
      <ProtectedRoute>
        <Suspense
          fallback={(
            <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
              Loading 3D scene...
            </div>
          )}
        >
          <Aquarium3D />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: "fish-doctor/diagnosis",
    element: (
      <ProtectedRoute>
        <FishDoctorDiagnosis />
      </ProtectedRoute>
    ),
  },
]);

export default router;
