import { notifications } from '@mantine/notifications'

export const errorMessage = (e: unknown): string => (e instanceof Error ? e.message : String(e))

// Aviso de error del backoffice (un solo lugar en vez de try/catch + notifications.show repetidos).
export const notifyError = (title: string, e: unknown): void => {
  notifications.show({ color: 'negative', title, message: errorMessage(e) })
}

export const notifyOk = (message: string): void => {
  notifications.show({ color: 'positive', message })
}
