import { createBrowserRouter } from "react-router-dom";
import { privateRoutes, publicRoutes } from "./core/routes";
import MainLayout from "./layouts/MainLayout";

const router = createBrowserRouter([
  ...publicRoutes,

  {
    path: "/",
    element: <MainLayout />,
    children: privateRoutes,
  },
]);

export default router;