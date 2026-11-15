import { createContext, useContext, useEffect } from 'react'

// Aviso de cambios sin guardar. El provider (admin/UnsavedProvider) implementa el contexto.
export interface UnsavedContextValue {
  setDirty: (dirty: boolean) => void
  // Ejecuta `action` ya, o después de confirmar el descarte si hay cambios sin guardar.
  guard: (action: () => void) => void
}

export const UnsavedContext = createContext<UnsavedContextValue>({
  setDirty: () => {},
  guard: (action) => action(),
})

export const useUnsaved = (): UnsavedContextValue => useContext(UnsavedContext)

// El formulario avisa si tiene cambios; al desmontarse se limpia solo.
export function useReportDirty(dirty: boolean): void {
  const { setDirty } = useUnsaved()
  useEffect(() => {
    setDirty(dirty)
    return () => setDirty(false)
  }, [dirty, setDirty])
}
