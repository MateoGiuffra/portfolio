import Icon from './Icon'
import "../styles/contactCard.css"
const ContactCard = () => {
    return (
        <div className='contact-info'>
            <div className='contact-info-container'>
                <h3>Connect with me</h3>
                <p className='free-feel'>Feel free to connect with me on any of these platforms</p>
                <ul className='contact-info-list'>
                    <li>
                        <a className="anchor-contact" href="https://www.linkedin.com/in/mateo-giuffra-023682289/" target="_blank" rel="noreferrer">
                            <div>
                                <Icon src="icons/linkedin.svg" alt="linkedin" />
                                <p className='anchor-text'>LinkedIn</p>
                            </div>
                            <p className='anchor-sub-text'>/in/mateo-giuffra</p>
                        </a>
                    </li>
                    <li>
                        <a className="anchor-contact" href="https://www.github.com/GiuffraMateo" target="_blank" rel="noreferrer">
                            <div>
                                <Icon src="icons/github.svg" alt="GitHub" />
                                <p className='anchor-text'>GitHub</p>
                            </div>
                            <p className='anchor-sub-text'>/MateoGiuffra</p>
                        </a>
                    </li>
                </ul>
                <div className='contact-info-email'>
                    <p>Prefer email? Reach out directly at:</p>
                    <a
                        href='https://mail.google.com/mail/u/0/#inbox'
                        className='email'
                        target="_blank"
                        rel="noreferrer"
                    >
                        matteogiuffrah40@gmail.com
                    </a>
                </div>
            </div>
        </div>
    )
}

export default ContactCard
