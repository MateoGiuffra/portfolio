import "../styles/form.css";
import Button from "./Button";
import { useRef, useState } from "react";
import emailjs from "@emailjs/browser";
import { Toaster, toast } from 'react-hot-toast';

const Form = () => {
    const formRef = useRef();
    const [isSending, setIsSending] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        setIsSending(true);

        emailjs.sendForm(
            import.meta.env.VITE_EMAILJS_SERVICE_ID,
            import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
            formRef.current,
            import.meta.env.VITE_EMAILJS_PUBLIC_KEY
        )

            .then(() => {
                toast.success('Mensaje enviado!');
                formRef.current.reset();
            })
            .catch((error) => {
                console.error("Error al enviar el mensaje:", error);
                toast.error('Ocurrió un error');
            })
            .finally(() => setIsSending(false));
    };

    return (
        <>
            <form ref={formRef} className='contact-form' onSubmit={handleSubmit}>
                <div className='contact-form-container'>
                    <div className='contact-row'>
                        <legend className='contact-form-legend'>
                            <label htmlFor="name">Name</label>
                            <input
                                className='input-form'
                                type="text"
                                name="user_name"
                                placeholder='Your name'
                                required
                            />
                        </legend>
                        <legend className='contact-form-legend'>
                            <label htmlFor="email">Email</label>
                            <input
                                className='input-form'
                                type="email"
                                name="user_email"
                                placeholder='Your email address'
                                required
                            />
                        </legend>
                    </div>
                    <legend className='contact-form-legend'>
                        <label htmlFor="message">Message</label>
                        <textarea
                            id='message'
                            className='input-form input-message'
                            name="message"
                            placeholder='Your message'
                            required
                            minLength={10}
                            aria-label="Message"
                        />
                    </legend>
                    <div className="send-message-container">
                        <Button background="blue" type="submit" disabled={isSending}>
                            {isSending ? 'Sending...' : 'Send Message'}
                        </Button>

                    </div>
                </div>
            </form>
            <Toaster position="bottom-center" />
        </>
    );
};

export default Form;
