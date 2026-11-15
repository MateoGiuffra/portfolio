import { useParams } from 'react-router'
import SectionsView from '@/admin/SectionsView'

// /bo/textos/:id?
export default function SectionsRoutePage() {
  const { id } = useParams()
  return <SectionsView sectionId={id} />
}
