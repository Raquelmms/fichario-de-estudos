import { useState } from 'react'
import { PERSONAGENS, Personagem } from './Personagens.jsx'

// Catálogo de adesivos. Pra adicionar mais, é só acrescentar nas listas.
export const EMOJIS = [
  '🎀', '💖', '🩷', '💗', '💌', '🌸', '🌷', '🌺', '🦋', '🦄', '🧸', '🐰', '🐱', '🍓', '🍒', '🍰', '🧁', '🫧',
  '⭐', '✨', '🌈', '🌙', '🍀', '🔥', '💡', '🧠', '📌', '✅', '❗', '❓', '🎯', '💻', '☕', '🎧', '📚', '🏆',
]
export const SELOS = [
  { valor: 'importante!', cor: 'vermelho' },
  { valor: 'cai na prova', cor: 'rosa' },
  { valor: 'revisar', cor: 'laranja' },
  { valor: 'entendi ✓', cor: 'verde' },
  { valor: 'dúvida?', cor: 'roxo' },
  { valor: 'foco', cor: 'azul' },
  { valor: 'arrasei', cor: 'amarelo' },
  { valor: 'girl power', cor: 'rosa' },
  { valor: 'eu consigo!', cor: 'roxo' },
  { valor: 'brilha ✨', cor: 'amarelo' },
  { valor: 'fofura', cor: 'rosa' },
]
export const FITAS = ['rosa', 'azul', 'verde', 'amarelo', 'lilas', 'listrada', 'xadrez', 'coracoes', 'bolinhas']

export function Adesivo({ a }) {
  if (a.tipo === 'selo') return <span className={`selo-adesivo cor-${a.cor}`}>{a.valor}</span>
  if (a.tipo === 'fita') return <span className={`fita-adesivo fita-${a.valor}`} aria-label="fita adesiva" />
  if (a.tipo === 'personagem') return <Personagem id={a.valor} />
  return <span className="emoji-adesivo">{a.valor}</span>
}

// Botão "adesivos" que abre a cartela. onEscolher recebe { tipo, valor, cor? }.
export function Cartela({ onEscolher, rotulo = '🌟 adesivos' }) {
  const [aberta, setAberta] = useState(false)
  const escolher = a => {
    onEscolher(a)
    setAberta(false)
  }
  return (
    <span className="cartela-wrap">
      <button className="ferramenta" onClick={() => setAberta(v => !v)} aria-expanded={aberta}>{rotulo}</button>
      {aberta && (
        <div className="cartela" role="dialog" aria-label="escolha um adesivo">
          <span className="cartela-titulo">turminha</span>
          <div className="cartela-turma">
            {PERSONAGENS.map(p => (
              <button key={p.id} className="cartela-item" onClick={() => escolher({ tipo: 'personagem', valor: p.id })} title={p.nome} aria-label={p.nome}>
                <Personagem id={p.id} />
              </button>
            ))}
          </div>
          <span className="cartela-titulo">emojis</span>
          <div className="cartela-grade">
            {EMOJIS.map(e => (
              <button key={e} className="cartela-item" onClick={() => escolher({ tipo: 'emoji', valor: e })} aria-label={`adesivo ${e}`}>{e}</button>
            ))}
          </div>
          <span className="cartela-titulo">selos e fitas</span>
          <div className="cartela-selos">
            {SELOS.map(s => (
              <button key={s.valor} className="cartela-item" onClick={() => escolher({ tipo: 'selo', ...s })}>
                <span className={`selo-adesivo cor-${s.cor}`}>{s.valor}</span>
              </button>
            ))}
          </div>
          <div className="cartela-fitas">
            {FITAS.map(f => (
              <button key={f} className="cartela-item" onClick={() => escolher({ tipo: 'fita', valor: f })} aria-label={`fita ${f}`}>
                <span className={`fita-adesivo fita-${f}`} />
              </button>
            ))}
          </div>
        </div>
      )}
    </span>
  )
}
