import "../styles/icon.css"

const Icon = ({ src, alt, allSpace = false, goTo }) => {
    if (goTo) {
        return (
            <a href={goTo} target="_blank" rel="noreferrer" className="anchor-icon">
                <img className={allSpace ? "general-icon" : "general-icon cien"} src={src} alt={alt} />
            </a>
        )
    }

    return (
        <img className={allSpace ? "general-icon" : "general-icon cien"} src={src} alt={alt} />
    )
}

export default Icon
