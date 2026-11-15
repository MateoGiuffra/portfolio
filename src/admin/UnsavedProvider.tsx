// Aviso de cambios sin guardar: modal propio al navegar dentro del BO y alerta nativa al cerrar o recargar la pestaña.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { useBlocker } from 'react-router'
import { Button, Group, Modal, Stack, Text } from '@mantine/core'
import { UnsavedContext } from '@/hooks/useUnsaved'
import type { UnsavedContextValue } from '@/hooks/useUnsaved'

interface UnsavedProviderProps {
  children: ReactNode
}

export default function UnsavedProvider({ children }: UnsavedProviderProps) {
  const dirty = useRef(false)
  // Acción de un link/botón del BO (guard) a la espera de confirmar el descarte.
  const [pending, setPending] = useState<(() => void) | null>(null)

  // Atrás/adelante del navegador con cambios sin guardar: se bloquea y se pregunta antes de salir.
  // Los push/replace del propio BO pasan por guard(), que ya pregunta.
  const blocker = useBlocker(({ historyAction }) => historyAction === 'POP' && dirty.current)
  const blocked = blocker.state === 'blocked'

  const setDirty = useCallback((d: boolean) => { dirty.current = d }, [])
  const guard = useCallback((action: () => void) => {
    if (dirty.current) setPending(() => action)
    else action()
  }, [])

  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!dirty.current) return
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [])

  const value = useMemo<UnsavedContextValue>(() => ({ setDirty, guard }), [setDirty, guard])

  const keepEditing = () => {
    if (blocked) blocker.reset()
    setPending(null)
  }
  const discard = () => {
    const action = pending
    dirty.current = false
    setPending(null)
    if (blocked) blocker.proceed()
    else action?.()
  }

  return (
    <UnsavedContext.Provider value={value}>
      {children}
      <Modal opened={blocked || !!pending} onClose={keepEditing} title="Cambios sin guardar" centered zIndex={1000}>
        <Stack>
          <Text size="sm">Si salís ahora se pierden los cambios de este formulario.</Text>
          <Group justify="flex-end">
            <Button variant="default" onClick={keepEditing}>Seguir editando</Button>
            <Button color="negative" onClick={discard}>Descartar y salir</Button>
          </Group>
        </Stack>
      </Modal>
    </UnsavedContext.Provider>
  )
}
