import "../styles/button.css"
/**
 * typeOf backgroud = "white"
 * */
const Button = ({ children, backgroud = "", goTo, onHandleClick }) => {
    const buttonClazz = "button " + backgroud
    if (goTo) {
        return (
            <a href={goTo} className={buttonClazz} nonreferrer="noreferrer" target="_blank">

                {children}
            </a>
        )
    }
    return (
        <button onClick={() => onHandleClick()} className={buttonClazz}>
            {children}
        </button>
    )
}

export default Button
