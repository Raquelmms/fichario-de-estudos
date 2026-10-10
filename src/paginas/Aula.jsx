import { useRef, useState } from 'react'
import { EDITAVEL, novoId } from '../dados.js'
import { diaMes, diaSemana, lerData } from '../datas.js'
import { CORES_POSTIT } from '../grifos.js'
import Campo from '../componentes/Campo.jsx'
import Editor from '../componentes/Editor.jsx'
import CamadaLivre from '../componentes/CamadaLivre.jsx'
import { Cartela } from '../componentes/Adesivos.jsx'

export default function Aula({ ctx, m, aulaId }) {
  const { mudarAula, mudarMateria, ia } = ctx
  const papel = useRef(null)
  const [painel, setPainel] = useState(false)
  const aulas = [...(m.aulas || [])].sort((a, b) => (a.data || '').localeCompare(b.data || ''))
  const i = aulas.findIndex(a => a.id === aulaId)
  const a = aulas[i]
  if (!a) return <p>Essa aula não existe. <a href={`#/m/${m.id}`}>Voltar pra matéria</a></p>

  const mudar = fn => mudarAula(m.id, a.id, fn)
  const ant = aulas[i - 1]
  const prox = aulas[i + 1]

  // Onde cai um post-it/adesivo novo: na margem direita, na altura que você está vendo.
  const alturaVisivel = () => {
    const r = papel.current?.getBoundingClientRect()
    if (!r) return 40
    return Math.round(Math.min(Math.max(window.innerHeight / 3 - r.top, 20), Math.max(20, r.height - 160)))
  }
  const novoPostit = cor =>
    mudar(x => { (x.postits ||= []).push({ id: novoId(), cor, texto: '', x: 77, y: alturaVisivel(), r: Math.round(Math.random() * 6 - 3) }) })
  const novoAdesivo = ad =>
    mudar(x => { (x.adesivos ||= []).push({ id: novoId(), ...ad, x: 60 + Math.random() * 25, y: alturaVisivel(), r: Math.round(Math.random() * 30 - 15), s: 1 }) })

  const apagar = () => {
    if (!confirm(`Apagar a aula "${a.titulo}"?`)) return
    mudarMateria(m.id, x => { x.aulas = x.aulas.filter(y => y.id !== a.id) })
    window.location.hash = `/m/${m.id}`
  }

  const ferramentas = (
    <>
      <span className="grupo-nome">post-it</span>
      {CORES_POSTIT.map(c => (
        <button key={c} className={`bolinha-postit postit-${c}`} onClick={() => novoPostit(c)} aria-label={`novo post-it ${c}`} title={`post-it ${c}`} />
      ))}
      <Cartela onEscolher={novoAdesivo} />
      <button className={`ferramenta ferramenta-ia ${painel ? 'ativa' : ''}`} onClick={() => setPainel(v => !v)}>✨ resumir material</button>
    </>
  )

  return (
    <section className="pagina">
      <a className="voltar" href={`#/m/${m.id}`}>← {m.emoji} {m.nome}</a>
      <header className={`aula-topo cor-${m.cor}`}>
        <p className="mono eyebrow">
          {m.nome} · aula {i + 1}
          {!EDITAVEL && a.data && ` · ${diaSemana(lerData(a.data))}, ${diaMes(lerData(a.data))}`}
        </p>
        {EDITAVEL ? (
          <div className="linha-acoes">
            <Campo className="titulo-mao" style={{ flex: '1 1 280px' }} valor={a.titulo} aria-label="título da aula" onSalvar={v => mudar(x => { x.titulo = v })} />
            <Campo className="campo-data" tipo="date" valor={a.data} aria-label="data da aula" onSalvar={v => mudar(x => { x.data = v })} />
          </div>
        ) : (
          <h1 className="titulo-mao">{a.titulo}</h1>
        )}
      </header>

      {EDITAVEL && painel && <PainelResumo m={m} a={a} mudar={mudar} ia={ia} fechar={() => setPainel(false)} />}

      <Editor
        key={a.id}
        html={a.conteudo}
        editavel={EDITAVEL}
        placeholder="Escreva sua aula aqui… ou cole o material em ✨ resumir material."
        onSalvar={html => mudar(x => { x.conteudo = html })}
        extras={ferramentas}
        envolver={texto => (
          <CamadaLivre
            refContainer={papel}
            postits={a.postits}
            adesivos={a.adesivos}
            editavel={EDITAVEL}
            mudar={fn => mudar(x => { x.postits ||= []; x.adesivos ||= []; fn(x) })}
            className={`papel cor-${m.cor}`}
          >
            {texto}
          </CamadaLivre>
        )}
      />

      {(a.teste?.length > 0 || EDITAVEL) && <Teste a={a} mudar={mudar} />}

      <nav className="vizinhos">
        {ant ? <a href={`#/m/${m.id}/${ant.id}`}>← {ant.titulo}</a> : <span />}
        {prox ? <a href={`#/m/${m.id}/${prox.id}`}>{prox.titulo} →</a> : <span />}
      </nav>
      {EDITAVEL && <p className="rodape-nota"><button className="btn-perigo" onClick={apagar}>apagar esta aula</button></p>}
    </section>
  )
}

function PainelResumo({ m, a, mudar, ia, fechar }) {
  const [material, setMaterial] = useState(a.material || '')
  const [estado, setEstado] = useState(null) // null · 'resumindo' · { erro }

  const guardar = () => material !== (a.material || '') && mudar(x => { x.material = material })

  const resumir = async () => {
    guardar()
    setEstado('resumindo')
    try {
      const r = await fetch('/api/resumir', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ material, materia: m.nome, aula: a.titulo }),
      })
      const j = await r.json()
      if (!r.ok) throw new Error(j.erro)
      const temTexto = !!a.conteudo?.replace(/<[^>]+>/g, '').trim()
      const substituir = !temTexto || confirm('Substituir o que já está na página pelo resumo?\n\nOK = substituir · Cancelar = colocar o resumo no fim')
      mudar(x => {
        x.material = material
        x.conteudo = substituir ? j.html : `${x.conteudo}<hr>${j.html}`
        if (/^Aula \d+$/.test(x.titulo) && j.titulo) x.titulo = j.titulo
        x.postits = [...(substituir ? [] : x.postits || []), ...j.postits.map((p, k) => ({ id: novoId(), ...p, x: 77, y: 30 + k * 190, r: k % 2 ? -2 : 2 }))]
        x.teste = j.teste
      })
      setEstado(null)
      fechar()
    } catch (e) {
      setEstado({ erro: e.message })
    }
  }

  return (
    <div className="folha painel-resumo">
      <div className="linha-acoes" style={{ justifyContent: 'space-between' }}>
        <h2 className="sub-mao">✨ Resumir material</h2>
        <button className="btn-claro" onClick={fechar}>fechar</button>
      </div>
      <p className="dica">Cole aqui o texto da aula: trecho do livro, slides, transcrição do vídeo, suas anotações soltas. Fica guardado na aula.</p>
      <textarea
        className="campo material"
        value={material}
        onChange={e => setMaterial(e.target.value)}
        onBlur={guardar}
        placeholder="Cole o material aqui…"
        aria-label="material da aula"
      />
      {ia.ativo ? (
        <div className="linha-acoes">
          <button className="btn" onClick={resumir} disabled={!material.trim() || estado === 'resumindo'}>
            {estado === 'resumindo' ? 'resumindo… (pode levar um minutinho)' : '✨ resumir com IA'}
          </button>
          <span className="dica">Usa o Claude ({ia.modelo}). Grifa com a legenda das cores, cria post-its e um teste rápido.</span>
        </div>
      ) : (
        <div className="sem-ia">
          <p><b>Duas formas de resumir:</b></p>
          <ol>
            <li>No <b>Claude Code</b>, dentro da pasta do fichário: <code>/resumir {m.id} {a.titulo}</code>. Ele lê o material guardado aqui e escreve o resumo na página.</li>
            <li>Ou ligue o botão: coloque <code>ANTHROPIC_API_KEY=…</code> no <code>.env.local</code> e reinicie o <code>npm run dev</code>.</li>
          </ol>
          <p className="dica">Ou escreva você mesma. A página é toda editável. 😉</p>
        </div>
      )}
      {estado?.erro && <p className="erro">⚠ {estado.erro}</p>}
    </div>
  )
}

function Teste({ a, mudar }) {
  const teste = a.teste || []
  const adicionar = () => {
    const p = prompt('Pergunta:')
    if (!p) return
    const r = prompt('Resposta:') || ''
    mudar(x => { (x.teste ||= []).push({ p, r }) })
  }
  return (
    <div className="folha">
      <div className="linha-acoes" style={{ justifyContent: 'space-between' }}>
        <h2 className="sub-mao">Teste rápido <small className="dica">clique no cartão pra ver a resposta</small></h2>
        {EDITAVEL && <button className="btn-claro" onClick={adicionar}>+ pergunta</button>}
      </div>
      {teste.length ? (
        <div className="flashcards">
          {teste.map((q, k) => (
            <Flashcard key={k} n={k + 1} q={q} tirar={EDITAVEL ? () => mudar(x => { x.teste.splice(k, 1) }) : null} />
          ))}
        </div>
      ) : (
        <p className="dica">Sem perguntas ainda. O resumo com IA cria algumas, ou adicione as suas.</p>
      )}
    </div>
  )
}

function Flashcard({ q, n, tirar }) {
  const [virado, setVirado] = useState(false)
  return (
    <div className="flashcard-wrap">
      <button className={`flashcard ${virado ? 'virado' : ''}`} onClick={() => setVirado(v => !v)} aria-pressed={virado}>
        <span className="fc-num titulo-mao">{n}</span>
        <span className="fc-texto">{virado ? q.r : q.p}</span>
        <small>{virado ? 'resposta' : 'pergunta · clique'}</small>
      </button>
      {tirar && <button className="fc-tirar" onClick={tirar} aria-label={`apagar pergunta ${n}`}>×</button>}
    </div>
  )
}
