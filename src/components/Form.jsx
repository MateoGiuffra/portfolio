import "../styles/form.css";
import Button from "./Button";
import { useRef } from "react";
import emailjs from "@emailjs/browser";
import { Toaster, toast } from 'react-hot-toast';

const Form = () => {
    const formRef = useRef();

    const handleSubmit = async (e) => {
        e.preventDefault();

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
            });
    };

    return (
        <>
            <form ref={formRef} className='contact-form' onSubmit={handleSubmit}>
                <div className='contact-form-container'>
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
                    <legend className='contact-form-legend'>
                        <label htmlFor="message">Message</label>
                        <textarea
                            id='textarea'
                            className='input-form'
                            name="message"
                            placeholder='Your message'
                            required
                            minLength={10}
                        />
                    </legend>
                    <Button type="submit">Send Message</Button>
                </div>
            </form>
            <Toaster position="bottom-center" />
        </>
    );
};

export default Form;
