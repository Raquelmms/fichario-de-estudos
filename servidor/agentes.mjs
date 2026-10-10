// Resume uma aula usando o agente que a pessoa já tem instalado (Claude Code, Codex,
// Copilot, Cursor), no modo automático e usando a assinatura dela, sem chave de API.
//
// Pra gastar pouco e não mexer em nada: o agente roda numa pasta temporária vazia,
// sem ferramentas, recebe o material no próprio pedido e só devolve o JSON do resumo.
// Quem grava na aula é o fichário, depois de validar a resposta.

import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import spawn from 'cross-spawn'
import { INSTRUCOES, SCHEMA, Resumo, pedido } from './resumir.mjs'

const LIMITE_MS = 5 * 60_000
const FORMATO = `Responda só com um JSON (sem markdown, sem explicação) neste formato:\n${JSON.stringify(SCHEMA)}`

export const AGENTES = {
  claude: {
    nome: 'Claude Code',
    cmd: 'claude',
    // Sem MCPs, skills, ferramentas nem configurações: o contexto fica ~100x menor.
    args: () => [
      '-p', '--output-format', 'json', '--json-schema', JSON.stringify(SCHEMA),
      '--tools', '', '--strict-mcp-config', '--disable-slash-commands', '--setting-sources', '',
      '--system-prompt', INSTRUCOES, '--exclude-dynamic-system-prompt-sections', '--no-session-persistence',
    ],
    entrada: dados => pedido(dados),
    ler: saida => {
      const j = JSON.parse(saida)
      if (j.is_error) throw new Error(j.result || 'o Claude Code devolveu erro')
      return j.structured_output ?? extrairJson(j.result)
    },
  },
  codex: {
    nome: 'Codex',
    cmd: 'codex',
    args: pasta => [
      'exec', '--skip-git-repo-check', '--ephemeral', '-s', 'read-only', '-c', 'mcp_servers={}',
      '--output-schema', path.join(pasta, 'formato.json'), '-o', path.join(pasta, 'resposta.json'), '-',
    ],
    preparar: pasta => fs.writeFileSync(path.join(pasta, 'formato.json'), JSON.stringify(SCHEMA)),
    entrada: dados => `${INSTRUCOES}\n\n${pedido(dados)}`,
    ler: (_, pasta) => JSON.parse(fs.readFileSync(path.join(pasta, 'resposta.json'), 'utf8')),
  },
  copilot: {
    nome: 'GitHub Copilot',
    cmd: 'copilot',
    // O Copilot recebe o pedido como argumento, então o material não pode ser gigante.
    args: (_, dados) => ['-p', `${INSTRUCOES}\n\n${FORMATO}\n\n${pedido(dados)}`, '-s', '--available-tools', '', '--no-ask-user', '--no-custom-instructions'],
    maximo: 100_000,
    ler: saida => extrairJson(saida),
  },
  cursor: {
    nome: 'Cursor',
    cmd: 'cursor-agent',
    args: (_, dados) => ['-p', '--output-format', 'json', '--trust', `${INSTRUCOES}\n\n${FORMATO}\n\n${pedido(dados)}`],
    maximo: 100_000,
    ler: saida => extrairJson(JSON.parse(saida).result),
  },
}

// Quais agentes estão instalados (procura no PATH, como o terminal faz).
export function agentesInstalados() {
  const pastas = (process.env.PATH || '').split(path.delimiter).filter(Boolean)
  const exts = process.platform === 'win32' ? (process.env.PATHEXT || '.EXE;.CMD;.BAT').split(';') : ['']
  const existe = cmd => pastas.some(p => exts.some(e => fs.existsSync(path.join(p, cmd + e.toLowerCase())) || fs.existsSync(path.join(p, cmd + e))))
  return Object.entries(AGENTES).map(([id, a]) => ({ id, nome: a.nome, instalado: existe(a.cmd) }))
}

export async function resumirComAgente(id, dados) {
  const agente = AGENTES[id]
  if (!agente) throw new Error(`agente desconhecido: ${id}`)
  if (agente.maximo && dados.material.length > agente.maximo)
    throw new Error(`o material é grande demais pro ${agente.nome}; divida em partes ou use o Claude Code ou o Codex`)

  const pasta = fs.mkdtempSync(path.join(os.tmpdir(), 'fichario-'))
  try {
    agente.preparar?.(pasta)
    const saida = await rodar(agente.cmd, agente.args(pasta, dados), agente.entrada?.(dados), pasta)
    const resumo = Resumo.safeParse(agente.ler(saida, pasta))
    if (!resumo.success) throw new Error(`o ${agente.nome} respondeu fora do formato; tente de novo`)
    return resumo.data
  } finally {
    fs.rmSync(pasta, { recursive: true, force: true })
  }
}

function rodar(cmd, args, entrada, pasta) {
  return new Promise((ok, erro) => {
    const p = spawn(cmd, args, { cwd: pasta, env: process.env })
    let saida = ''
    let falhas = ''
    const relogio = setTimeout(() => {
      p.kill()
      erro(new Error('o agente demorou mais de 5 minutos'))
    }, LIMITE_MS)
    p.stdout.on('data', c => (saida += c))
    p.stderr.on('data', c => (falhas += c))
    p.on('error', e => {
      clearTimeout(relogio)
      erro(new Error(`não consegui abrir o ${cmd}: ${e.message}`))
    })
    p.on('close', codigo => {
      clearTimeout(relogio)
      if (codigo === 0) ok(saida)
      else erro(new Error(`o ${cmd} terminou com erro ${codigo}: ${(falhas || saida).trim().split('\n').slice(-3).join(' ').slice(0, 300)}`))
    })
    if (entrada != null) p.stdin.end(entrada)
    else p.stdin.end()
  })
}

// Pega o JSON de uma resposta em texto (tira ```json ... ``` e o que vier em volta).
function extrairJson(texto) {
  const t = String(texto || '')
  const ini = t.indexOf('{')
  const fim = t.lastIndexOf('}')
  if (ini < 0 || fim < ini) throw new Error('a resposta não trouxe o JSON do resumo')
  return JSON.parse(t.slice(ini, fim + 1))
}
