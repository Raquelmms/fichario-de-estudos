import { useEffect, useRef, useState } from 'react'
import { Adesivo } from './Adesivos.jsx'
import { CORES_POSTIT } from '../grifos.js'

// Post-its e adesivos soltos por cima de uma página ou de uma capa.
// x é sempre % da largura; y é % da altura na capa e px na página (que cresce).
// mudar(fn) recebe um rascunho { postits, adesivos } pra alterar.
export default function CamadaLivre({ postits = [], adesivos = [], editavel, modo = 'pagina', mudar, refContainer, className = '', children }) {
  const refLocal = useRef(null)
  const ref = refContainer || refLocal
  const [sel, setSel] = useState(null)
  const yUn = modo === 'capa' ? '%' : 'px'

  useEffect(() => {
    if (!sel) return
    const fora = e => {
      if (!e.target.closest?.(`[data-livre="${sel}"]`)) setSel(null)
    }
    const tecla = e => {
      if (['Delete', 'Backspace'].includes(e.key) && !e.target.closest('textarea, input, [contenteditable="true"]')) {
        mudar(d => {
          d.postits = (d.postits || []).filter(p => p.id !== sel)
          d.adesivos = (d.adesivos || []).filter(a => a.id !== sel)
        })
        setSel(null)
      }
    }
    window.addEventListener('pointerdown', fora)
    window.addEventListener('keydown', tecla)
    return () => {
      window.removeEventListener('pointerdown', fora)
      window.removeEventListener('keydown', tecla)
    }
  }, [sel, mudar])

  const arrastar = (e, lista, item) => {
    if (!editavel || e.button !== 0) return
    e.preventDefault()
    setSel(item.id)
    const caixa = ref.current.getBoundingClientRect()
    const el = e.currentTarget.closest('.livre-item')
    const [x0, y0, ix, iy] = [e.clientX, e.clientY, item.x, item.y]
    let [nx, ny] = [ix, iy]
    const mover = ev => {
      nx = Math.min(100, Math.max(-5, ix + ((ev.clientX - x0) / caixa.width) * 100))
      ny = modo === 'capa' ? Math.min(100, Math.max(-5, iy + ((ev.clientY - y0) / caixa.height) * 100)) : Math.max(-30, iy + ev.clientY - y0)
      el.style.setProperty('--x', nx + '%')
      if (!el.classList.contains('livre-postit')) el.style.left = nx + '%'
      el.style.top = ny + yUn
    }
    const soltar = () => {
      window.removeEventListener('pointermove', mover)
      window.removeEventListener('pointerup', soltar)
      if (nx !== ix || ny !== iy)
        mudar(d => {
          const it = d[lista].find(i => i.id === item.id)
          it.x = Math.round(nx * 10) / 10
          it.y = Math.round(ny * 10) / 10
        })
    }
    window.addEventListener('pointermove', mover)
    window.addEventListener('pointerup', soltar)
  }

  const mexer = (lista, id, fn) => mudar(d => fn(d[lista].find(i => i.id === id)))
  const tirar = (lista, id) => {
    mudar(d => {
      d[lista] = d[lista].filter(i => i.id !== id)
    })
    setSel(null)
  }

  return (
    <div ref={ref} className={`camada-livre camada-${modo} ${className}`}>
      {children}
      <div className="livre-itens">
        {adesivos.map(a => (
          <div
            key={a.id}
            data-livre={a.id}
            className={`livre-item livre-adesivo ${sel === a.id ? 'livre-sel' : ''} ${editavel ? 'livre-movel' : ''}`}
            style={{ left: a.x + '%', top: a.y + yUn, '--r': `${a.r || 0}deg`, '--s': a.s || 1 }}
          >
            <div className="livre-corpo" onPointerDown={e => arrastar(e, 'adesivos', a)}>
              <Adesivo a={a} />
            </div>
            {editavel && sel === a.id && (
              <div className="livre-ferramentas" role="toolbar" aria-label="ajustar adesivo">
                <button onClick={() => mexer('adesivos', a.id, i => { i.r = (i.r || 0) - 15 })} aria-label="girar pra esquerda">↺</button>
                <button onClick={() => mexer('adesivos', a.id, i => { i.r = (i.r || 0) + 15 })} aria-label="girar pra direita">↻</button>
                <button onClick={() => mexer('adesivos', a.id, i => { i.s = Math.max(0.5, +((i.s || 1) - 0.2).toFixed(1)) })} aria-label="diminuir">−</button>
                <button onClick={() => mexer('adesivos', a.id, i => { i.s = Math.min(3, +((i.s || 1) + 0.2).toFixed(1)) })} aria-label="aumentar">+</button>
                <button onClick={() => tirar('adesivos', a.id)} aria-label="tirar adesivo">🗑</button>
              </div>
            )}
          </div>
        ))}
        {postits.map(p => (
          <div
            key={p.id}
            data-livre={p.id}
            className={`livre-item livre-postit postit-${p.cor} ${sel === p.id ? 'livre-sel' : ''}`}
            style={{ '--x': p.x + '%', top: p.y + yUn, '--r': `${p.r ?? 1.5}deg` }}
          >
            <div className="postit-alca" onPointerDown={e => arrastar(e, 'postits', p)} title={editavel ? 'arraste pra mover' : undefined} />
            {editavel ? (
              <TextoPostit valor={p.texto} onSalvar={v => mexer('postits', p.id, i => { i.texto = v })} onFoco={() => setSel(p.id)} />
            ) : (
              <p className="postit-texto">{p.texto}</p>
            )}
            {editavel && sel === p.id && (
              <div className="livre-ferramentas" role="toolbar" aria-label="ajustar post-it">
                {CORES_POSTIT.map(c => (
                  <button key={c} className={`bolinha-postit postit-${c}`} aria-label={`post-it ${c}`} onClick={() => mexer('postits', p.id, i => { i.cor = c })} />
                ))}
                <button onClick={() => tirar('postits', p.id)} aria-label="tirar post-it">🗑</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function TextoPostit({ valor, onSalvar, onFoco }) {
  const [t, setT] = useState(valor || '')
  useEffect(() => setT(valor || ''), [valor])
  return (
    <textarea
      className="postit-texto"
      value={t}
      placeholder="escreva aqui…"
      aria-label="texto do post-it"
      onFocus={onFoco}
      onChange={e => setT(e.target.value)}
      onBlur={() => t !== (valor || '') && onSalvar(t)}
    />
  )
}
