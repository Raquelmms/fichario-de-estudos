// A turminha do fichário: personagens originais, desenhados aqui mesmo em SVG.
// Pra criar outro, copie um bloco, mude o id/nome e desenhe num viewBox 0 0 100 100.

const T = '#4a3346' // contorno
const traco = { stroke: T, strokeWidth: 2.5, strokeLinecap: 'round', strokeLinejoin: 'round' }

const Olhos = ({ y = 56, dx = 13, r = 4.5 }) => (
  <>
    <ellipse cx={50 - dx} cy={y} rx={r - 0.5} ry={r} fill={T} />
    <ellipse cx={50 + dx} cy={y} rx={r - 0.5} ry={r} fill={T} />
    <circle cx={50 - dx + 1.3} cy={y - 1.6} r="1.4" fill="#fff" />
    <circle cx={50 + dx + 1.3} cy={y - 1.6} r="1.4" fill="#fff" />
  </>
)
const Bochechas = ({ y = 64, dx = 23, cor = '#ff9fbf' }) => (
  <>
    <ellipse cx={50 - dx} cy={y} rx="6" ry="3.6" fill={cor} opacity=".75" />
    <ellipse cx={50 + dx} cy={y} rx="6" ry="3.6" fill={cor} opacity=".75" />
  </>
)
const Sorriso = ({ y = 63 }) => <path d={`M45 ${y} Q47.5 ${y + 4} 50 ${y} Q52.5 ${y + 4} 55 ${y}`} fill="none" {...traco} strokeWidth="2" />
const Estrela = ({ x, y, r = 7, cor = '#ffd84d' }) => {
  const p = Array.from({ length: 10 }, (_, i) => {
    const a = (Math.PI / 5) * i - Math.PI / 2
    const raio = i % 2 ? r * 0.45 : r
    return `${(x + raio * Math.cos(a)).toFixed(1)},${(y + raio * Math.sin(a)).toFixed(1)}`
  }).join(' ')
  return <polygon points={p} fill={cor} {...traco} strokeWidth="1.8" />
}
const Coracao = ({ x, y, s = 1, cor = '#ff6f9c' }) => (
  <path
    transform={`translate(${x} ${y}) scale(${s})`}
    d="M0 6 C-8 0 -10 -7 -5 -9 C-2 -10 0 -8 0 -6 C0 -8 2 -10 5 -9 C10 -7 8 0 0 6 Z"
    fill={cor}
    {...traco}
    strokeWidth={1.8 / s}
  />
)

export const PERSONAGENS = [
  {
    id: 'nina',
    nome: 'Nina, a gatinha',
    svg: (
      <>
        <path d="M20 44 L24 12 L46 30 Z" fill="#ffcfb3" {...traco} />
        <path d="M80 44 L76 12 L54 30 Z" fill="#ffcfb3" {...traco} />
        <path d="M26 34 L27 20 L38 29 Z" fill="#ffa8bd" />
        <path d="M74 34 L73 20 L62 29 Z" fill="#ffa8bd" />
        <ellipse cx="50" cy="56" rx="38" ry="31" fill="#ffe0cc" {...traco} />
        <Olhos />
        <Bochechas />
        <Sorriso />
        <Estrela x={73} y={24} r={8} />
      </>
    ),
  },
  {
    id: 'lulu',
    nome: 'Lulu, a coelhinha',
    svg: (
      <>
        <ellipse cx="36" cy="26" rx="9" ry="24" transform="rotate(-12 36 26)" fill="#e9dcff" {...traco} />
        <ellipse cx="64" cy="26" rx="9" ry="24" transform="rotate(12 64 26)" fill="#e9dcff" {...traco} />
        <ellipse cx="36" cy="28" rx="4" ry="15" transform="rotate(-12 36 28)" fill="#ffc2dc" />
        <ellipse cx="64" cy="28" rx="4" ry="15" transform="rotate(12 64 28)" fill="#ffc2dc" />
        <ellipse cx="50" cy="60" rx="34" ry="28" fill="#f4edff" {...traco} />
        <path d="M33 58 Q37 52 41 58" fill="none" {...traco} />
        <path d="M59 58 Q63 52 67 58" fill="none" {...traco} />
        <Bochechas y={65} dx={21} />
        <ellipse cx="50" cy="66" rx="2.6" ry="2.2" fill={T} />
        <Coracao x={50} y={86} s={1.3} />
      </>
    ),
  },
  {
    id: 'nyx',
    nome: 'Nyx, a morceguinha',
    svg: (
      <>
        <path d="M24 52 Q6 40 4 60 Q12 56 14 66 Q20 60 26 66 Z" fill="#3b2a55" {...traco} />
        <path d="M76 52 Q94 40 96 60 Q88 56 86 66 Q80 60 74 66 Z" fill="#3b2a55" {...traco} />
        <path d="M30 34 L32 16 L44 28 Z" fill="#5b4380" {...traco} />
        <path d="M70 34 L68 16 L56 28 Z" fill="#5b4380" {...traco} />
        <circle cx="50" cy="55" r="29" fill="#6b4f96" {...traco} />
        <ellipse cx="50" cy="60" rx="20" ry="16" fill="#f3e8ff" />
        <Olhos y={56} dx={11} r={4.2} />
        <path d="M34 50 L37 47 M66 50 L63 47" {...traco} strokeWidth="2" />
        <path d="M45 64 Q50 68 55 64" fill="none" {...traco} strokeWidth="2" />
        <path d="M52 65.5 L53.5 69.5 L55 65" fill="#fff" {...traco} strokeWidth="1.4" />
        <Bochechas y={64} dx={16} cor="#ff8fd0" />
        <path d="M66 24 L60 33 L65 33 L59 42 L71 30 L66 30 L70 24 Z" fill="#ffe14d" {...traco} strokeWidth="1.8" />
      </>
    ),
  },
  {
    id: 'bia',
    nome: 'Bia, a ursinha estudiosa',
    svg: (
      <>
        <circle cx="28" cy="30" r="12" fill="#d9a77a" {...traco} />
        <circle cx="72" cy="30" r="12" fill="#d9a77a" {...traco} />
        <circle cx="28" cy="30" r="6" fill="#ffc2c8" />
        <circle cx="72" cy="30" r="6" fill="#ffc2c8" />
        <circle cx="50" cy="56" r="32" fill="#ecc69e" {...traco} />
        <ellipse cx="50" cy="68" rx="12" ry="9" fill="#f8e6d2" />
        <ellipse cx="50" cy="64" rx="3.5" ry="2.6" fill={T} />
        <path d="M46 70 Q50 73 54 70" fill="none" {...traco} strokeWidth="2" />
        <circle cx="38" cy="52" r="9" fill="rgba(255,255,255,.45)" {...traco} />
        <circle cx="62" cy="52" r="9" fill="rgba(255,255,255,.45)" {...traco} />
        <path d="M47 52 L53 52" {...traco} />
        <circle cx="38" cy="53" r="2.6" fill={T} />
        <circle cx="62" cy="53" r="2.6" fill={T} />
        <Bochechas y={66} dx={24} />
        <g transform="rotate(-35 80 80)">
          <rect x="62" y="76" width="34" height="8" rx="2" fill="#ffd84d" {...traco} strokeWidth="2" />
          <path d="M96 76 L104 80 L96 84 Z" fill="#f8e6d2" {...traco} strokeWidth="2" />
          <rect x="58" y="76" width="6" height="8" rx="2" fill="#ff9fbf" {...traco} strokeWidth="2" />
        </g>
      </>
    ),
  },
  {
    id: 'fofa',
    nome: 'Fofa, a nuvenzinha',
    svg: (
      <>
        <path d="M24 74 Q8 74 10 58 Q12 44 28 46 Q30 28 50 28 Q68 28 72 44 Q90 42 91 58 Q92 74 76 74 Z" fill="#ffffff" {...traco} />
        <Olhos y={56} dx={12} r={4} />
        <Bochechas y={63} dx={21} />
        <Sorriso y={62} />
        <Estrela x={84} y={24} r={6} cor="#ffe9a8" />
        <Estrela x={16} y={30} r={4.5} cor="#cfe4ff" />
      </>
    ),
  },
  {
    id: 'moranguinho',
    nome: 'Moranguinho',
    svg: (
      <>
        <path d="M50 92 C22 82 14 52 28 40 C38 32 62 32 72 40 C86 52 78 82 50 92 Z" fill="#ff7a95" {...traco} />
        <path d="M32 38 L38 24 L50 32 L62 24 L68 38 Q50 46 32 38 Z" fill="#6fd39a" {...traco} />
        {[[34, 58], [66, 58], [40, 76], [60, 76], [50, 84]].map(([x, y]) => (
          <ellipse key={x + '-' + y} cx={x} cy={y} rx="1.8" ry="2.6" fill="#ffe08a" />
        ))}
        <Olhos y={57} dx={10} r={4} />
        <Bochechas y={64} dx={18} cor="#ffd0dc" />
        <Sorriso y={64} />
      </>
    ),
  },
  {
    id: 'cafezinho',
    nome: 'Cafezinho',
    svg: (
      <>
        <path d="M70 52 Q86 52 84 64 Q82 74 68 72" fill="none" {...traco} strokeWidth="5" stroke="#ffd6e4" />
        <path d="M70 52 Q86 52 84 64 Q82 74 68 72" fill="none" {...traco} />
        <path d="M22 42 H74 V68 Q74 88 56 88 H40 Q22 88 22 68 Z" fill="#fff5ea" {...traco} />
        <ellipse cx="48" cy="42" rx="26" ry="5" fill="#9b6a4a" {...traco} />
        <Coracao x={48} y={24} s={1} cor="#ff9fbf" />
        <path d="M38 34 Q34 28 38 22" fill="none" stroke="#c9b6c6" strokeWidth="2.5" strokeLinecap="round" />
        <Olhos y={62} dx={10} r={3.8} />
        <Bochechas y={69} dx={17} />
        <Sorriso y={68} />
      </>
    ),
  },
  {
    id: 'livrinho',
    nome: 'Livrinho',
    svg: (
      <>
        <path d="M50 28 Q32 20 12 26 V80 Q32 74 50 82 Q68 74 88 80 V26 Q68 20 50 28 Z" fill="#cfe4ff" {...traco} />
        <path d="M50 28 V82" {...traco} />
        <path d="M18 34 Q32 30 44 35 M18 44 Q30 40 40 44" fill="none" stroke="#8fb2e8" strokeWidth="2" strokeLinecap="round" />
        <Olhos y={56} dx={18} r={3.8} />
        <Bochechas y={64} dx={25} />
        <path d="M44 64 Q50 70 56 64" fill="none" {...traco} strokeWidth="2" />
        <Estrela x={76} y={38} r={6} />
      </>
    ),
  },
]

export function Personagem({ id }) {
  const p = PERSONAGENS.find(x => x.id === id)
  if (!p) return null
  return (
    <svg className="personagem-adesivo" viewBox="0 0 100 100" role="img" aria-label={p.nome} overflow="visible">
      {p.svg}
    </svg>
  )
}
