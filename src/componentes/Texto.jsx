// Mini-markdown pra frases curtas: `código` e **negrito**.
export default function Texto({ children }) {
  const partes = String(children).split(/(`[^`]+`|\*\*[^*]+\*\*)/g)
  return partes.map((p, i) =>
    p.startsWith('`') ? <code key={i}>{p.slice(1, -1)}</code> : p.startsWith('**') ? <b key={i}>{p.slice(2, -2)}</b> : p,
  )
}
