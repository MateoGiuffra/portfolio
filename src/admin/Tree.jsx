// Editor genérico: arma el formulario a partir de la forma del dato (string, número, lista, objeto).
const PROTOS = { stats: { n: '', l: '' } }

const blankLike = (v) =>
  Array.isArray(v) ? [] : v && typeof v === 'object' ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, blankLike(x)])) : typeof v === 'number' ? 0 : ''

export function Tree({ name, value, onChange }) {
  if (Array.isArray(value)) {
    if (value.every((x) => typeof x !== 'object')) {
      return (
        <textarea
          rows={Math.min(8, Math.max(2, value.length + 1))}
          value={value.join('\n')}
          onChange={(e) => onChange(e.target.value.split('\n').map((s) => s.trim()).filter(Boolean))}
          placeholder="Uno por línea"
        />
      )
    }
    const proto = PROTOS[name] || (value[0] ? blankLike(value[0]) : {})
    return (
      <div className="bo-rep">
        {value.map((item, i) => (
          <div className="bo-rep-item" key={i}>
            <Tree value={item} onChange={(v) => onChange(value.map((x, j) => (j === i ? v : x)))} />
            <button type="button" className="ghost danger" onClick={() => onChange(value.filter((_, j) => j !== i))}>Quitar</button>
          </div>
        ))}
        <button type="button" className="ghost" onClick={() => onChange([...value, structuredClone(proto)])}>+ Agregar</button>
      </div>
    )
  }
  if (value && typeof value === 'object') {
    return (
      <div className="bo-obj">
        {Object.entries(value).map(([k, v]) => (
          <label className="bo-field" key={k}>
            <span>{k}</span>
            <Tree name={k} value={v} onChange={(nv) => onChange({ ...value, [k]: nv })} />
          </label>
        ))}
      </div>
    )
  }
  if (typeof value === 'number') {
    return <input type="number" value={value} onChange={(e) => onChange(Number(e.target.value))} />
  }
  if (typeof value === 'boolean') {
    return <input type="checkbox" checked={value} onChange={(e) => onChange(e.target.checked)} />
  }
  const text = value ?? ''
  return text.length > 70 || text.includes('\n') ? (
    <textarea rows={Math.min(8, Math.ceil(text.length / 70) + 1)} value={text} onChange={(e) => onChange(e.target.value)} />
  ) : (
    <input value={text} onChange={(e) => onChange(e.target.value)} />
  )
}

// Campo con versión ES y EN lado a lado: valor {es, en}.
export function Localized({ name, value, onChange }) {
  const v = value && typeof value === 'object' && !Array.isArray(value) ? value : { es: value ?? '', en: '' }
  return (
    <div className="bo-row">
      {['es', 'en'].map((l) => (
        <div className="bo-lang" key={l}>
          <small>{l.toUpperCase()}</small>
          <Tree name={name} value={v[l] ?? blankLike(v.es)} onChange={(nv) => onChange({ ...v, [l]: nv })} />
        </div>
      ))}
    </div>
  )
}
