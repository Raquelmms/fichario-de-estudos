import CamadaLivre from './CamadaLivre.jsx'

// Capa de uma matéria: cor + estampa + etiqueta + adesivos.
// Pequena no fichário, grande (e personalizável) na página da matéria.
export default function Capa({ m, grande = false, editavel = false, mudarCapa }) {
  const capa = m.capa || {}
  return (
    <CamadaLivre
      modo="capa"
      editavel={editavel}
      adesivos={capa.adesivos || []}
      mudar={fn => mudarCapa(c => { c.adesivos ||= []; fn(c) })}
      className={`capa cor-${m.cor} estampa-${capa.padrao || 'liso'} ${grande ? 'capa-grande' : ''}`}
    >
      <span className="capa-lombada" aria-hidden="true" />
      <span className="capa-emoji" aria-hidden="true">{m.emoji}</span>
      <div className="capa-etiqueta">
        <span className="etiqueta-linha"><small>matéria</small><strong>{m.nome}</strong></span>
        {(m.professor || grande) && <span className="etiqueta-linha"><small>prof.</small>{m.professor || '—'}</span>}
        {grande && <span className="etiqueta-linha"><small>aulas</small>{(m.aulas || []).length}</span>}
      </div>
    </CamadaLivre>
  )
}
