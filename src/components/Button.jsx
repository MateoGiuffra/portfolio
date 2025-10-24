import "../styles/button.css"
/**
 * typeOf backgroud = "white"
 * */
const Button = ({ children, background = "", goTo, onHandleClick, externalPage = false, download = false, ...props }) => {
    const buttonClazz = "button " + background

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
        <button onClick={onHandleClick} className={buttonClazz} {...props}>
            {children}
        </button>
    )
}

export default Button
