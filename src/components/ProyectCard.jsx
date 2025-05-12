import Button from "./Button"
import { useState } from "react"
import "../styles/proyectCard.css"

const ProyectCard = ({ children, src, tags, linkToGithub, description, moreInfo = "" }) => {
    const [flipped, setFlipped] = useState(false)

    return (
        <div className="proyect-card-wrapper" onClick={() => setFlipped(!flipped)}>
            <div className={`proyect-card-inner ${flipped ? "flipped" : ""}`}>
                <div className="proyect-card-face proyect-card-front" onClick={e => e.stopPropagation()}>
                    <h3 className="proyect-card-title">{children}</h3>
                    <img className="proyect-card-img" src={src} alt={children} />
                    <p className="proyect-card-description">{description}</p>
                    <div className="proyect-card-technologies-container">
                        <p className="proyect-card-technologies">Technologies:</p>
                        <ul className="proyect-card-technologies-list">
                            {tags.map(tag => (
                                <li key={tag} className="tag">{tag}</li>
                            ))}
                        </ul>
                    </div>
                    <div className="proyect-card-button-container">
                        <Button goTo={linkToGithub}>Go to project</Button>
                        <Button onHandleClick={() => setFlipped(true)}>Show more info</Button>
                    </div>
                </div>
                <div className="proyect-card-face proyect-card-back" onClick={e => e.stopPropagation()}>
                    <h3 className="proyect-card-title">{children}</h3>
                    <p className="proyect-card-description">{moreInfo}</p>
                    <Button onHandleClick={() => setFlipped(false)}>Back</Button>
                </div>
            </div>
        </div>
    )
}

export default ProyectCard
