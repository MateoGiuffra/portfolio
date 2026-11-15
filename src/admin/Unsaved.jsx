// Aviso de cambios sin guardar: modal propio al navegar dentro del BO y alerta nativa al cerrar o recargar la pestaña.
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { Button, Group, Modal, Stack, Text } from '@mantine/core'
import { setBlocker } from './router'

const Ctx = createContext({ setDirty: () => {}, guard: (action) => action() })

export function UnsavedProvider({ children }) {
  const dirty = useRef(false)
  const [pending, setPending] = useState(null)

  const setDirty = useCallback((d) => { dirty.current = d }, [])
  const guard = useCallback((action) => {
    if (dirty.current) setPending(() => action)
    else action()
  }, [])

  useEffect(() => {
    const onBeforeUnload = (e) => {
      if (!dirty.current) return
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [])

  // Atrás/adelante del navegador: el router consulta antes de salir de un formulario con cambios.
  useEffect(() => {
    setBlocker((proceed) => {
      if (!dirty.current) return false
      setPending(() => proceed)
      return true
    })
    return () => setBlocker(null)
  }, [])

  const value = useMemo(() => ({ setDirty, guard }), [setDirty, guard])
  const discard = () => {
    const action = pending
    dirty.current = false
    setPending(null)
    action?.()
  }

  return (
    <Ctx.Provider value={value}>
      {children}
      <Modal opened={!!pending} onClose={() => setPending(null)} title="Cambios sin guardar" centered zIndex={1000}>
        <Stack>
          <Text size="sm">Si salís ahora se pierden los cambios de este formulario.</Text>
          <Group justify="flex-end">
            <Button variant="default" onClick={() => setPending(null)}>Seguir editando</Button>
            <Button color="negative" onClick={discard}>Descartar y salir</Button>
          </Group>
        </Stack>
      </Modal>
    </Ctx.Provider>
  )
}

export const useUnsaved = () => useContext(Ctx)

// El formulario avisa si tiene cambios; al desmontarse se limpia solo.
export function useReportDirty(dirty) {
  const { setDirty } = useUnsaved()
  useEffect(() => {
    setDirty(dirty)
    return () => setDirty(false)
  }, [dirty, setDirty])
}
