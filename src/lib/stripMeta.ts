import type { ListDataMap, ListName } from '@/domain/types'

/** Los datos de un elemento de lista sin los metadatos (`id`, `_updatedAt`). */
export function stripMeta<N extends ListName>(item: ListDataMap[N] & { id?: string }): ListDataMap[N] {
  const rest: Record<string, unknown> = { ...item }
  delete rest.id
  delete rest._updatedAt
  return rest as unknown as ListDataMap[N] // solo se quitaron claves de metadatos opcionales
}
