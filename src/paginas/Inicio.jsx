import { EDITAVEL, slug, novaMateria, ativas } from '../dados.js'
import { diaMes, diaSemana, hora, falta, quandoCurto, chaveDia } from '../datas.js'
import Campo from '../componentes/Campo.jsx'
import Capa from '../componentes/Capa.jsx'
import Calendario from '../componentes/Calendario.jsx'

export default function Inicio({ ctx }) {
  const { dados, eventos, mudarFichario, salvarMateria } = ctx
  const agora = new Date()

  const pendentes = eventos.filter(e => e.prazo && !e.feito && e.quando > agora)
  const proximo = pendentes[0]?.quando
  const doProximo = pendentes.filter(e => +e.quando === +proximo)

  const daqui14 = new Date(agora.getTime() + 14 * 864e5)
  const proximos = eventos.filter(e => chaveDia(e.quando) >= chaveDia(agora) && e.quando <= daqui14)
  const porDia = Object.values(
    proximos.reduce((m, e) => {
      ;(m[chaveDia(e.quando)] ||= []).push(e)
      return m
    }, {}),
  )

  const criar = () => {
    const nome = prompt('Nome da matéria:')
    if (!nome?.trim()) return
    const id = slug(nome, dados.materias.map(m => m.id))
    salvarMateria(novaMateria(nome.trim(), id, ativas(dados.materias).length))
    window.location.hash = `/m/${id}`
  }

  return (
    <section className="pagina">
      <header className="capa-fichario">
        {EDITAVEL ? (
          <>
            <Campo className="titulo-mao titulo-capa" valor={dados.fichario.titulo} aria-label="nome do fichário" onSalvar={v => mudarFichario(f => { f.titulo = v })} />
            <Campo className="capa-sub" valor={dados.fichario.subtitulo} placeholder="semestre, curso, uma frase…" aria-label="subtítulo" onSalvar={v => mudarFichario(f => { f.subtitulo = v })} />
          </>
        ) : (
          <>
            <h1 className="titulo-mao titulo-capa">{dados.fichario.titulo}</h1>
            {dados.fichario.subtitulo && <p className="capa-sub">{dados.fichario.subtitulo}</p>}
          </>
        )}
      </header>

      {proximo && (
        <div className="prazo-card">
          <div className="fita" aria-hidden="true" />
          <div className="prazo-quando">
            <span className="sub-mao">próximo prazo</span>
            <strong className="titulo-mao prazo-falta">faltam {falta(proximo, agora)}</strong>
            <span>{diaSemana(proximo)}, {diaMes(proximo)} às {hora(proximo)}</span>
          </div>
          <ul className="prazo-lista">
            {doProximo.map((e, i) => (
              <li key={i} className={`cor-${e.cor}`}>
                <span className="bolinha" />
                <a href={e.href}>{e.materia.nome} · {e.titulo}</a>
                {e.peso ? <span className="peso mono">{e.peso}%</span> : null}
              </li>
            ))}
          </ul>
        </div>
      )}

      <h2 className="sub-mao">Minhas matérias</h2>
      <div className="capas">
        {ativas(dados.materias).map(m => (
          <a key={m.id} href={`#/m/${m.id}`} className="capa-link" aria-label={`abrir ${m.nome}`}>
            <Capa m={m} />
          </a>
        ))}
        {EDITAVEL && <button className="capa-nova" onClick={criar}>+ nova matéria</button>}
      </div>
      {!ativas(dados.materias).length && !EDITAVEL && <p>Nenhuma matéria ainda.</p>}
      {dados.materias.some(m => m.arquivada) && (
        <p className="dica"><a href="#/arquivo">📦 ver o arquivo ({dados.materias.filter(m => m.arquivada).length} matérias guardadas)</a></p>
      )}

      <h2 className="sub-mao">Próximos 14 dias</h2>
      <div className="folha">
        {porDia.length ? (
          <ul className="agenda">
            {porDia.map(evs => {
              const q = quandoCurto(evs[0].quando, agora)
              return (
                <li key={chaveDia(evs[0].quando)} className="agenda-dia">
                  <span className="agenda-quando">
                    {q}
                    {['hoje', 'amanhã'].includes(q) && <small>{diaMes(evs[0].quando)}</small>}
                  </span>
                  <ul className="agenda-itens">
                    {evs.map((e, i) => (
                      <li key={i} className={`cor-${e.cor}`}>
                        <span aria-hidden="true">{e.feito ? '✓' : e.icone}</span>
                        <a className={e.feito ? 'feito' : ''} href={e.href || e.link} target={e.href ? undefined : '_blank'} rel="noreferrer">
                          {e.materia && <b>{e.materia.nome} · </b>}{e.titulo}
                        </a>
                        {!e.diaInteiro && <span className="mono peso">{hora(e.quando)}</span>}
                        {e.fonte && <span className="fonte">{e.fonte}</span>}
                      </li>
                    ))}
                  </ul>
                </li>
              )
            })}
          </ul>
        ) : (
          <p className="dica">Nada marcado pros próximos 14 dias.</p>
        )}
      </div>

      <h2 className="sub-mao">Calendário</h2>
      <div className="folha">
        <Calendario eventos={eventos} materias={ativas(dados.materias)} compacto />
      </div>
    </section>
  )
}
