import "../styles/navBar.css"
const NavBar = () => {
    return (
        <header className="main-header">
            <ul className="nav">
                <li>
                    <a href="#mateo-giuffra">
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
