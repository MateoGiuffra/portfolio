import emailjs from '@emailjs/browser'

const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY

// El formulario solo se muestra si el build recibió las claves de EmailJS (.env).
export const isMailConfigured: boolean = Boolean(SERVICE_ID && TEMPLATE_ID && PUBLIC_KEY)

export async function sendContactForm(form: HTMLFormElement): Promise<void> {
  if (!SERVICE_ID || !TEMPLATE_ID || !PUBLIC_KEY) throw new Error('EmailJS no está configurado.')
  await emailjs.sendForm(SERVICE_ID, TEMPLATE_ID, form, PUBLIC_KEY)
}
