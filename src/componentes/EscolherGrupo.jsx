import { useState } from 'react'
import { gruposDoArquivo, grupoSugerido } from '../dados.js'

// "Arquivar em qual grupo?": digita um nome novo ou clica num grupo que já existe.
export default function EscolherGrupo({ materias, inicial = '', rotulo = '📦 arquivar', onEscolher, onCancelar }) {
  const existentes = gruposDoArquivo(materias).map(g => g.grupo)
  const [grupo, setGrupo] = useState(inicial || existentes[0] || grupoSugerido())
  const ok = grupo.trim()
  return (
    <form
      className="escolher-grupo"
      onSubmit={e => {
        e.preventDefault()
        if (ok) onEscolher(ok)
      }}
    >
      <label className="rotulo">
        em qual grupo?
        <input className="campo" value={grupo} onChange={e => setGrupo(e.target.value)} autoFocus placeholder="ex.: 2026 · 1º semestre, Termo 3, Inglês…" />
      </label>
      {existentes.length > 0 && (
        <div className="chips-grupo">
          {existentes.map(g => (
            <button type="button" key={g} className={`chip-grupo ${g === grupo ? 'chip-on' : ''}`} onClick={() => setGrupo(g)}>{g}</button>
          ))}
        </div>
      )}
      <p className="dica">Pode ser semestre, ano, termo, curso… do jeito que fizer sentido pra você.</p>
      <div className="linha-acoes">
        <button className="btn" type="submit" disabled={!ok}>{rotulo}</button>
        <button className="btn-claro" type="button" onClick={onCancelar}>cancelar</button>
      </div>
    </form>
  )
}
