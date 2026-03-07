import { createBrowserRouter } from "react-router-dom";
import { privateRoutes, publicRoutes } from "./core/routes";
import MainLayout from "./layouts/MainLayout";

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />, 
    children: privateRoutes,
  },
  ...publicRoutes,
]);

export default router;
