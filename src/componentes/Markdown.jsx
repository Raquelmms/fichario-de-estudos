import { useMemo } from 'react'
import { marked } from 'marked'
import DOMPurify from 'dompurify'

// Markdown das anotações. Os "- [ ]" viram caixinhas clicáveis (quando onMarcar existe).
export default function Markdown({ texto, onMarcar }) {
  const html = useMemo(() => {
    let n = 0
    const bruto = marked.parse(texto || '', { gfm: true }).replace(/<input (checked="" )?disabled="" type="checkbox">/g, (_, marcado) =>
      `<input type="checkbox" data-i="${n++}" ${marcado ? 'checked' : ''} ${onMarcar ? '' : 'disabled'}>`,
    )
    return DOMPurify.sanitize(bruto, { ADD_ATTR: ['target', 'data-i'] }).replace(/<a /g, '<a target="_blank" rel="noreferrer" ')
  }, [texto, onMarcar])

  const aoClicar = e => {
    const el = e.target
    if (el.tagName === 'INPUT' && el.dataset.i !== undefined && onMarcar) onMarcar(+el.dataset.i, el.checked)
  }

  return <div className="md" onClick={aoClicar} dangerouslySetInnerHTML={{ __html: html }} />
}

// Marca/desmarca o i-ésimo "- [ ]" do texto.
export const marcarItem = (texto, indice, marcado) => {
  let n = -1
  return texto.replace(/^(\s*[-*] )\[( |x|X)\]/gm, (m, ini) => (++n === indice ? `${ini}[${marcado ? 'x' : ' '}]` : m))
}
