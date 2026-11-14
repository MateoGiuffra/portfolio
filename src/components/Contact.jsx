import { useRef, useState } from 'react'
import emailjs from '@emailjs/browser'
import { Toaster, toast } from 'react-hot-toast'
import Section from './Section'
import { useContent } from '../services/useContent'

// El formulario solo se muestra si el build recibió las claves de EmailJS (.env).
const emailjsReady = Boolean(
  import.meta.env.VITE_EMAILJS_SERVICE_ID &&
    import.meta.env.VITE_EMAILJS_TEMPLATE_ID &&
    import.meta.env.VITE_EMAILJS_PUBLIC_KEY
)

const Contact = ({ t }) => {
  const { links: LINKS } = useContent()
  const c = t.contact
  const formRef = useRef(null)
  const [isSending, setIsSending] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setIsSending(true)

    emailjs
      .sendForm(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        formRef.current,
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY
      )
      .then(() => {
        toast.success(c.sent)
        formRef.current.reset()
      })
      .catch((error) => {
        console.error('Error al enviar el mensaje:', error)
        toast.error(c.error)
      })
      .finally(() => setIsSending(false))
  }

  return (
    <Section id="contact" title={c.title}>
      <p className="contact-text">{c.text}</p>
      <ul className="contact-links">
        <li><a href={LINKS.email}>{c.emailLink}</a></li>
        <li><a href={LINKS.linkedin} target="_blank" rel="noreferrer">LinkedIn</a></li>
        <li><a href={LINKS.github} target="_blank" rel="noreferrer">GitHub</a></li>
      </ul>

      {emailjsReady && (
      <form ref={formRef} className="contact-form" onSubmit={handleSubmit}>
        <div className="field-row">
          <div className="field">
            <label htmlFor="user_name">{c.name}</label>
            <input id="user_name" name="user_name" type="text" autoComplete="name" required />
          </div>
          <div className="field">
            <label htmlFor="user_email">{c.email}</label>
            <input id="user_email" name="user_email" type="email" autoComplete="email" required />
          </div>
        </div>
        <div className="field">
          <label htmlFor="message">{c.message}</label>
          <textarea id="message" name="message" rows="5" minLength={10} required />
        </div>
        <button className="btn btn-primary" type="submit" disabled={isSending}>
          {isSending ? c.sending : c.send}
        </button>
      </form>
      )}
      <Toaster position="bottom-center" />
    </Section>
  )
}

export default Contact
