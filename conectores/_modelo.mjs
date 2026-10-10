// Modelo de conector. Copie este arquivo com outro nome (sem o "_" na frente),
// por exemplo conectores/notion.mjs, e preencha. Arquivos que começam com "_"
// são ignorados pelo caderno.

export default {
  nome: 'Meu conector',
  descricao: 'Uma frase dizendo o que ele traz pro caderno.',
  // variáveis do .env.local que precisam estar preenchidas pro conector ligar
  precisa: ['MEU_CONECTOR_CHAVE'],
  // passo a passo que aparece na tela Ajustes enquanto ele estiver desligado
  como: ['Onde pegar a chave.', 'Cole em MEU_CONECTOR_CHAVE no .env.local e reinicie o npm run dev.'],

  // Roda no seu computador (nunca no navegador), então a chave fica segura.
  // Devolve uma lista de itens. Só titulo e inicio são obrigatórios.
  async buscar(env) {
    const r = await fetch('https://api.exemplo.com/tarefas', {
      headers: { Authorization: `Bearer ${env.MEU_CONECTOR_CHAVE}` },
    })
    const tarefas = await r.json()
    return tarefas.map(t => ({
      titulo: t.nome,
      inicio: t.data, // "2026-10-20" (dia inteiro) ou "2026-10-20T14:00:00"
      diaInteiro: true,
      link: t.url, // opcional
      feito: t.concluida, // opcional
    }))
  },
}
