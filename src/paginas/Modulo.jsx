import { useState } from 'react'
import { EDITAVEL, TIPOS, leituraDe, moduloAtual, novoId } from '../dados.js'
import { diaMes, diaSemanaCurto, hora, lerData } from '../datas.js'
import Campo from '../componentes/Campo.jsx'
import Markdown, { marcarItem } from '../componentes/Markdown.jsx'
import Texto from '../componentes/Texto.jsx'

export default function Modulo({ ctx, curso: c, n }) {
  const { dados, mudarCurso } = ctx
  const m = c.modulos.find(x => x.n === n)
  const [editandoNotas, setEditandoNotas] = useState(false)
  const [editandoResumo, setEditandoResumo] = useState(false)
  if (!m) return <p>Esse módulo não existe. <a href={`#/curso/${c.id}`}>Voltar pro curso</a></p>

  const mudar = fn => mudarCurso(c.id, x => { fn(x.modulos.find(y => y.n === n), x) })
  const prazos = (c.prazos || []).filter(p => p.modulo === n).sort((a, b) => (a.data || '').localeCompare(b.data || ''))
  const leitura = leituraDe(dados, c.id, n)
  const ehAtual = moduloAtual(c)?.n === n
  const ultimo = n === c.modulos.length
  const ant = c.modulos.find(x => x.n === n - 1)
  const prox = c.modulos.find(x => x.n === n + 1)

  const removerModulo = () => {
    if (!confirm(`Apagar o módulo ${n} (resumo e anotações)? Os prazos dele ficam no curso, sem módulo.`)) return
    mudarCurso(c.id, x => {
      x.modulos = x.modulos.filter(y => y.n !== n)
      x.prazos?.forEach(p => { if (p.modulo === n) p.modulo = null })
    })
    window.location.hash = `/curso/${c.id}`
  }

  return (
    <section className="pagina">
      <a className="voltar" href={`#/curso/${c.id}`}>← {c.emoji} {c.nome}</a>
      <header className={`unidade-topo cor-${c.cor}`}>
        <div className="fita" aria-hidden="true" />
        <p className="mono eyebrow">
          {c.codigo || c.nome} · Módulo {n}
          {!EDITAVEL && m.inicio && m.fim && ` · ${diaSemanaCurto(lerData(m.inicio))} ${diaMes(lerData(m.inicio))} → ${diaSemanaCurto(lerData(m.fim))} ${diaMes(lerData(m.fim))}`}
          {ehAtual && <span className="aqui"> ★ você está aqui</span>}
        </p>
        {EDITAVEL ? (
          <>
            <Campo className="titulo-mao" valor={m.titulo} aria-label="título do módulo" onSalvar={v => mudar(y => { y.titulo = v })} />
            <div className="topo-linha" style={{ marginTop: 10 }}>
              <label>de <Campo className="campo-data" tipo="date" valor={m.inicio} onSalvar={v => mudar(y => { y.inicio = v || undefined })} /></label>
              <label>até <Campo className="campo-data" tipo="date" valor={m.fim} onSalvar={v => mudar(y => { y.fim = v || undefined })} /></label>
              <label>
                <input type="checkbox" className="check" checked={!!m.feito} onChange={e => mudar(y => { y.feito = e.target.checked })} /> módulo concluído
              </label>
            </div>
          </>
        ) : (
          <h1 className="titulo-mao">{m.titulo} {m.feito && <span className="ok-mao">feito!</span>}</h1>
        )}
      </header>

      {leitura && (
        <a className={`botao-leitura cor-${c.cor}`} href={`#/curso/${c.id}/${n}/leitura`}>
          <span className="bl-icone" aria-hidden="true">📖</span>
          <span>
            <span className="mono bl-cod">M{n}{leitura.minutos && ` · ~${leitura.minutos} min`}</span>
            <strong>{leitura.titulo}</strong>
            <span className="bl-cta titulo-mao">ler a leitura grifada →</span>
          </span>
        </a>
      )}

      <div className="duas-colunas">
        <div className="folha">
          <div className="linha-acoes" style={{ justifyContent: 'space-between' }}>
            <h2 className="sub-mao">Resumo</h2>
            {EDITAVEL && <button className="btn-claro" onClick={() => setEditandoResumo(v => !v)}>{editandoResumo ? 'pronto' : 'editar'}</button>}
          </div>
          {editandoResumo ? (
            <>
              <Campo
                multilinha
                autoFocus
                valor={(m.resumo || []).join('\n')}
                placeholder="Uma ideia por linha. Dá pra usar **negrito** e `código`."
                aria-label="resumo, uma ideia por linha"
                onSalvar={v => mudar(y => { y.resumo = v.split('\n').map(s => s.trim()).filter(Boolean) })}
              />
              <label className="dica" style={{ display: 'block', marginTop: 10 }}>
                palavras-chave (separadas por vírgula)
                <Campo valor={(m.chaves || []).join(', ')} onSalvar={v => mudar(y => { y.chaves = v.split(',').map(s => s.trim()).filter(Boolean) })} />
              </label>
            </>
          ) : m.resumo?.length ? (
            <ul className="resumo">{m.resumo.map((r, i) => <li key={i}><Texto>{r}</Texto></li>)}</ul>
          ) : (
            <p className="dica">{EDITAVEL ? 'Sem resumo ainda. Clique em "editar".' : 'Sem resumo ainda.'}</p>
          )}
          {!editandoResumo && m.chaves?.length > 0 && (
            <div className="chaves">{m.chaves.map(k => <span key={k} className="chave">{k}</span>)}</div>
          )}
        </div>

        <div className="folha">
          <h2 className="sub-mao">Prazos deste módulo</h2>
          {prazos.length ? (
            <ul className="entregas">
              {prazos.map(p => {
                const q = lerData(p.data)
                return (
                  <li key={p.id} className={p.feito ? 'feito' : ''}>
                    <span className="ent-tipo" aria-hidden="true">{TIPOS[p.tipo] || TIPOS.outro}</span>
                    <span>
                      <label style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
                        <input type="checkbox" className="check" checked={!!p.feito} disabled={!EDITAVEL} onChange={e => mudarCurso(c.id, x => { x.prazos.find(y => y.id === p.id).feito = e.target.checked })} />
                        {p.link ? <a href={p.link} target="_blank" rel="noreferrer">{p.titulo} ↗</a> : p.titulo}
                      </label>
                    </span>
                    <span className="ent-meta mono">
                      {q && `${diaSemanaCurto(q)} ${diaMes(q)} ${hora(q)}`}{p.peso ? ` · peso ${p.peso}` : ''}
                    </span>
                    {p.nota != null && p.nota !== '' && <span className="ok-mao">{p.nota}</span>}
                  </li>
                )
              })}
            </ul>
          ) : (
            <p className="dica">Nenhum prazo neste módulo.</p>
          )}
          {EDITAVEL && (
            <button
              className="btn-claro"
              onClick={() => mudarCurso(c.id, x => {
                x.prazos ||= []
                x.prazos.push({ id: novoId(), titulo: 'Novo prazo', tipo: 'tarefa', data: m.fim || new Date().toISOString().slice(0, 10), modulo: n, feito: false })
              })}
            >
              + prazo
            </button>
          )}
          {EDITAVEL && <p className="dica">Pra mudar data, peso ou nota, use a tabela na <a href={`#/curso/${c.id}`}>página do curso</a>.</p>}
        </div>
      </div>

      <div className="folha">
        <div className="linha-acoes" style={{ justifyContent: 'space-between' }}>
          <h2 className="sub-mao">Anotações</h2>
          {EDITAVEL && (
            <button className="btn-claro" onClick={() => setEditandoNotas(v => !v)}>{editandoNotas ? 'ver como fica' : 'editar'}</button>
          )}
        </div>
        {editandoNotas ? (
          <>
            <Campo
              multilinha
              autoFocus
              style={{ minHeight: 260 }}
              className="campo-mono"
              valor={m.anotacoes}
              placeholder={'Escreva em Markdown.\n\n# títulos\n- listas\n- [ ] tarefas que viram caixinhas\n`código` e **negrito**'}
              aria-label="anotações em markdown"
              onSalvar={v => mudar(y => { y.anotacoes = v })}
            />
            <p className="dica">Salva quando você clica fora da caixa.</p>
          </>
        ) : m.anotacoes ? (
          <Markdown texto={m.anotacoes} onMarcar={EDITAVEL ? (i, v) => mudar(y => { y.anotacoes = marcarItem(y.anotacoes, i, v) }) : null} />
        ) : (
          <p className="dica">{EDITAVEL ? 'Nada anotado ainda. Clique em "editar".' : 'Nada anotado ainda.'}</p>
        )}
      </div>

      <nav className="vizinhos">
        {ant ? <a href={`#/curso/${c.id}/${ant.n}`}>← M{ant.n} · {ant.titulo}</a> : <span />}
        {prox ? <a href={`#/curso/${c.id}/${prox.n}`}>M{prox.n} · {prox.titulo} →</a> : <span />}
      </nav>

      {EDITAVEL && ultimo && c.modulos.length > 1 && (
        <p className="rodape-nota"><button className="btn-perigo" onClick={removerModulo}>apagar este módulo</button></p>
      )}
    </section>
  )
}
