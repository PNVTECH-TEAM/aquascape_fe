import { AuthLayout } from '@app/core/components/templates';
import AquaForestSplash from '@app/pages/AquaForestSplash/AquaForestSplash';
import LoginForm from '@app/pages/Login';

export const publicRoutes = [
  {
    element: <AuthLayout />,
    children: [{ index: true, element: <AquaForestSplash /> }],
  },
  {
    element: <LoginForm />,
    path: 'login',
  }
];

