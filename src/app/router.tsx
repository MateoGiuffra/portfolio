import type { ComponentType } from 'react'
import { Navigate, createBrowserRouter, redirect } from 'react-router'
import type { RouteObject } from 'react-router'
import ErrorBoundary from '@/app/ErrorBoundary'
import RootLayout from '@/layouts/RootLayout'
import { BASE } from '@/lib/basePath'
import { DEFAULT_ADMIN_PAGE, adminPath } from '@/lib/adminPaths'

// Cada pantalla se carga con `lazy`: la web pública no descarga el admin (ni el CSS de Mantine).
const lazyDefault = (load: () => Promise<{ default: ComponentType }>) => async () => ({
  Component: (await load()).default,
})

const lazyHome = async () => {
  const { default: Home } = await import('@/pages/Home')
  return { Component: () => <ErrorBoundary><Home /></ErrorBoundary> }
}

const toDefaultPage = () => redirect(adminPath(DEFAULT_ADMIN_PAGE))

const routes: RouteObject[] = [
  {
    path: '/',
    Component: RootLayout,
    HydrateFallback: () => null,
    children: [
      { index: true, lazy: lazyHome },
      {
        path: 'bo',
        lazy: lazyDefault(() => import('@/app/AdminRoot')),
        children: [
          { index: true, loader: toDefaultPage },
          {
            lazy: lazyDefault(() => import('@/app/AdminAuthGate')),
            children: [
              { path: 'login', lazy: lazyDefault(() => import('@/pages/admin/LoginPage')) },
              {
                lazy: lazyDefault(() => import('@/layouts/AdminLayout')),
                children: [
                  { path: 'textos/:id?', lazy: lazyDefault(() => import('@/pages/admin/SectionsRoutePage')) },
                  { path: ':page/:id?', lazy: lazyDefault(() => import('@/pages/admin/ListRoutePage')) },
                  { path: '*', loader: toDefaultPage },
                ],
              },
            ],
          },
        ],
      },
      // Rutas viejas /backoffice/* -> /bo/*
      {
        path: 'backoffice/*',
        loader: ({ params, request }) => {
          const rest = (params['*'] ?? '').split('/').filter(Boolean)
          return redirect(adminPath(...rest) + new URL(request.url).search)
        },
      },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
]

export const createAppRouter = (): ReturnType<typeof createBrowserRouter> =>
  createBrowserRouter(routes, { basename: BASE || undefined })
