import { useCallback, useEffect, useRef, useState } from 'react'
import { lerData, chaveDia } from './datas.js'

// Rodando com `npm run dev` dá pra editar: o servidor local grava em dados/.
// Na versão publicada (npm run build / GitHub Pages) o caderno é só leitura,
// com os dados embutidos no site.
export const EDITAVEL = import.meta.env.DEV

const EMBUTIDO = import.meta.glob('../dados/**/*.json', { eager: true, import: 'default' })

function dadosEmbutidos() {
  const d = { caderno: {}, cursos: [], leituras: [] }
  for (const [arq, json] of Object.entries(EMBUTIDO)) {
    const rel = arq.replace(/^.*\/dados\//, '')
    if (rel === 'caderno.json') d.caderno = json
    else if (rel.startsWith('cursos/')) d.cursos.push({ ...json, _arquivo: rel })
    else if (rel.startsWith('leituras/')) d.leituras.push({ ...json, _arquivo: rel })
  }
  return d
}

export function useCaderno() {
  const [dados, setDados] = useState(() => (EDITAVEL ? null : dadosEmbutidos()))
  const [status, setStatus] = useState(null) // null · 'salvando' · 'salvo' · { erro }
  const ref = useRef(dados)
  const filas = useRef({})

  const trocar = novo => {
    ref.current = novo
    setDados(novo)
  }

  const recarregar = useCallback(async () => {
    try {
      const r = await fetch('/api/dados')
      if (!r.ok) throw new Error((await r.json()).erro)
      trocar(await r.json())
    } catch (e) {
      setStatus({ erro: `não consegui ler dados/: ${e.message}` })
      if (!ref.current) trocar(dadosEmbutidos())
    }
  }, [])

  useEffect(() => {
    if (!EDITAVEL) return
    recarregar()
    import.meta.hot?.on('caderno:dados', recarregar)
  }, [recarregar])

  // Grava um arquivo de dados/. As gravações do mesmo arquivo vão em fila, na ordem.
  const gravar = (rel, conteudo) => {
    setStatus('salvando')
    const anterior = filas.current[rel] || Promise.resolve()
    const agora = anterior.then(async () => {
      try {
        const r = await fetch('/api/dados/' + rel, {
          method: conteudo === null ? 'DELETE' : 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: conteudo === null ? undefined : JSON.stringify(conteudo),
        })
        if (!r.ok) throw new Error((await r.json()).erro)
        setStatus('salvo')
      } catch (e) {
        setStatus({ erro: `não salvou ${rel}: ${e.message}` })
      }
    })
    filas.current[rel] = agora
    return agora
  }

  const salvarCurso = curso => {
    const atual = ref.current
    const arquivo = curso._arquivo || `cursos/${curso.id}.json`
    const comArquivo = { ...curso, _arquivo: arquivo }
    const existe = atual.cursos.some(c => c.id === curso.id)
    trocar({ ...atual, cursos: existe ? atual.cursos.map(c => (c.id === curso.id ? comArquivo : c)) : [...atual.cursos, comArquivo] })
    const { _arquivo, ...limpo } = comArquivo
    gravar(arquivo, limpo)
  }

  // mudarCurso('git', c => { c.nome = 'Novo nome' }): recebe uma cópia pra mexer à vontade
  const mudarCurso = (id, fn) => {
    const copia = structuredClone(ref.current.cursos.find(c => c.id === id))
    const r = fn(copia)
    salvarCurso(r || copia)
  }

  const excluirCurso = id => {
    const atual = ref.current
    const curso = atual.cursos.find(c => c.id === id)
    const leituras = atual.leituras.filter(l => l.curso === id)
    trocar({ ...atual, cursos: atual.cursos.filter(c => c.id !== id), leituras: atual.leituras.filter(l => l.curso !== id) })
    gravar(curso._arquivo || `cursos/${id}.json`, null)
    leituras.forEach(l => l._arquivo && gravar(l._arquivo, null))
  }

  const mudarCaderno = fn => {
    const copia = structuredClone(ref.current.caderno)
    const novo = fn(copia) || copia
    trocar({ ...ref.current, caderno: novo })
    gravar('caderno.json', novo)
  }

  return { dados, status, recarregar, salvarCurso, mudarCurso, excluirCurso, mudarCaderno }
}

// Itens que vêm dos conectores (agenda, Linear…). Só existem com npm run dev.
export function useConectores() {
  const [conectores, setConectores] = useState([])
  const carregar = useCallback(async (forcar = false) => {
    if (!EDITAVEL) return
    try {
      const r = await fetch('/api/conectores' + (forcar ? '?forcar=1' : ''))
      setConectores(await r.json())
    } catch {
      setConectores([])
    }
  }, [])
  useEffect(() => {
    carregar()
  }, [carregar])
  return { conectores, recarregar: () => carregar(true) }
}

// ------------------------------------------------------------ ajudantes

export const CORES = ['azul', 'vermelho', 'verde', 'roxo', 'laranja', 'rosa']
export const TIPOS = { tarefa: '📝', prova: '🎓', leitura: '📚', projeto: '🛠️', aula: '🎥', outro: '📌' }

export const novoId = () => Math.random().toString(36).slice(2, 8)

export function slug(texto, usados = []) {
  const base =
    texto
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 40) || 'curso'
  let id = base
  for (let i = 2; usados.includes(id); i++) id = `${base}-${i}`
  return id
}

export const leituraDe = (dados, cursoId, n) => dados.leituras.find(l => l.curso === cursoId && +l.modulo === +n)

// Módulo em que você está: o que tem hoje entre início e fim; senão o primeiro não feito.
export function moduloAtual(curso, agora = new Date()) {
  const hoje = chaveDia(agora)
  const ms = curso.modulos || []
  return ms.find(m => m.inicio && m.fim && m.inicio <= hoje && hoje <= m.fim) || ms.find(m => !m.feito) || null
}

// Média ponderada dos prazos que já têm nota.
export function media(curso) {
  const comPeso = (curso.prazos || []).filter(p => p.peso)
  const avaliados = comPeso.filter(p => p.nota != null && p.nota !== '')
  if (!avaliados.length) return null
  const peso = avaliados.reduce((s, p) => s + +p.peso, 0)
  return {
    media: avaliados.reduce((s, p) => s + +p.peso * +p.nota, 0) / peso,
    pesoAvaliado: peso,
    pesoTotal: comPeso.reduce((s, p) => s + +p.peso, 0),
  }
}

// Tudo que tem data, de todos os cursos e conectores, numa lista só.
export function eventos(dados, conectores = []) {
  const lista = []
  for (const c of dados.cursos) {
    for (const p of c.prazos || []) {
      const quando = lerData(p.data)
      if (!quando) continue
      lista.push({
        quando,
        titulo: p.titulo,
        curso: c,
        cor: c.cor,
        icone: TIPOS[p.tipo] || TIPOS.outro,
        feito: !!p.feito,
        href: p.modulo ? `#/curso/${c.id}/${p.modulo}` : `#/curso/${c.id}`,
        link: p.link,
        peso: p.peso,
        diaInteiro: p.data.length === 10,
      })
    }
  }
  for (const k of conectores) {
    for (const it of k.itens || []) {
      const quando = lerData(it.inicio)
      if (!quando || isNaN(quando)) continue
      lista.push({ quando, titulo: it.titulo, cor: 'cinza', icone: '📅', feito: !!it.feito, link: it.link, fonte: k.nome, diaInteiro: it.diaInteiro })
    }
  }
  return lista.sort((a, b) => a.quando - b.quando)
}
