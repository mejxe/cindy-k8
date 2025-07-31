import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import GMPanel from './components/admin/GMPanel.tsx'
const router = createBrowserRouter(
  [
    { path: "/", element: <App /> },
    { path: "/gm", element: <GMPanel /> }
  ]
)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
