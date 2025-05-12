import "../styles/form.css"
import Button from "./Button"
const Form = () => {
    return (
        <form action="" className='contact-form'>
            <div className='contact-form-container'>
                <legend className='contact-form-legend'>
                    <label htmlFor="">Name</label>
                    <input className='input-form' type="text" placeholder='Your name' />
                </legend>
                <legend className='contact-form-legend'>
                    <label htmlFor="">Email</label>
                    <input className='input-form' type="email" placeholder='Your email address' />
                </legend>
                <legend className='contact-form-legend'>
                    <label htmlFor="">Message</label>
                    <textarea id='textarea' className='input-form' type="text" placeholder='Your message' />
                </legend>
                <Button>Send Message</Button>
            </div>
        </form>
    )
}

export default Form
