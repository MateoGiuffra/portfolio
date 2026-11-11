const Header = ({ t, onToggleLang }) => (
  <header className="site-header">
    <div className="site-header-inner">
      <a className="brand" href="#top">Mateo Giuffra</a>
      <nav aria-label="Principal">
        <ul className="nav-list">
          <li><a href="#work">{t.nav.work}</a></li>
          <li><a href="#experience">{t.nav.experience}</a></li>
          <li><a href="#projects">{t.nav.projects}</a></li>
          <li><a href="#skills">{t.nav.skills}</a></li>
          <li><a href="#contact">{t.nav.contact}</a></li>
        </ul>
      </nav>
      <button
        type="button"
        className="lang-toggle"
        onClick={onToggleLang}
        aria-label={t.langToggle.label}
      >
        {t.langToggle.short}
      </button>
    </div>
  </header>
)

export default Header
