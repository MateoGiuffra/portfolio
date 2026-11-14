import ProjectCardArt from '../components/ProjectCardArt'
import { CARD_VARIANTS, PALETTE, cardOf } from '../config/cardPalette'

// Look & feel de la tarjeta del proyecto: variante, colores y vista previa en vivo.
export default function CardEditor({ item, onChange }) {
  const card = cardOf(item, item.order ?? 0)
  const set = (patch) => onChange({ ...card, ...patch })
  const hasPhoto = (item.photos || []).length > 0
  const title = item.title?.es || 'Proyecto'
  const preview = { title, stack: item.stack || [], photos: item.photos || [], card }

  return (
    <div className="bo-card">
      <div
        className="bo-card-preview"
        style={{ '--card-bg': card.bg, '--card-fg': card.fg, '--card-accent': card.accent }}
      >
        <div className={`fcard-image fcard-image--${card.variant}`}>
          <ProjectCardArt item={preview} idx={item.order ?? 0} />
        </div>
      </div>
      <div className="bo-card-controls">
        <label className="bo-field">
          <span>Tipo de tarjeta</span>
          <select value={card.variant} onChange={(e) => set({ variant: e.target.value })}>
            {CARD_VARIANTS.map((v) => <option key={v.id} value={v.id}>{v.label}</option>)}
            {hasPhoto && <option value="photo">Foto (usa la primera)</option>}
          </select>
        </label>
        <div className="bo-colors">
          {[['bg', 'Fondo'], ['fg', 'Texto'], ['accent', 'Acento']].map(([k, label]) => (
            <label className="bo-field" key={k}>
              <span>{label}</span>
              <input type="color" value={card[k]} onChange={(e) => set({ [k]: e.target.value })} />
            </label>
          ))}
        </div>
        <div className="bo-presets">
          <span className="bo-muted">Paletas:</span>
          {PALETTE.map(([bg, fg, accent]) => (
            <button
              type="button" key={bg + accent} className="bo-swatch" title={`${bg} ${accent}`}
              style={{ background: `linear-gradient(135deg, ${accent} 50%, ${bg} 50%)`, borderColor: fg }}
              onClick={() => set({ bg, fg, accent })}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
