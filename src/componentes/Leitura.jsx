import { useState } from 'react'

// Página de leitura grifada: texto no meio, post-its na margem direita.
// Marcação inline: ==grifo==, ++definição++, **negrito**, *itálico*, `código`.
// O formato dos blocos está explicado no CLAUDE.md.

const TOKENS = /(==[^=]+==|\+\+[^+]+\+\+|\*\*[^*]+\*\*|`[^`]+`|\*[^*\n]+\*)/g

export function Rico({ children }) {
  return String(children)
    .split('\n')
    .map((linha, li, todas) => (
      <span key={li}>
        {linha.split(TOKENS).map((p, i) => {
          if (p.startsWith('==')) return <mark key={i} className="grifo"><Rico>{p.slice(2, -2)}</Rico></mark>
          if (p.startsWith('++')) return <mark key={i} className="grifo grifo-verde"><Rico>{p.slice(2, -2)}</Rico></mark>
          if (p.startsWith('**')) return <b key={i}>{p.slice(2, -2)}</b>
          if (p.startsWith('`')) return <code key={i}>{p.slice(1, -1)}</code>
          if (p.startsWith('*') && p.length > 2) return <i key={i}>{p.slice(1, -1)}</i>
          return p
        })}
        {li < todas.length - 1 && <br />}
      </span>
    ))
}

const rolar = id => e => {
  e.preventDefault()
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
}

export default function Leitura({ leitura, curso }) {
  const refs = [].concat(leitura.referencias || [])
  return (
    <article className={`leitura cor-${curso.cor}`}>
      <header className="leitura-capa">
        <div className="fita" aria-hidden="true" />
        <p className="mono eyebrow">
          {curso.codigo || curso.nome} · Módulo {leitura.modulo} · leitura grifada{leitura.minutos && ` · ~${leitura.minutos} min`}
        </p>
        <h1 className="titulo-mao">{leitura.titulo}</h1>
        <p className="leitura-autores">
          {[leitura.autores, leitura.capitulos].filter(Boolean).join(' · ')}
          {leitura.link && <> · <a href={leitura.link} target="_blank" rel="noreferrer">ler o original ↗</a></>}
        </p>
        {leitura.ideia && (
          <div className="ideia">
            <span className="sub-mao">em uma frase</span>
            <p><Rico>{leitura.ideia}</Rico></p>
          </div>
        )}
        <p className="legenda-grifos">
          <mark className="grifo">amarelo</mark> = o mais importante · <mark className="grifo grifo-verde">verde</mark> = definição · post-its = dicas e exemplos
        </p>
      </header>

      <nav className="sumario" aria-label="Sumário">
        {leitura.secoes.map((s, i) => (
          <a key={s.id} href={`#sec-${s.id}`} onClick={rolar(`sec-${s.id}`)}>
            <span className="titulo-mao">{i + 1}</span> {s.titulo}
          </a>
        ))}
        {leitura.teste?.length > 0 && (
          <a href="#sec-teste" onClick={rolar('sec-teste')}>
            <span className="titulo-mao">✓</span> teste rápido
          </a>
        )}
      </nav>

      {leitura.secoes.map((s, i) => (
        <section key={s.id} id={`sec-${s.id}`} className="leitura-secao">
          <h2 className="leitura-h2">
            <span className="leitura-num titulo-mao">{i + 1}</span>
            {s.titulo}
            {s.pagina && <span className="pag mono">p. {s.pagina}</span>}
          </h2>
          <div className="leitura-corpo">
            {s.blocos.map((b, j) => <Bloco key={j} b={b} />)}
          </div>
        </section>
      ))}

      {leitura.teste?.length > 0 && (
        <section id="sec-teste" className="leitura-secao">
          <h2 className="leitura-h2"><span className="leitura-num titulo-mao">✓</span>Teste rápido <small>clique no cartão pra ver a resposta</small></h2>
          <div className="flashcards">
            {leitura.teste.map((q, i) => <Flashcard key={i} n={i + 1} q={q} />)}
          </div>
        </section>
      )}

      {refs.length > 0 && (
        <footer className="leitura-apa">
          <span className="sub-mao">{refs.length > 1 ? 'referências' : 'referência'}</span>
          {refs.map((r, i) => <p key={i}><Rico>{r}</Rico></p>)}
        </footer>
      )}
    </article>
  )
}

function Bloco({ b }) {
  switch (b.t) {
    case 'p':
      return <p className="l-p"><Rico>{b.texto}</Rico></p>
    case 'subtitulo':
      return <h3 className="l-sub">{b.texto}</h3>
    case 'postit':
      return (
        <aside className={`l-postit postit-${b.cor || 'amarelo'}`}>
          {b.titulo && <strong className="titulo-mao">{b.titulo}</strong>}
          <p><Rico>{b.texto}</Rico></p>
        </aside>
      )
    case 'def':
      return (
        <div className="l-def">
          <span className="l-termo titulo-mao">{b.termo}</span>
          {(b.original || b.en) && <blockquote>“{b.original || b.en}”</blockquote>}
          <p><Rico>{b.pt || b.texto}</Rico></p>
        </div>
      )
    case 'citacao':
      return (
        <blockquote className="l-citacao">
          “{b.texto}”{b.fonte && <cite>— {b.fonte}</cite>}
        </blockquote>
      )
    case 'lista': {
      const Tag = b.numerada ? 'ol' : 'ul'
      return <Tag className="l-lista">{b.itens.map((x, i) => <li key={i}><Rico>{x}</Rico></li>)}</Tag>
    }
    case 'tabela':
      return (
        <div className="l-tabela">
          <table>
            <thead><tr>{b.cab.map((c, i) => <th key={i}>{c}</th>)}</tr></thead>
            <tbody>{b.linhas.map((l, i) => <tr key={i}>{l.map((c, j) => <td key={j}><Rico>{c}</Rico></td>)}</tr>)}</tbody>
          </table>
        </div>
      )
    case 'fluxo':
      return (
        <div className="l-fluxo">
          {b.passos.map((p, i) => (
            <span key={i}>{i > 0 && <span className="seta" aria-hidden="true">→</span>}<span className="passo-fluxo">{p}</span></span>
          ))}
        </div>
      )
    case 'codigo':
      return <pre className="l-codigo"><code>{b.texto}</code></pre>
    case 'imagem':
      return (
        <figure className="l-imagem">
          <img src={b.src} alt={b.alt || b.legenda || ''} loading="lazy" />
          {b.legenda && <figcaption><Rico>{b.legenda}</Rico></figcaption>}
        </figure>
      )
    default:
      return null
  }
}

function Flashcard({ q, n }) {
  const [virado, setVirado] = useState(false)
  return (
    <button className={`flashcard ${virado ? 'virado' : ''}`} onClick={() => setVirado(v => !v)} aria-pressed={virado}>
      <span className="fc-num titulo-mao">{n}</span>
      <span className="fc-texto">{virado ? q.r : q.p}</span>
      <small>{virado ? 'resposta' : 'pergunta · clique'}</small>
    </button>
  )
}
