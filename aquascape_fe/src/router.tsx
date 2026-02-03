import { createBrowserRouter, Outlet } from 'react-router-dom';
import { privateRoutes, publicRoutes } from './core/routes';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Outlet />,
    children: [...publicRoutes, ...privateRoutes],
  },
]);

export default router;
