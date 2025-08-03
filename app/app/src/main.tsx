import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom'
import GMPanel from './components/admin/GMPanel.tsx'
const router = createBrowserRouter(
  [
    { path: "/", element: <App /> },
    { path: "/gm", element: <GMPanel /> },
    { path: "*", element: <Navigate to="/" /> },
  ]
)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
