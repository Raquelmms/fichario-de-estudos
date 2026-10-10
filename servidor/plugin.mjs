// Servidor local do caderno. Só existe enquanto `npm run dev` está rodando:
//   GET    /api/dados             → tudo que está em dados/ (lido do disco na hora)
//   PUT    /api/dados/<arquivo>   → grava um JSON em dados/
//   DELETE /api/dados/<arquivo>   → apaga um JSON de dados/
//   GET    /api/conectores        → itens dos conectores ligados (agenda, Linear…)
// Quando alguém mexe num arquivo de dados/ por fora (editor, Claude Code),
// a página recebe um aviso e recarrega os dados sozinha.

import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const lerCorpo = req =>
  new Promise((ok, erro) => {
    let s = ''
    req.on('data', c => (s += c))
    req.on('end', () => {
      try {
        ok(s ? JSON.parse(s) : {})
      } catch (e) {
        erro(e)
      }
    })
  })

const responder = (res, status, obj) => {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(obj))
}

const lerJson = arq => JSON.parse(fs.readFileSync(arq, 'utf8'))
const listar = dir => (fs.existsSync(dir) ? fs.readdirSync(dir).filter(f => f.endsWith('.json')).sort() : [])

export function lerTudo(raiz) {
  const dados = path.join(raiz, 'dados')
  return {
    caderno: lerJson(path.join(dados, 'caderno.json')),
    cursos: listar(path.join(dados, 'cursos')).map(f => ({ ...lerJson(path.join(dados, 'cursos', f)), _arquivo: `cursos/${f}` })),
    leituras: listar(path.join(dados, 'leituras')).map(f => ({ ...lerJson(path.join(dados, 'leituras', f)), _arquivo: `leituras/${f}` })),
  }
}

export default function pluginCaderno({ raiz, env }) {
  const pastaDados = path.join(raiz, 'dados')
  const escritasNossas = new Map() // caminho → conteúdo que nós mesmos gravamos

  // "cursos/git.json" → caminho absoluto, ou null se tentar sair de dados/
  const resolver = rel => {
    if (!/^[a-z0-9][a-z0-9/_-]*\.json$/i.test(rel) || rel.includes('..')) return null
    const abs = path.resolve(pastaDados, rel)
    return abs.startsWith(pastaDados + path.sep) ? abs : null
  }

  // Conectores: cada arquivo .mjs em conectores/ é um.
  let conectores = null
  const carregarConectores = async () => {
    const pasta = path.join(raiz, 'conectores')
    const arqs = fs.readdirSync(pasta).filter(f => f.endsWith('.mjs') && !f.startsWith('_'))
    conectores = []
    for (const f of arqs) {
      try {
        const mod = (await import(pathToFileURL(path.join(pasta, f)).href)).default
        conectores.push({ id: f.replace(/\.mjs$/, ''), ...mod })
      } catch (e) {
        conectores.push({ id: f, nome: f, erroAoCarregar: e.message, precisa: [] })
      }
    }
  }
  let cache = { em: 0, resposta: null }

  return {
    name: 'caderno',
    configureServer(server) {
      // Avisa a página quando dados/ muda por fora.
      try {
        fs.watch(pastaDados, { recursive: true }, (_, nome) => {
          if (!nome?.endsWith('.json')) return
          const abs = path.join(pastaDados, nome)
          const atual = fs.existsSync(abs) ? fs.readFileSync(abs, 'utf8') : null
          if (escritasNossas.has(abs) && escritasNossas.get(abs) === atual) return
          server.ws.send({ type: 'custom', event: 'caderno:dados' })
        })
      } catch {
        // fs.watch recursivo não existe em todo sistema; aí é só dar F5.
      }

      server.middlewares.use('/api/dados', async (req, res) => {
        try {
          const rel = decodeURIComponent((req.url || '/').split('?')[0]).replace(/^\/+/, '')
          if (req.method === 'GET' && !rel) return responder(res, 200, lerTudo(raiz))

          const abs = resolver(rel)
          if (!abs) return responder(res, 400, { erro: `caminho inválido: ${rel}` })

          if (req.method === 'PUT') {
            const texto = JSON.stringify(await lerCorpo(req), null, 2) + '\n'
            fs.mkdirSync(path.dirname(abs), { recursive: true })
            escritasNossas.set(abs, texto)
            fs.writeFileSync(abs, texto)
            return responder(res, 200, { ok: true })
          }
          if (req.method === 'DELETE') {
            escritasNossas.set(abs, null)
            fs.rmSync(abs, { force: true })
            return responder(res, 200, { ok: true })
          }
          responder(res, 405, { erro: 'método não suportado' })
        } catch (e) {
          responder(res, 500, { erro: e.message })
        }
      })

      server.middlewares.use('/api/conectores', async (req, res) => {
        if (!conectores) await carregarConectores()
        const forcar = (req.url || '').includes('forcar')
        if (!forcar && cache.resposta && Date.now() - cache.em < 60_000) return responder(res, 200, cache.resposta)

        const resposta = await Promise.all(
          conectores.map(async c => {
            const base = { id: c.id, nome: c.nome, descricao: c.descricao, precisa: c.precisa, como: c.como }
            if (c.erroAoCarregar) return { ...base, ativo: false, erro: c.erroAoCarregar }
            const ativo = c.precisa.every(v => env[v])
            if (!ativo) return { ...base, ativo }
            try {
              const itens = await Promise.race([
                c.buscar(env),
                new Promise((_, erro) => setTimeout(() => erro(new Error('demorou mais de 15 s')), 15_000)),
              ])
              return { ...base, ativo, itens }
            } catch (e) {
              return { ...base, ativo, erro: e.message }
            }
          }),
        )
        cache = { em: Date.now(), resposta }
        responder(res, 200, resposta)
      })
    },
  }
}
