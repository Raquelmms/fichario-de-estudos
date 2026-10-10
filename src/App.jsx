import { useEffect, useMemo, useState } from 'react'
import { useCaderno, useConectores, eventos as juntarEventos, EDITAVEL } from './dados.js'
import Inicio from './paginas/Inicio.jsx'
import Curso from './paginas/Curso.jsx'
import Modulo from './paginas/Modulo.jsx'
import Ajustes from './paginas/Ajustes.jsx'
import Leitura from './componentes/Leitura.jsx'
import Calendario from './componentes/Calendario.jsx'
import { leituraDe } from './dados.js'

// Rotas: #/ · #/calendario · #/ajustes · #/curso/<id> · #/curso/<id>/<n> · #/curso/<id>/<n>/leitura
const lerRota = () => window.location.hash.replace(/^#\/?/, '').split('/').filter(Boolean)

export default function App() {
  const [rota, setRota] = useState(lerRota)
  const caderno = useCaderno()
  const { conectores, recarregar: recarregarConectores } = useConectores()
  const { dados } = caderno

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
    if (dados?.caderno.titulo) document.title = dados.caderno.titulo
  }, [dados?.caderno.titulo])

  if (!dados) return <p className="carregando">abrindo o caderno…</p>

  const ctx = { ...caderno, conectores, recarregarConectores, eventos }
  const [a, id, n, leitura] = rota
  const curso = a === 'curso' && dados.cursos.find(c => c.id === id)
  let pagina
  if (a === 'calendario')
    pagina = (
      <section className="pagina">
        <h1 className="titulo-mao">Calendário</h1>
        <div className="folha"><Calendario eventos={eventos} cursos={dados.cursos} /></div>
      </section>
    )
  else if (a === 'ajustes') pagina = <Ajustes ctx={ctx} />
  else if (curso && n && leitura && leituraDe(dados, id, n))
    pagina = (
      <section className="pagina">
        <a className="voltar" href={`#/curso/${id}/${n}`}>← Módulo {n}</a>
        <Leitura leitura={leituraDe(dados, id, n)} curso={curso} />
      </section>
    )
  else if (curso && n) pagina = <Modulo ctx={ctx} curso={curso} n={+n} />
  else if (curso) pagina = <Curso ctx={ctx} curso={curso} />
  else if (a === 'curso') pagina = <p>Esse curso não existe (ou foi apagado). <a href="#/">Voltar pro início</a></p>
  else pagina = <Inicio ctx={ctx} />

  return (
    <div className="caderno">
      <div className="margem" aria-hidden="true" />
      <main className="conteudo">
        <nav className="menu">
          <a href="#/" className="menu-marca">📓 {dados.caderno.titulo || 'caderno'}</a>
          <span className="menu-links">
            {dados.cursos.map(c => (
              <a key={c.id} href={`#/curso/${c.id}`} className={`menu-link cor-${c.cor}`}>{c.codigo || c.nome}</a>
            ))}
            <a href="#/calendario" className="menu-link">calendário</a>
            <a href="#/ajustes" className="menu-link">ajustes</a>
          </span>
          <Status status={caderno.status} />
        </nav>
        {pagina}
      </main>
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
