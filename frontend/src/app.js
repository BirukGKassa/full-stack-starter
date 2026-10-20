import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import RootLayout from './app/layout.js';
import HomePage from './app/page.js';
import GoPage from './app/go/page.js';
import DashboardPage from './app/dashboard/page.js';

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'go', element: <GoPage /> },
      { path: 'dashboard', element: <DashboardPage /> },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
