import "../styles/technologieCard.css"
const TechnologieCard = ({ title, children, src, alt }) => {
    const personalizedAlt = alt || title
    return (
        <div className="technology" title={title}>
            <div className="reflec-light"></div>
            <p>{children}</p>
            <img src={src} alt={personalizedAlt} />
        </div>
    )
}

export default TechnologieCard
