import { useEffect, useState } from 'react'
import type { SectionDoc } from '@/domain/types'
import { errorMessage } from '@/lib/notify'
import { getSection, saveSection } from '@/services/contentRepo'

export type ContentId = Parameters<typeof getSection>[0]

interface Result {
  id: ContentId
  data: SectionDoc | null
  error: string
}

export interface SectionDocState {
  /** `null` mientras carga (o si falló, con `error`). */
  data: SectionDoc | null
  error: string
  save: (data: SectionDoc) => Promise<void>
}

// `content/<id>` para el backoffice.
export function useSectionDoc(id: ContentId): SectionDocState {
  const [result, setResult] = useState<Result | null>(null)

  useEffect(() => {
    let live = true
    getSection(id)
      .then((data) => { if (live) setResult({ id, data, error: '' }) })
      .catch((e: unknown) => { if (live) setResult({ id, data: null, error: errorMessage(e) }) })
    return () => { live = false }
  }, [id])

  const save = (data: SectionDoc): Promise<void> => saveSection(id, data)
  return result?.id === id ? { data: result.data, error: result.error, save } : { data: null, error: '', save }
}
