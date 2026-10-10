import { useEffect, useMemo, useState } from 'react'
import { useFichario, useConectores, useIA, eventos as juntarEventos, EDITAVEL } from './dados.js'
import Inicio from './paginas/Inicio.jsx'
import Materia from './paginas/Materia.jsx'
import Aula from './paginas/Aula.jsx'
import Ajustes from './paginas/Ajustes.jsx'
import Calendario from './componentes/Calendario.jsx'

// Rotas: #/ · #/calendario · #/ajustes · #/m/<matéria> · #/m/<matéria>/<aula>
const lerRota = () => window.location.hash.replace(/^#\/?/, '').split('/').filter(Boolean)

export default function App() {
  const [rota, setRota] = useState(lerRota)
  const fichario = useFichario()
  const { conectores, recarregar: recarregarConectores } = useConectores()
  const ia = useIA()
  const { dados } = fichario

  useEffect(() => {
    const f = () => {
      setRota(lerRota())
      window.scrollTo(0, 0)
    }
    window.addEventListener('hashchange', f)
    return () => window.removeEventListener('hashchange', f)
  }, [])

  const eventos = useMemo(() => (dados ? juntarEventos(dados, conectores) : []), [dados, conectores])

  useEffect(() => {
    if (dados?.fichario.titulo) document.title = dados.fichario.titulo
  }, [dados?.fichario.titulo])

  if (!dados) return <p className="carregando">abrindo o fichário…</p>

  const ctx = { ...fichario, conectores, recarregarConectores, eventos, ia }
  const [a, id, aulaId] = rota
  const m = a === 'm' && dados.materias.find(x => x.id === id)
  let pagina
  if (a === 'calendario')
    pagina = (
      <section className="pagina">
        <h1 className="titulo-mao">Calendário</h1>
        <div className="folha"><Calendario eventos={eventos} materias={dados.materias} /></div>
      </section>
    )
  else if (a === 'ajustes') pagina = <Ajustes ctx={ctx} />
  else if (m && aulaId) pagina = <Aula ctx={ctx} m={m} aulaId={aulaId} />
  else if (m) pagina = <Materia ctx={ctx} m={m} />
  else if (a === 'm') pagina = <p>Essa matéria não existe (ou foi apagada). <a href="#/">Voltar pro início</a></p>
  else pagina = <Inicio ctx={ctx} />

  return (
    <div className="fichario">
      <div className="argolas" aria-hidden="true">
        {[0, 1, 2, 3].map(i => <span key={i} className="argola" />)}
      </div>
      <main className="folha-fichario">
        <nav className="menu">
          <a href="#/" className="menu-marca">🗂️ {dados.fichario.titulo || 'fichário'}</a>
          <span className="menu-links">
            <a href="#/calendario" className="menu-link">calendário</a>
            <a href="#/ajustes" className="menu-link">ajustes</a>
          </span>
          <Status status={fichario.status} />
        </nav>
        {pagina}
      </main>
      <nav className="abas" aria-label="matérias">
        <a href="#/" className={`aba aba-inicio ${!a ? 'aba-ativa' : ''}`}>início</a>
        {dados.materias.map(x => (
          <a key={x.id} href={`#/m/${x.id}`} className={`aba cor-${x.cor} ${m?.id === x.id ? 'aba-ativa' : ''}`} title={x.nome}>
            <span aria-hidden="true">{x.emoji}</span> {x.nome}
          </a>
        ))}
      </nav>
    </div>
  )
}

function Status({ status }) {
  if (!EDITAVEL) return <span className="selo" title="Rode npm run dev no seu computador para editar">só leitura</span>
  if (status === 'salvando') return <span className="selo">salvando…</span>
  if (status === 'salvo') return <span className="selo selo-ok" title="gravado em dados/">✓ salvo</span>
  if (status?.erro) return <span className="selo selo-erro" title={status.erro}>⚠ não salvou</span>
  return <span className="selo selo-ok" title="o que você mudar aqui é gravado em dados/">● editando</span>
}
