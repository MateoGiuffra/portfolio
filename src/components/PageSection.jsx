import "../styles/pageSection.css"
const PageSection = ({ children, title, sectionId }) => {
    return (
        <div id={sectionId} className="section-app-container" >
            <section className="section-app">
                <h2>{title}</h2>
                <div className="padding-container">
                    {children}
                </div>
            </section>
        </div>
    )
}

export default PageSection
