import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import AdminPage from './pages/AdminPage';
import type { ReactNode } from 'react';

export interface RouteConfig {
  name: string;
  path: string;
  element: ReactNode;
  visible?: boolean;
  /** Accessible without login. Routes without this flag require authentication. Has no effect when RouteGuard is not in use. */
  public?: boolean;
}

export const routes: RouteConfig[] = [
  {
    name: 'หน้าหลัก',
    path: '/',
    element: <HomePage />,
    public: true,
  },
  {
    name: 'Login',
    path: '/login',
    element: <LoginPage />,
    public: true,
  },
  {
    name: 'Admin',
    path: '/admin',
    element: <AdminPage />,
    public: true,
  },
];
