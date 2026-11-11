// Diagrama hexagonal dibujado en SVG: dominio al centro, puertos en los vértices,
// adaptadores alrededor y un anillo de harness. Se "dibuja" una sola vez al cargar.
const CX = 240
const CY = 240
const HEX_R = 84
const ADAPTER_R = 178
const BOX_W = 124
const BOX_H = 32

const polar = (r, deg) => {
  const a = (deg * Math.PI) / 180
  return [CX + r * Math.cos(a), CY + r * Math.sin(a)]
}

const ANGLES = [-90, -30, 30, 90, 150, 210]

const ArchitectureDiagram = ({ hero }) => {
  const vertices = ANGLES.map((a) => polar(HEX_R, a))
  const hexPoints = vertices.map((p) => p.join(',')).join(' ')

  return (
    <svg
      className="diagram"
      viewBox="0 0 480 480"
      role="img"
      aria-label={hero.diagramLabel}
    >
      <circle className="d-harness d-draw" cx={CX} cy={CY} r="214" pathLength="1" />

      {ANGLES.map((a, i) => {
        const [vx, vy] = vertices[i]
        // el trazo termina dentro del recuadro; el recuadro (con relleno) lo tapa
        const [lx, ly] = polar(ADAPTER_R - BOX_H / 2, a)
        return (
          <line
            key={`l-${a}`}
            className="d-line d-draw"
            x1={vx}
            y1={vy}
            x2={lx}
            y2={ly}
            pathLength="1"
          />
        )
      })}

      <polygon className="d-hex d-draw" points={hexPoints} pathLength="1" />

      {vertices.map(([vx, vy], i) => (
        <circle key={`p-${i}`} className="d-port" cx={vx} cy={vy} r="6" />
      ))}

      <text className="d-core" x={CX} y={CY + 5} textAnchor="middle">
        {hero.core}
      </text>

      {ANGLES.map((a, i) => {
        const [ax, ay] = polar(ADAPTER_R, a)
        return (
          <g key={`a-${a}`} className="d-adapter">
            <rect x={ax - BOX_W / 2} y={ay - BOX_H / 2} width={BOX_W} height={BOX_H} rx="3" />
            <text x={ax} y={ay + 5} textAnchor="middle">{hero.adapters[i]}</text>
          </g>
        )
      })}

      <g className="d-note">
        <text x={CX} y="470" textAnchor="middle">{hero.harness}</text>
      </g>
    </svg>
  )
}

export default ArchitectureDiagram
