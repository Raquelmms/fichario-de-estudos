import { useCallback, useEffect, useRef, useState } from 'react'
import { lerData } from './datas.js'

// Rodando com `npm run dev` dá pra editar: o servidor local grava em dados/.
// Na versão publicada (npm run build / GitHub Pages) o fichário é só leitura,
// com os dados embutidos no site.
export const EDITAVEL = import.meta.env.DEV

const EMBUTIDO = import.meta.glob('../dados/**/*.json', { eager: true, import: 'default' })

function dadosEmbutidos() {
  const d = { fichario: {}, materias: [] }
  for (const [arq, json] of Object.entries(EMBUTIDO)) {
    const rel = arq.replace(/^.*\/dados\//, '')
    if (rel === 'fichario.json') d.fichario = json
    else if (rel.startsWith('materias/')) d.materias.push({ ...json, _arquivo: rel })
  }
  return d
}

export function useFichario() {
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
    const agora = (filas.current[rel] || Promise.resolve()).then(async () => {
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

  const salvarMateria = materia => {
    const atual = ref.current
    const arquivo = materia._arquivo || `materias/${materia.id}.json`
    const comArquivo = { ...materia, _arquivo: arquivo }
    const existe = atual.materias.some(m => m.id === materia.id)
    trocar({ ...atual, materias: existe ? atual.materias.map(m => (m.id === materia.id ? comArquivo : m)) : [...atual.materias, comArquivo] })
    const { _arquivo, ...limpo } = comArquivo
    gravar(arquivo, limpo)
  }

  // mudarMateria('git', m => { m.nome = 'Novo nome' }): recebe uma cópia pra mexer à vontade
  const mudarMateria = (id, fn) => {
    const copia = structuredClone(ref.current.materias.find(m => m.id === id))
    const r = fn(copia)
    salvarMateria(r || copia)
  }

  const mudarAula = (materiaId, aulaId, fn) =>
    mudarMateria(materiaId, m => {
      fn(m.aulas.find(a => a.id === aulaId), m)
    })

  const excluirMateria = id => {
    const atual = ref.current
    const materia = atual.materias.find(m => m.id === id)
    trocar({ ...atual, materias: atual.materias.filter(m => m.id !== id) })
    gravar(materia._arquivo || `materias/${id}.json`, null)
  }

  const mudarFichario = fn => {
    const copia = structuredClone(ref.current.fichario)
    const novo = fn(copia) || copia
    trocar({ ...ref.current, fichario: novo })
    gravar('fichario.json', novo)
  }

  return { dados, status, recarregar, salvarMateria, mudarMateria, mudarAula, excluirMateria, mudarFichario }
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

// O resumo com IA está ligado? (precisa de ANTHROPIC_API_KEY no .env.local)
export function useIA() {
  const [ia, setIa] = useState({ ativo: false })
  useEffect(() => {
    if (!EDITAVEL) return
    fetch('/api/ia')
      .then(r => r.json())
      .then(setIa)
      .catch(() => {})
  }, [])
  return ia
}

// ------------------------------------------------------------ ajudantes

export const CORES = ['azul', 'vermelho', 'verde', 'roxo', 'laranja', 'rosa', 'amarelo', 'cinza']
export const PADROES = ['liso', 'bolinhas', 'listras', 'xadrez', 'quadriculado', 'diagonal']
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
      .slice(0, 40) || 'materia'
  let id = base
  for (let i = 2; usados.includes(id); i++) id = `${base}-${i}`
  return id
}

export const novaMateria = (nome, id, n) => ({
  id,
  nome,
  professor: '',
  emoji: '📒',
  cor: CORES[n % 6],
  capa: { padrao: PADROES[n % PADROES.length], adesivos: [] },
  aulas: [],
  prazos: [],
})

export const novaAula = n => ({
  id: novoId(),
  titulo: `Aula ${n}`,
  data: new Date().toISOString().slice(0, 10),
  conteudo: '',
  postits: [],
  adesivos: [],
  material: '',
  teste: [],
})

// Média ponderada dos prazos que já têm nota.
export function media(materia) {
  const comPeso = (materia.prazos || []).filter(p => p.peso)
  const avaliados = comPeso.filter(p => p.nota != null && p.nota !== '')
  if (!avaliados.length) return null
  const peso = avaliados.reduce((s, p) => s + +p.peso, 0)
  return {
    media: avaliados.reduce((s, p) => s + +p.peso * +p.nota, 0) / peso,
    pesoAvaliado: peso,
    pesoTotal: comPeso.reduce((s, p) => s + +p.peso, 0),
  }
}

// Tudo que tem data (prazos, aulas e conectores) numa lista só.
export function eventos(dados, conectores = []) {
  const lista = []
  for (const m of dados.materias) {
    for (const p of m.prazos || []) {
      const quando = lerData(p.data)
      if (!quando) continue
      lista.push({
        quando,
        titulo: p.titulo,
        materia: m,
        cor: m.cor,
        icone: TIPOS[p.tipo] || TIPOS.outro,
        feito: !!p.feito,
        prazo: true,
        href: `#/m/${m.id}`,
        link: p.link,
        peso: p.peso,
        diaInteiro: p.data.length === 10,
      })
    }
    for (const a of m.aulas || []) {
      if (!a.data) continue
      lista.push({ quando: lerData(a.data), titulo: a.titulo, materia: m, cor: m.cor, icone: '📖', aula: true, href: `#/m/${m.id}/${a.id}`, diaInteiro: true })
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

// Texto puro de um HTML (pra prévia das aulas no índice).
export const textoDe = html => (html || '').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim()
