import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import RootLayout from './app/layout.js';
import HomePage from './app/page.js';
import GoPage from './app/go/page.js';
import DashboardPage from './app/dashboard/page.js';
import SettingsPage from './app/dashboard/settings/page.js';
import SystemAdminPage from './app/dashboard/system/page.js';
import SecurityPage from './app/dashboard/security/page.js';
import ProductionPage from './app/production/page.js';
import { ThemeProvider } from './lib/theme.js';

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'go', element: <GoPage /> },
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'dashboard/settings', element: <SettingsPage /> },
      { path: 'dashboard/system', element: <SystemAdminPage /> },
      { path: 'dashboard/security', element: <SecurityPage /> },
      { path: 'production', element: <ProductionPage /> },
    ],
  },
]);

export default function App() {
  return <ThemeProvider><RouterProvider router={router} /></ThemeProvider>;
}
