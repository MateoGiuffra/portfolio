import "../styles/pageSection.css"
const PageSection = ({ children, title, sectionId }) => {
    return (
        <section id={sectionId} className="section-app">
            <h2>{title}</h2>
            <div className="padding-container">
                {children}
            </div>
        </section>
    )
}

export default PageSection
