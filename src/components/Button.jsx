import "../styles/button.css"
/**
 * typeOf backgroud = "white"
 * typeOf backgroud = "blue"
 * */
const Button = ({ children, background = "", goTo, onHandleClick, externalPage = false, download = false, ...props }) => {
    const buttonClazz = "button " + background

    if (download) {
        return (
            <a href={goTo} className={buttonClazz} download {...props}>
                {children}
            </a>
        )
    }

    if (goTo) {
        return (
            externalPage ? (
                <a href={goTo} className={buttonClazz} nonreferrer={externalPage ? "noreferrer" : ""} target="_blank" {...props}>
                    {children}
                </a>
            ) : (
                <a href={goTo} className={buttonClazz} {...props}>
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
