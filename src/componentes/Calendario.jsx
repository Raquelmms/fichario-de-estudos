import { useMemo, useState } from 'react'
import { chaveDia, hora } from '../datas.js'

const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro']
const SEMANA = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb']

// Mês com os prazos e as aulas das matérias e os eventos dos conectores.
export default function Calendario({ eventos, materias, compacto = false }) {
  const hoje = new Date()
  const [mes, setMes] = useState(() => new Date(hoje.getFullYear(), hoje.getMonth(), 1))

  const porDia = useMemo(() => {
    const m = {}
    for (const e of eventos) (m[chaveDia(e.quando)] ||= []).push(e)
    return m
  }, [eventos])

  const ano = mes.getFullYear()
  const mesN = mes.getMonth()
  const dias = new Date(ano, mesN + 1, 0).getDate()
  const celulas = [...Array(mes.getDay()).fill(null), ...Array.from({ length: dias }, (_, i) => new Date(ano, mesN, i + 1))]
  while (celulas.length % 7) celulas.push(null)
  const andar = n => setMes(new Date(ano, mesN + n, 1))

  return (
    <div className={`calendario ${compacto ? 'cal-compacto' : ''}`}>
      <div className="cal-topo">
        <button className="cal-seta" onClick={() => andar(-1)} aria-label="mês anterior">‹</button>
        <h3 className="titulo-mao cal-mes">{MESES[mesN]} {ano}</h3>
        <button className="cal-seta" onClick={() => andar(1)} aria-label="próximo mês">›</button>
      </div>
      <div className="cal-grade">
        {SEMANA.map(s => <div key={s} className="cal-cab">{s}</div>)}
        {celulas.map((d, i) => {
          if (!d) return <div key={i} className="cal-dia cal-vazio" />
          const k = chaveDia(d)
          const evs = porDia[k] || []
          return (
            <div key={i} className={`cal-dia ${k === chaveDia(hoje) ? 'cal-hoje' : ''} ${evs.length ? 'cal-com' : ''}`}>
              <div className="cal-num">
                <span>{d.getDate()}</span>
              </div>
              <ul className="cal-evs">
                {evs.map((e, j) => {
                  const rotulo = `${e.materia ? e.materia.nome + ' · ' : ''}${e.titulo}`
                  const dica = `${rotulo}${e.diaInteiro ? '' : ` · ${hora(e.quando)}`}${e.fonte ? ` · ${e.fonte}` : ''}`
                  const conteudo = <><span aria-hidden="true">{e.feito ? '✓' : e.icone}</span> {compacto ? e.titulo : rotulo}</>
                  const classe = `cal-ev cor-${e.cor} ${e.feito ? 'cal-ev-feito' : ''} ${e.fonte ? 'cal-ev-aviso' : ''}`
                  return (
                    <li key={j}>
                      {e.href ? (
                        <a className={classe} href={e.href} title={dica}>{conteudo}</a>
                      ) : (
                        <a className={classe} href={e.link || undefined} target="_blank" rel="noreferrer" title={dica}>{conteudo}</a>
                      )}
                    </li>
                  )
                })}
              </ul>
            </div>
          )
        })}
      </div>
      <p className="cal-legenda">
        {materias.map(m => <span key={m.id}><span className={`leg cor-${m.cor}`}>{m.nome}</span> </span>)}
        · 📖 aula · ✓ = feito{eventos.some(e => e.fonte) && ' · borda tracejada = veio da sua agenda/conectores'}
      </p>
    </div>
  )
}
