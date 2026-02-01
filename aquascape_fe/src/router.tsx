import { createBrowserRouter } from 'react-router-dom';
import { NotFound } from './pages';
import { privateRoutes, publicRoutes } from './core/routes';

const router = createBrowserRouter([
  ...publicRoutes,
  ...privateRoutes,
  {
    path: '*',
    element: <NotFound />,
  },
]);

export default router;