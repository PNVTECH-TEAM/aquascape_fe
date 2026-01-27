import { createBrowserRouter } from 'react-router-dom';
import {
  AdminLayout,
  AuthLayout,
  ProfileLayout
} from './core/components/templates';
import { privateRoutes, publicRoutes } from './core/routes';
import NotFound from './pages/NotFound';
import { ProtectedRoute } from './core/components/templates/ProtectedRoute/ProtectedRoute';
import AquaIntro from './pages/Onboarding/AquaIntro';

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: privateRoutes,
  },
  {
    path: '/profile',
    element: (
      <ProtectedRoute>
        <ProfileLayout />
      </ProtectedRoute>
    ),
  },
  {
    path: '/aquaIntro',
    element: (
      <ProtectedRoute>
        <AquaIntro />
      </ProtectedRoute>
    ),
  },
  {
    path: '/',
    element: <AuthLayout />,
    children: publicRoutes,
  },
  {
    path: '*',
    element: <NotFound />,
  },
]);

export default router;