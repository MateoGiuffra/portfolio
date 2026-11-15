import type { ReactNode } from 'react'
import { Briefcase, FileText, GraduationCap, LayoutGrid, Workflow, Wrench } from 'lucide-react'
import type { ListName } from '@/domain/types'
import { ICON } from '@/lib/icons'

export type AdminTabKey = 'sections' | ListName

export interface AdminTab {
  key: AdminTabKey
  label: string
  icon: ReactNode
  // Segmento de la URL: /bo/<slug>
  slug: string
}

export const ADMIN_TABS: readonly AdminTab[] = [
  { key: 'sections', label: 'Textos', icon: <FileText {...ICON} />, slug: 'textos' },
  { key: 'projects', label: 'Proyectos', icon: <LayoutGrid {...ICON} />, slug: 'proyectos' },
  { key: 'jobs', label: 'Trabajos', icon: <Briefcase {...ICON} />, slug: 'trabajos' },
  { key: 'education', label: 'Estudios', icon: <GraduationCap {...ICON} />, slug: 'estudios' },
  { key: 'skillGroups', label: 'Habilidades', icon: <Wrench {...ICON} />, slug: 'habilidades' },
  { key: 'workItems', label: 'Cómo trabajo', icon: <Workflow {...ICON} />, slug: 'como-trabajo' },
]

// slug -> lista editable ('textos' no es una lista: va a SectionsView).
export const listNameForSlug = (slug: string | undefined): ListName | undefined => {
  const tab = ADMIN_TABS.find((t) => t.slug === slug)
  return tab && tab.key !== 'sections' ? tab.key : undefined
}
