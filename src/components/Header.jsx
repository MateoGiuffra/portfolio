import RollText from './RollText'

const Header = ({ t, onToggleLang }) => (
  <header className="site-header">
    <div className="site-header-inner">
      <a className="brand" href="#top">Mateo Giuffra</a>
      <nav aria-label="Principal">
        <ul className="nav-list">
          {[
            ['experience', t.nav.experience],
            ['projects', t.nav.projects],
            ['work', t.nav.work],
            ['skills', t.nav.skills],
          ].map(([id, label]) => (
            <li key={id}>
              <a className="pill roll-host" href={`#${id}`}>
                <span className="sr-only">{label}</span>
                <RollText text={label} />
              </a>
            </li>
          ))}
          <li>
            <a className="pill pill-dark roll-host" href="#contact">
              <span className="sr-only">{t.nav.contact}</span>
              <RollText text={t.nav.contact} />
              <i className="pill-dot" aria-hidden="true" />
            </a>
          </li>
        </ul>
      </nav>
      <button
        type="button"
        className="pill lang-toggle roll-host"
        onClick={onToggleLang}
        aria-label={t.langToggle.label}
      >
        <RollText text={t.langToggle.short} />
      </button>
    </div>
  </header>
)

export default Header
