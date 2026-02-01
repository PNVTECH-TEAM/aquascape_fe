import { AdminLayout, ProfileLayout } from "@app/core/components/templates";
import { ProtectedRoute } from "@app/core/components/templates/ProtectedRoute/ProtectedRoute";
import AquaIntro from "@app/pages/Onboarding/AquaIntro";

export const privateRoutes = [
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: "/",
        element: <AdminLayout />,
        children: [
          {
            path: "aquaIntro",
            element: <AquaIntro />,
          },
        ],
      },
      {
        path: "profile",
        element: <ProfileLayout />,
      },
    ],
  },
];
