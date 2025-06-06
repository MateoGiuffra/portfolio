import Button from "./Button"
import { useState } from "react"
import "../styles/proyectCard.css"

const ProyectCard = ({ children, src, tags, linkToGithub, description, moreInfo = [], srcBackImage }) => {
    const [flipped, setFlipped] = useState(false)

    return (
        <article className="proyect-card-wrapper" onClick={() => setFlipped(!flipped)}>
            <div className={`proyect-card-inner ${flipped ? "flipped" : ""}`}>
                <section className="proyect-card-face proyect-card-front" onClick={e => e.stopPropagation()}>
                    <div className="proyect-title-img-and-description-container">
                        <h3 className="proyect-card-title">{children}</h3>
                        <img className="proyect-card-img" src={src} alt={children} />
                        <p className="proyect-card-description">{description}</p>
                    </div>
                    <div className="proyect-card-techs-and-buttons-container">
                        <section className="proyect-card-technologies-container">
                            <h2 className="proyect-card-technologies">Technologies:</h2>
                            <ul className="proyect-card-technologies-list">
                                {tags.map(tag => (
                                    <li key={tag} className="tag">{tag}</li>
                                ))}
                            </ul>
                        </section>
                        <section className="proyect-card-button-container">
                            <Button goTo={linkToGithub} externalPage={true}>Go to project</Button>
                            <Button onHandleClick={() => setFlipped(true)}>Show more info</Button>
                        </section>
                    </div>
                </section>
                <section className="proyect-card-face proyect-card-back" onClick={e => e.stopPropagation()}>
                    <h3 className="proyect-card-title">{children}</h3>
                    <h4 className="proyect-card-subtitle">How does it work?</h4>
                    <ul className="proyect-card-more-info-list">
                        {moreInfo.map((info, index) => (
                            <li key={index} className="proyect-card-more-info">{info}</li>
                        ))}
                    </ul>
                    <div className="proyect-card-back-image-container">
                        <img className="proyect-card-back-image" src={srcBackImage} alt={children} />
                    </div>
                    <Button onHandleClick={() => setFlipped(false)}>Back</Button>
                </section>
            </div>
        </article>
    )
}

export default ProyectCard
