import { useState } from 'react'
import { EDITAVEL, gruposDoArquivo } from '../dados.js'
import Capa from '../componentes/Capa.jsx'

// Estantes das matérias arquivadas, uma por grupo (semestre, termo, ano…).
export default function Arquivo({ ctx }) {
  const { dados, renomearGrupo, desarquivarMateria } = ctx
  const grupos = gruposDoArquivo(dados.materias)
  const [renomeando, setRenomeando] = useState(null)

  return (
    <section className="pagina">
      <header>
        <h1 className="titulo-mao">📦 Arquivo</h1>
        <p className="dica">
          Matérias que já terminaram, guardadas com todo o material. Elas saem das abas, do início e do calendário, mas
          continuam abrindo e dá pra editar normalmente.
        </p>
      </header>

      {!grupos.length && (
        <div className="folha">
          <p>Nada arquivado ainda. Pra arquivar, abra uma matéria e use <b>📦 arquivar matéria</b> no fim da página.</p>
        </div>
      )}

      {grupos.map(({ grupo, materias }) => (
        <div key={grupo} className="estante">
          <div className="linha-acoes estante-topo">
            {renomeando === grupo ? (
              <form
                className="linha-acoes"
                onSubmit={e => {
                  e.preventDefault()
                  const novo = new FormData(e.currentTarget).get('nome').trim()
                  if (novo && novo !== grupo) renomearGrupo(grupo, novo)
                  setRenomeando(null)
                }}
              >
                <input name="nome" className="campo titulo-grupo" defaultValue={grupo} autoFocus aria-label="novo nome do grupo" />
                <button className="btn" type="submit">ok</button>
                <button className="btn-claro" type="button" onClick={() => setRenomeando(null)}>cancelar</button>
              </form>
            ) : (
              <>
                <h2 className="sub-mao titulo-grupo">{grupo}</h2>
                <span className="dica">{materias.length} {materias.length === 1 ? 'matéria' : 'matérias'}</span>
                {EDITAVEL && <button className="link" onClick={() => setRenomeando(grupo)}>renomear</button>}
              </>
            )}
          </div>
          <div className="capas estante-capas">
            {materias.map(m => (
              <div key={m.id} className="estante-item">
                <a href={`#/m/${m.id}`} className="capa-link" aria-label={`abrir ${m.nome}`}>
                  <Capa m={m} />
                </a>
                <span className="dica">
                  {(m.aulas || []).length} aulas
                  {EDITAVEL && (
                    <>
                      {' · '}
                      <button className="link" onClick={() => desarquivarMateria(m.id)}>desarquivar</button>
                    </>
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </section>
  )
}
