import { useEffect, useRef, useState } from 'react'

const OPCOES = [
  '📒', '📓', '📔', '📕', '📗', '📘', '📙', '📚', '✏️', '🖍️', '📐', '📏', '🧮', '🔬', '🧪', '🧬',
  '🌍', '🗺️', '🏛️', '💻', '🖥️', '⌨️', '🧠', '💡', '🎨', '🎵', '🎹', '📷', '🗣️', '💬', '💰', '📊',
  '📈', '⚖️', '🩺', '💊', '🍎', '🌱', '🌷', '🌸', '🎀', '💖', '🦋', '🦄', '🐱', '🐰', '🧸', '🍓',
  '⭐', '✨', '🌈', '🌙', '☕', '🎧', '🏆', '🎯', '🔥', '🚀', '🇧🇷', '🇺🇸', '🇬🇧', '🇪🇸', '🇫🇷', '🇯🇵',
]

// Botão que mostra o emoji atual; clicando abre a grade pra escolher (ou digitar/colar outro).
export default function SeletorEmoji({ valor, onEscolher }) {
  const [aberto, setAberto] = useState(false)
  const [outro, setOutro] = useState('')
  const ref = useRef(null)

  useEffect(() => {
    if (!aberto) return
    const fora = e => !ref.current?.contains(e.target) && setAberto(false)
    window.addEventListener('pointerdown', fora)
    return () => window.removeEventListener('pointerdown', fora)
  }, [aberto])

  const escolher = e => {
    onEscolher(e)
    setAberto(false)
    setOutro('')
  }

  return (
    <span className="seletor-emoji" ref={ref}>
      <button className="seletor-emoji-botao" onClick={() => setAberto(v => !v)} aria-expanded={aberto} aria-label={`emoji da capa: ${valor || 'nenhum'}. Trocar`}>
        {valor || '➕'}
      </button>
      {aberto && (
        <div className="seletor-emoji-painel" role="dialog" aria-label="escolha um emoji">
          <div className="seletor-emoji-grade">
            {OPCOES.map(e => (
              <button key={e} onClick={() => escolher(e)} aria-pressed={e === valor} aria-label={e}>{e}</button>
            ))}
          </div>
          <input
            className="campo"
            value={outro}
            placeholder="ou cole/digite outro e aperte Enter"
            aria-label="outro emoji"
            onChange={e => setOutro(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && outro.trim() && escolher(outro.trim())}
          />
          <p className="dica">No Windows, a tecla <b>Windows + .</b> abre o teclado de emojis. No Mac, <b>Ctrl + Cmd + Espaço</b>.</p>
        </div>
      )}
    </span>
  )
}
