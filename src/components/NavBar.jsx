import "../styles/navBar.css"


const NavBar = () => {
    const goUp = () => {
        document.scrollingElement.scrollTop = 0;
    }
    return (
        <header className="main-header">
            <ul className="nav">
                <li>
                    <a onClick={() => goUp()}>
                        <p id="my-name">Mateo Giuffra</p>
                    </a>
                </li>
                <li>
                    <ul className="nav-list">
                        <li>
                            <a href="#technologies">Technologies</a>
                        </li>
                        <li>
                            <a href="#projects">Projects</a>
                        </li>
                        <li>
                            <a href="#contact">Contact</a>
                        </li>
                    </ul>
                </li>
            </ul>
        </header>
    )
}

export default NavBar
