import { Navigate, useParams } from 'react-router'
import ListView from '@/admin/ListView'
import { DEFAULT_ADMIN_PAGE, adminPath } from '@/lib/adminPaths'
import { listNameForSlug } from '@/layouts/adminTabs'

// /bo/:page/:id? para las listas editables. Un slug desconocido vuelve a la página de inicio.
export default function ListRoutePage() {
  const { page, id } = useParams()
  const name = listNameForSlug(page)
  if (!name || !page) return <Navigate to={adminPath(DEFAULT_ADMIN_PAGE)} replace />
  return <ListView key={name} name={name} slug={page} itemId={id} />
}
