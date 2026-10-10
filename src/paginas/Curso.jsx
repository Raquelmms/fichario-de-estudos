import { EDITAVEL, CORES, TIPOS, media, moduloAtual, novoId } from '../dados.js'
import { diaMes, diaSemanaCurto, hora, lerData } from '../datas.js'
import Campo from '../componentes/Campo.jsx'

export default function Curso({ ctx, curso: c }) {
  const { mudarCurso, excluirCurso } = ctx
  const mudar = fn => mudarCurso(c.id, fn)
  const md = media(c)
  const atual = moduloAtual(c)
  const prazos = [...(c.prazos || [])].sort((a, b) => (a.data || '9').localeCompare(b.data || '9'))

  const novoModulo = () =>
    mudar(x => {
      const n = x.modulos.length + 1
      x.modulos.push({ n, titulo: `Módulo ${n}`, resumo: [], chaves: [], anotacoes: '', feito: false })
    })

  const novoPrazo = () =>
    mudar(x => {
      x.prazos ||= []
      x.prazos.push({ id: novoId(), titulo: 'Novo prazo', tipo: 'tarefa', data: new Date().toISOString().slice(0, 10), modulo: atual?.n ?? null, feito: false })
    })

  const mudarPrazo = (id, fn) => mudar(x => { fn(x.prazos.find(p => p.id === id)) })

  const excluir = () => {
    if (confirm(`Apagar "${c.nome}" e as leituras dele? (Se você usa git, dá pra recuperar pelo histórico.)`)) {
      excluirCurso(c.id)
      window.location.hash = '/'
    }
  }

  return (
    <section className="pagina">
      <header className={`materia-topo cor-${c.cor}`}>
        <span className="lombada" aria-hidden="true" />
        {EDITAVEL ? (
          <div className="topo-info">
            <div className="topo-linha">
              <Campo className="campo-emoji" valor={c.emoji} aria-label="emoji" onSalvar={v => mudar(x => { x.emoji = v })} />
              <Campo className="campo-mono" style={{ maxWidth: '12ch' }} valor={c.codigo} placeholder="código" aria-label="código ou sigla" onSalvar={v => mudar(x => { x.codigo = v })} />
              <span className="cores" role="group" aria-label="cor">
                {CORES.map(cor => (
                  <button key={cor} className={`cor-bolinha cor-${cor}`} aria-pressed={c.cor === cor} aria-label={cor} onClick={() => mudar(x => { x.cor = cor })} />
                ))}
              </span>
            </div>
            <Campo className="titulo-mao" valor={c.nome} aria-label="nome do curso" onSalvar={v => mudar(x => { x.nome = v })} />
            <div className="topo-linha">
              <label>onde: <Campo valor={c.onde} placeholder="faculdade, Alura, livro…" onSalvar={v => mudar(x => { x.onde = v })} /></label>
              <label>link: <Campo valor={c.link} placeholder="https://" onSalvar={v => mudar(x => { x.link = v })} /></label>
            </div>
          </div>
        ) : (
          <div className="topo-info">
            <p className="mono eyebrow">{[c.codigo, c.onde].filter(Boolean).join(' · ')}</p>
            <h1 className="titulo-mao">{c.emoji} {c.nome}</h1>
            {c.link && <a href={c.link} target="_blank" rel="noreferrer">abrir o curso ↗</a>}
          </div>
        )}
        {md && (
          <aside className="post-it post-it-nota">
            <span>média até agora</span>
            <strong className="titulo-mao">{md.media.toFixed(1)}</strong>
            <small>{md.pesoAvaliado} de {md.pesoTotal} de peso já com nota</small>
          </aside>
        )}
      </header>

      <h2 className="sub-mao">Módulos</h2>
      <div className="unidades">
        {c.modulos.map(m => {
          const estado = m.feito ? 'passada' : atual?.n === m.n ? 'atual' : 'futura'
          return (
            <a key={m.n} className={`unidade-card un-${estado} cor-${c.cor}`} href={`#/curso/${c.id}/${m.n}`}>
              <span className="un-num titulo-mao">{m.n}</span>
              {m.inicio && m.fim && <span className="un-datas mono">{diaMes(lerData(m.inicio))} – {diaMes(lerData(m.fim))}</span>}
              <strong>{m.titulo}</strong>
              <span className="un-status">{m.feito ? '✓ feito' : estado === 'atual' ? '★ você está aqui' : ''}</span>
            </a>
          )
        })}
        {EDITAVEL && <button className="unidade-nova" onClick={novoModulo}>+ módulo</button>}
      </div>

      <h2 className="sub-mao">Prazos</h2>
      {prazos.length > 0 ? (
        <div className="tabela-folha">
          <table className="tabela">
            <thead>
              <tr><th></th><th>o quê</th><th>módulo</th><th>quando</th><th>peso</th><th>nota</th>{EDITAVEL && <th></th>}</tr>
            </thead>
            <tbody>
              {prazos.map(p => (
                <LinhaPrazo key={p.id} p={p} c={c} mudar={fn => mudarPrazo(p.id, fn)} apagar={() => mudar(x => { x.prazos = x.prazos.filter(q => q.id !== p.id) })} />
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="dica">Nenhum prazo ainda.</p>
      )}
      {EDITAVEL && (
        <div className="linha-acoes">
          <button className="btn-claro" onClick={novoPrazo}>+ prazo</button>
          <span className="dica">Peso e nota são opcionais: se tiver, o caderno calcula a média ponderada.</span>
        </div>
      )}

      {EDITAVEL && (
        <p className="rodape-nota">
          Tudo deste curso fica em <code>dados/{c._arquivo || `cursos/${c.id}.json`}</code>.{' '}
          <button className="btn-perigo" onClick={excluir}>apagar curso</button>
        </p>
      )}
    </section>
  )
}

function LinhaPrazo({ p, c, mudar, apagar }) {
  const quando = lerData(p.data)
  const marcar = (
    <input type="checkbox" className="check" checked={!!p.feito} disabled={!EDITAVEL} aria-label="feito" onChange={e => mudar(x => { x.feito = e.target.checked })} />
  )
  if (!EDITAVEL)
    return (
      <tr className={p.feito ? 'linha-feita' : ''}>
        <td>{marcar}</td>
        <td><span aria-hidden="true">{TIPOS[p.tipo] || TIPOS.outro}</span> <span className="titulo-prazo">{p.link ? <a href={p.link} target="_blank" rel="noreferrer">{p.titulo} ↗</a> : p.titulo}</span></td>
        <td>{p.modulo ? <a href={`#/curso/${c.id}/${p.modulo}`}>M{p.modulo}</a> : '—'}</td>
        <td className="mono">{quando ? `${diaSemanaCurto(quando)} ${diaMes(quando)}${p.data.length > 10 ? ' ' + hora(quando) : ''}` : '—'}</td>
        <td className="mono">{p.peso ? `${p.peso}` : '—'}</td>
        <td className="mono">{p.nota != null && p.nota !== '' ? <b>{p.nota}</b> : '—'}</td>
      </tr>
    )
  return (
    <tr className={p.feito ? 'linha-feita' : ''}>
      <td>{marcar}</td>
      <td style={{ minWidth: 220 }}>
        <div className="linha-acoes" style={{ flexWrap: 'nowrap' }}>
          <select className="campo" style={{ width: 'auto' }} value={p.tipo || 'outro'} aria-label="tipo" onChange={e => mudar(x => { x.tipo = e.target.value })}>
            {Object.entries(TIPOS).map(([t, ic]) => <option key={t} value={t}>{ic} {t}</option>)}
          </select>
          <Campo className="titulo-prazo" valor={p.titulo} aria-label="título do prazo" onSalvar={v => mudar(x => { x.titulo = v })} />
        </div>
        <Campo className="campo-mono" style={{ fontSize: 12 }} valor={p.link} placeholder="link (opcional)" aria-label="link" onSalvar={v => mudar(x => { x.link = v })} />
      </td>
      <td>
        <select className="campo" value={p.modulo ?? ''} aria-label="módulo" onChange={e => mudar(x => { x.modulo = e.target.value ? +e.target.value : null })}>
          <option value="">—</option>
          {c.modulos.map(m => <option key={m.n} value={m.n}>M{m.n}</option>)}
        </select>
      </td>
      <td>
        <Campo className="campo-data" tipo="datetime-local" valor={p.data && p.data.length === 10 ? p.data + 'T23:59' : p.data} aria-label="data e hora" onSalvar={v => mudar(x => { x.data = v })} />
      </td>
      <td><Campo className="campo-curto mono" tipo="number" valor={p.peso} aria-label="peso" onSalvar={v => mudar(x => { x.peso = v })} /></td>
      <td><Campo className="campo-curto mono" tipo="number" valor={p.nota} aria-label="nota" onSalvar={v => mudar(x => { x.nota = v })} /></td>
      <td className="acoes"><button className="btn-perigo" onClick={apagar} aria-label="apagar prazo">apagar</button></td>
    </tr>
  )
}
