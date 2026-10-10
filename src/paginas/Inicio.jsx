import { EDITAVEL, moduloAtual, media, slug, CORES } from '../dados.js'
import { diaMes, diaSemana, hora, falta, quandoCurto, chaveDia } from '../datas.js'
import Campo from '../componentes/Campo.jsx'
import Calendario from '../componentes/Calendario.jsx'

export default function Inicio({ ctx }) {
  const { dados, eventos, mudarCaderno, salvarCurso } = ctx
  const agora = new Date()

  const pendentes = eventos.filter(e => e.curso && !e.feito && e.quando > agora)
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

  const novoCurso = () => {
    const nome = prompt('Nome do curso, matéria, livro ou trilha:')
    if (!nome?.trim()) return
    const id = slug(nome, dados.cursos.map(c => c.id))
    salvarCurso({
      id,
      nome: nome.trim(),
      codigo: '',
      emoji: '📘',
      cor: CORES[dados.cursos.length % CORES.length],
      onde: '',
      link: '',
      modulos: [{ n: 1, titulo: 'Módulo 1', resumo: [], chaves: [], anotacoes: '', feito: false }],
      prazos: [],
    })
    window.location.hash = `/curso/${id}`
  }

  return (
    <section className="pagina">
      <header className="capa">
        {EDITAVEL ? (
          <>
            <Campo className="titulo-mao titulo-capa" valor={dados.caderno.titulo} aria-label="título do caderno" onSalvar={v => mudarCaderno(c => { c.titulo = v })} />
            <Campo className="capa-sub" valor={dados.caderno.subtitulo} placeholder="uma frase sobre o que você está estudando" aria-label="subtítulo" onSalvar={v => mudarCaderno(c => { c.subtitulo = v })} />
          </>
        ) : (
          <>
            <h1 className="titulo-mao titulo-capa">{dados.caderno.titulo}</h1>
            {dados.caderno.subtitulo && <p className="capa-sub">{dados.caderno.subtitulo}</p>}
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
                <a href={e.href}>{e.curso.codigo || e.curso.nome} · {e.titulo}</a>
                {e.peso ? <span className="peso mono">{e.peso}%</span> : null}
              </li>
            ))}
          </ul>
        </div>
      )}

      <h2 className="sub-mao">Meus cursos</h2>
      <div className="capas">
        {dados.cursos.map(c => {
          const md = media(c)
          const atual = moduloAtual(c, agora)
          const feitos = (c.modulos || []).filter(m => m.feito).length
          const total = (c.modulos || []).length
          return (
            <a key={c.id} className={`capa-materia cor-${c.cor}`} href={`#/curso/${c.id}`}>
              <span className="lombada" aria-hidden="true" />
              <span className="capa-emoji" aria-hidden="true">{c.emoji}</span>
              {c.codigo && <span className="capa-codigo mono">{c.codigo}</span>}
              <strong className="capa-nome">{c.nome}</strong>
              {c.onde && <span className="capa-agora">{c.onde}</span>}
              <span className="capa-etiqueta">
                {md ? (
                  <>
                    <span className="titulo-mao">{md.media.toFixed(1)}</span>
                    <small>média no que já tem nota</small>
                  </>
                ) : (
                  <>
                    <span className="titulo-mao">{feitos}/{total}</span>
                    <small>módulos feitos</small>
                  </>
                )}
              </span>
              {atual && <span className="capa-agora">agora: <b>M{atual.n}</b> · {atual.titulo}</span>}
            </a>
          )
        })}
        {EDITAVEL && (
          <button className="capa-nova" onClick={novoCurso}>+ novo curso</button>
        )}
      </div>
      {!dados.cursos.length && !EDITAVEL && <p>Nenhum curso ainda.</p>}

      <h2 className="sub-mao">Próximos 14 dias</h2>
      <div className="folha">
        {porDia.length ? (
          <ul className="agenda">
            {porDia.map(evs => (
              <li key={chaveDia(evs[0].quando)} className="agenda-dia">
                <span className="agenda-quando">
                  {quandoCurto(evs[0].quando, agora)}
                  {['hoje', 'amanhã'].includes(quandoCurto(evs[0].quando, agora)) && <small>{diaMes(evs[0].quando)}</small>}
                </span>
                <ul className="agenda-itens">
                  {evs.map((e, i) => (
                    <li key={i} className={`cor-${e.cor}`}>
                      <span aria-hidden="true">{e.feito ? '✓' : e.icone}</span>
                      <a className={e.feito ? 'feito' : ''} href={e.href || e.link} target={e.href ? undefined : '_blank'} rel="noreferrer">
                        {e.curso && <b>{e.curso.codigo || e.curso.nome} · </b>}{e.titulo}
                      </a>
                      {!e.diaInteiro && <span className="mono peso">{hora(e.quando)}</span>}
                      {e.fonte && <span className="fonte">{e.fonte}</span>}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        ) : (
          <p className="dica">Nada marcado pros próximos 14 dias. {EDITAVEL && 'Adicione prazos na página de cada curso.'}</p>
        )}
      </div>

      <h2 className="sub-mao">Calendário</h2>
      <div className="folha">
        <Calendario eventos={eventos} cursos={dados.cursos} compacto />
      </div>
    </section>
  )
}
