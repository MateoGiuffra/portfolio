import { createContext, useContext } from 'react'
import type { ContentData } from '@/domain/types'
import { FALLBACK } from '@/services/content'

/** cache: arrancó con la caché local; loading: con el respaldo; ready: ya llegó la base; error: falló la base. */
export type ContentStatus = 'cache' | 'loading' | 'ready' | 'error'

export interface ContentState {
  content: ContentData
  status: ContentStatus
}

export const ContentContext = createContext<ContentState>({ content: FALLBACK, status: 'loading' })

// { es, en, links, cv }
export const useContent = (): ContentData => useContext(ContentContext).content

export const useContentStatus = (): ContentStatus => useContext(ContentContext).status
