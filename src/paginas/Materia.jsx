import { useRef, useState } from 'react'
import { EDITAVEL, CORES, PADROES, TIPOS, media, novoId, novaAula, textoDe } from '../dados.js'
import { diaMes, diaSemanaCurto, hora, lerData } from '../datas.js'
import Campo from '../componentes/Campo.jsx'
import Capa from '../componentes/Capa.jsx'
import { Cartela } from '../componentes/Adesivos.jsx'
import SeletorEmoji from '../componentes/SeletorEmoji.jsx'
import EscolherGrupo from '../componentes/EscolherGrupo.jsx'

export default function Materia({ ctx, m }) {
  const { dados, mudarMateria, excluirMateria, arquivarMateria, desarquivarMateria } = ctx
  const [personalizando, setPersonalizando] = useState(false)
  const [arquivando, setArquivando] = useState(false)
  const mudar = fn => mudarMateria(m.id, fn)
  const mudarCapa = fn => mudar(x => { x.capa ||= { padrao: 'liso', adesivos: [] }; fn(x.capa) })
  const md = media(m)
  const aulas = [...(m.aulas || [])].sort((a, b) => (a.data || '').localeCompare(b.data || ''))
  const prazos = [...(m.prazos || [])].sort((a, b) => (a.data || '9').localeCompare(b.data || '9'))

  const criarAula = () => {
    const nova = novaAula((m.aulas || []).length + 1)
    mudar(x => { (x.aulas ||= []).push(nova) })
    window.location.hash = `/m/${m.id}/${nova.id}`
  }

  const colarAdesivo = a =>
    mudarCapa(c => {
      c.adesivos.push({ id: novoId(), ...a, x: 25 + Math.random() * 50, y: 20 + Math.random() * 30, r: Math.round(Math.random() * 30 - 15), s: 1 })
    })

  const excluir = () => {
    if (confirm(`Apagar "${m.nome}" com todas as aulas? (Se você usa git, dá pra recuperar pelo histórico.)`)) {
      excluirMateria(m.id)
      window.location.hash = '/'
    }
  }

  return (
    <section className="pagina">
      {m.arquivada && (
        <div className="faixa-arquivada">
          <span>📦 Arquivada em <b>{m.arquivada.grupo}</b></span>
          {EDITAVEL && (
            <span className="linha-acoes">
              <button className="link" onClick={() => setArquivando(true)}>mudar de grupo</button>
              <button className="btn-claro" onClick={() => desarquivarMateria(m.id)}>desarquivar</button>
            </span>
          )}
          <a href="#/arquivo">ver o arquivo</a>
        </div>
      )}
      {arquivando && (
        <div className="folha">
          <EscolherGrupo
            materias={dados.materias}
            inicial={m.arquivada?.grupo}
            rotulo={m.arquivada ? 'mudar' : '📦 arquivar'}
            onCancelar={() => setArquivando(false)}
            onEscolher={grupo => {
              arquivarMateria(m.id, grupo)
              setArquivando(false)
            }}
          />
        </div>
      )}
      <div className="materia-abertura">
        <div className="materia-capa">
          <Capa m={m} grande editavel={EDITAVEL && personalizando} mudarCapa={mudarCapa} />
          {EDITAVEL && (
            <button className="btn-claro" onClick={() => setPersonalizando(v => !v)}>
              {personalizando ? '✓ pronto' : '🎨 personalizar capa'}
            </button>
          )}
        </div>

        {personalizando ? (
          <div className="folha personalizar">
            <h2 className="sub-mao">Personalizar capa</h2>
            <label className="rotulo">nome da matéria<Campo valor={m.nome} onSalvar={v => mudar(x => { x.nome = v })} /></label>
            <div className="linha-acoes">
              <label className="rotulo" style={{ flex: '1 1 160px' }}>professor(a)<Campo valor={m.professor} onSalvar={v => mudar(x => { x.professor = v })} /></label>
              <span className="rotulo" style={{ flex: '0 0 auto' }}>
                emoji
                <br />
                <SeletorEmoji valor={m.emoji} onEscolher={v => mudar(x => { x.emoji = v })} />
              </span>
            </div>
            <span className="rotulo">cor</span>
            <div className="cores" role="group" aria-label="cor da capa">
              {CORES.map(cor => (
                <button key={cor} className={`cor-bolinha cor-${cor}`} aria-pressed={m.cor === cor} aria-label={cor} onClick={() => mudar(x => { x.cor = cor })} />
              ))}
              <CorLivre cor={m.cor} onEscolher={cor => mudar(x => { x.cor = cor })} />
            </div>
            <span className="rotulo">estampa</span>
            <div className="estampas" role="group" aria-label="estampa da capa">
              {PADROES.map(p => (
                <button
                  key={p}
                  className={`estampa-amostra cor-${m.cor} estampa-${p}`}
                  aria-pressed={(m.capa?.padrao || 'liso') === p}
                  onClick={() => mudarCapa(c => { c.padrao = p })}
                >
                  <span>{p}</span>
                </button>
              ))}
            </div>
            <span className="rotulo">adesivos</span>
            <p className="dica">Escolha um adesivo e arraste na capa. Clique nele pra girar, mudar o tamanho ou tirar.</p>
            <Cartela onEscolher={colarAdesivo} rotulo="🌟 colar adesivo" />
          </div>
        ) : (
          <div className="folha indice">
            <div className="linha-acoes" style={{ justifyContent: 'space-between' }}>
              <h2 className="sub-mao">Aulas</h2>
              {md && (
                <span className="post-it post-it-nota">
                  <span>média</span>
                  <strong className="titulo-mao">{md.media.toFixed(1)}</strong>
                </span>
              )}
            </div>
            {aulas.length ? (
              <ol className="lista-aulas">
                {aulas.map((a, i) => (
                  <li key={a.id}>
                    <a href={`#/m/${m.id}/${a.id}`}>
                      <span className="aula-num titulo-mao">{i + 1}</span>
                      <span className="aula-info">
                        <strong>{a.titulo}</strong>
                        <small>{textoDe(a.conteudo).slice(0, 90) || 'página em branco'}</small>
                      </span>
                      {a.data && <span className="mono aula-data">{diaMes(lerData(a.data))}</span>}
                    </a>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="dica">Nenhuma aula ainda.</p>
            )}
            {EDITAVEL && <button className="btn" onClick={criarAula}>+ nova aula</button>}
          </div>
        )}
      </div>

      <h2 className="sub-mao">Prazos</h2>
      {prazos.length > 0 ? (
        <div className="tabela-folha">
          <table className="tabela">
            <thead>
              <tr><th></th><th>o quê</th><th>quando</th><th>peso</th><th>nota</th>{EDITAVEL && <th></th>}</tr>
            </thead>
            <tbody>
              {prazos.map(p => (
                <LinhaPrazo
                  key={p.id}
                  p={p}
                  mudar={fn => mudar(x => { fn(x.prazos.find(q => q.id === p.id)) })}
                  apagar={() => mudar(x => { x.prazos = x.prazos.filter(q => q.id !== p.id) })}
                />
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="dica">Nenhum prazo ainda.</p>
      )}
      {EDITAVEL && (
        <div className="linha-acoes">
          <button
            className="btn-claro"
            onClick={() => mudar(x => { (x.prazos ||= []).push({ id: novoId(), titulo: 'Novo prazo', tipo: 'tarefa', data: new Date().toISOString().slice(0, 10), feito: false }) })}
          >
            + prazo
          </button>
          <span className="dica">Peso e nota são opcionais. Com eles, o fichário calcula a média ponderada.</span>
        </div>
      )}

      {EDITAVEL && (
        <p className="rodape-nota">
          Tudo desta matéria fica em <code>dados/{m._arquivo || `materias/${m.id}.json`}</code>.{' '}
          {!m.arquivada && (
            <>
              <button className="link" onClick={() => { setArquivando(true); window.scrollTo(0, 0) }}>📦 arquivar matéria</button>
              {' · '}
            </>
          )}
          <button className="btn-perigo" onClick={excluir}>apagar matéria</button>
        </p>
      )}
    </section>
  )
}

// Cor livre: guarda como "c-rrggbb" (o App cria a classe .cor-c-rrggbb com essa cor).
function CorLivre({ cor, onEscolher }) {
  const atual = /^c-[0-9a-f]{6}$/.test(cor) ? '#' + cor.slice(2) : '#ff7aa5'
  const timer = useRef(null)
  const escolher = hex => {
    clearTimeout(timer.current)
    timer.current = setTimeout(() => onEscolher('c-' + hex.slice(1).toLowerCase()), 300)
  }
  return (
    <label className={`cor-livre ${cor?.startsWith('c-') ? 'cor-livre-ativa' : ''}`} title="criar cor">
      <input type="color" defaultValue={atual} onChange={e => escolher(e.target.value)} aria-label="criar cor" />
      <span>🎨 criar cor</span>
    </label>
  )
}

function LinhaPrazo({ p, mudar, apagar }) {
  const quando = lerData(p.data)
  const marcar = (
    <input type="checkbox" className="check" checked={!!p.feito} disabled={!EDITAVEL} aria-label="feito" onChange={e => mudar(x => { x.feito = e.target.checked })} />
  )
  if (!EDITAVEL)
    return (
      <tr className={p.feito ? 'linha-feita' : ''}>
        <td>{marcar}</td>
        <td><span aria-hidden="true">{TIPOS[p.tipo] || TIPOS.outro}</span> <span className="titulo-prazo">{p.link ? <a href={p.link} target="_blank" rel="noreferrer">{p.titulo} ↗</a> : p.titulo}</span></td>
        <td className="mono">{quando ? `${diaSemanaCurto(quando)} ${diaMes(quando)}${p.data.length > 10 ? ' ' + hora(quando) : ''}` : '—'}</td>
        <td className="mono">{p.peso || '—'}</td>
        <td className="mono">{p.nota != null && p.nota !== '' ? <b>{p.nota}</b> : '—'}</td>
      </tr>
    )
  return (
    <tr className={p.feito ? 'linha-feita' : ''}>
      <td>{marcar}</td>
      <td style={{ minWidth: 240 }}>
        <div className="linha-acoes" style={{ flexWrap: 'nowrap' }}>
          <select className="campo" value={p.tipo || 'outro'} aria-label="tipo" onChange={e => mudar(x => { x.tipo = e.target.value })}>
            {Object.entries(TIPOS).map(([t, ic]) => <option key={t} value={t}>{ic} {t}</option>)}
          </select>
          <Campo className="titulo-prazo" valor={p.titulo} aria-label="título do prazo" onSalvar={v => mudar(x => { x.titulo = v })} />
        </div>
        <Campo className="campo-mono" style={{ fontSize: 12 }} valor={p.link} placeholder="link (opcional)" aria-label="link" onSalvar={v => mudar(x => { x.link = v })} />
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
