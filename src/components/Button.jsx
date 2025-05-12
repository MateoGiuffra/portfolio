import "../styles/button.css"
/**
 * typeOf backgroud = "white"
 * */
const Button = ({ children, backgroud = "", goTo, onHandleClick, externalPage = false, download = false }) => {
    const buttonClazz = "button " + backgroud

    if (download) {
        return (
            <a href={goTo} className={buttonClazz} download>
                {children}
            </a>
        )
    }

    if (goTo) {
        return (
            externalPage ? (
                <a href={goTo} className={buttonClazz} nonreferrer={externalPage ? "noreferrer" : ""} target="_blank">
                    {children}
                </a>
            ) : (
                <a href={goTo} className={buttonClazz}>
                    {children}
                </a>
            )
        )
    }
    return (
        <button onClick={onHandleClick} className={buttonClazz}>
            {children}
        </button>
    )
}

export default Button
