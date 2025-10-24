import Icon from './Icon'
import "../styles/contactCard.css"
import Button from './Button'
import { cvPath } from '../data/constants'
const ContactCard = () => {
    return (
        <div className='contact-card'>
            <div className='contact-card-header'>
                <div className='contact-avatar'>
                    <div className="contact-initials">MG</div>
                </div>
                <div className='contact-card-title'>
                    <h3>Connect with me</h3>
                    <p className='free-feel'>Feel free to connect with me on any of these platforms</p>
                </div>
            </div>

            <ul className='contact-methods'>
                <li>
                    <a className="contact-method" href="https://www.linkedin.com/in/mateo-giuffra-023682289/" target="_blank" rel="noreferrer">
                        <div className='method-left'>
                            <Icon src="icons/linkedin.svg" alt="linkedin" />
                            <div className='method-texts'>
                                <span className='method-title'>LinkedIn</span>
                                <small className='method-sub'>/in/mateo-giuffra</small>
                            </div>
                        </div>
                    </a>
                </li>
                <li>
                    <a className="contact-method" href="https://www.github.com/MateoGiuffra" target="_blank" rel="noreferrer">
                        <div className='method-left'>
                            <Icon src="icons/github.svg" alt="GitHub" />
                            <div className='method-texts'>
                                <span className='method-title'>GitHub</span>
                                <small className='method-sub'>/MateoGiuffra</small>
                            </div>
                        </div>
                    </a>
                </li>
            </ul>

            <div className='contact-card-actions'>
                <Button goTo='mailto:matteogiuffrah40@gmail.com'>Send Email</Button>
                <Button goTo={cvPath} download>Download CV</Button>
            </div>
        </div>
    )
}

export default ContactCard
