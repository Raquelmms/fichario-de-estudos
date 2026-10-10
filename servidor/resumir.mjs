// Resume o material de uma aula com a API do Claude.
// Só roda no servidor local, e só se ANTHROPIC_API_KEY estiver no .env.local.

import Anthropic from '@anthropic-ai/sdk'
import { z } from 'zod'
import { betaZodOutputFormat } from '@anthropic-ai/sdk/helpers/beta/zod'
import { GRIFOS, CORES_POSTIT } from '../src/grifos.js'

export const MODELO_PADRAO = 'claude-opus-5-5'

const Resumo = z.object({
  titulo: z.string().describe('título curto da aula, em português'),
  html: z.string().describe('o resumo em HTML, no formato pedido'),
  postits: z.array(z.object({ cor: z.enum(CORES_POSTIT), texto: z.string() })),
  teste: z.array(z.object({ p: z.string(), r: z.string() })),
})

const legenda = GRIFOS.map(g => `- <mark data-color="${g.cor}"> = ${g.nome}`).join('\n')

const INSTRUCOES = `Você ajuda estudantes a transformar o material de uma aula (texto de livro, slides, transcrição, anotações soltas) numa página de caderno bem resumida, em português do Brasil.

Escreva com as suas palavras, claro e direto, como uma amiga que explica bem. Não invente nada que não esteja no material. Citação literal só curta, entre aspas.

O campo "html" usa só estas tags: <h2>, <h3>, <p>, <ul>, <ol>, <li>, <strong>, <em>, <code>, <blockquote> e <mark data-color="...">. Organize em seções com <h2>, seguindo a ordem do material.

Grife com <mark data-color="COR">trecho</mark>, usando a legenda:
${legenda}
Grife pouco: só o que realmente importa, no máximo um ou dois grifos por parágrafo.

"postits": de 2 a 4 lembretes curtos (até 25 palavras cada) com macetes, analogias ou "cuidado com isso". A primeira linha pode ser um título curto.
"teste": de 4 a 6 perguntas de revisão com respostas de uma ou duas frases.`

export async function resumir({ material, materia, aula, env }) {
  const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY })
  const contexto = [materia && `Matéria: ${materia}`, aula && `Aula: ${aula}`].filter(Boolean).join('\n')

  const resposta = await client.beta.messages.parse({
    model: env.RESUMO_MODELO || MODELO_PADRAO,
    max_tokens: 16000,
    betas: ['server-side-fallback-2026-07-01'],
    fallbacks: 'default',
    output_config: { effort: 'medium', format: betaZodOutputFormat(Resumo) },
    system: INSTRUCOES,
    messages: [{ role: 'user', content: `${contexto}\n\n<material>\n${material}\n</material>` }],
  })

  if (resposta.stop_reason === 'refusal') throw new Error('o modelo recusou resumir esse material')
  if (resposta.stop_reason === 'max_tokens') throw new Error('o material é grande demais pra um resumo só; divida em partes')
  if (!resposta.parsed_output) throw new Error('a resposta veio num formato inesperado; tente de novo')
  return resposta.parsed_output
}
