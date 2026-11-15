// SHIM temporal: nombres viejos para ListPage.jsx y SectionsPage.jsx. Borrar cuando se migren a contentRepo.
import type { ListName } from '@/domain/types'
import { fetchAll, listItems, removeItem, saveItem, saveSection } from './contentRepo'

export const fetchRaw = fetchAll
export const listDocs = (name: ListName): ReturnType<typeof listItems> => listItems(name)

// Laxo a propósito: los llamadores JS no tipan `data`. `'content'` = SectionsPage (secciones).
export async function saveDoc(name: string, id: string | null, data: never): Promise<string> {
  if (name === 'content' && id) {
    await saveSection(id as 'general', data) // el llamador JS pasa un id de sección válido
    return id
  }
  return saveItem(name as ListName, id, data) // el llamador JS pasa un nombre de lista válido
}
export const removeDoc = removeItem
