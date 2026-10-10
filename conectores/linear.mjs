// Conector do Linear: mostra no caderno as issues com data de entrega.
// Só lê; nada é alterado no Linear.

export default {
  nome: 'Linear',
  descricao: 'Issues com data de entrega viram prazos no calendário.',
  precisa: ['LINEAR_API_KEY'],
  como: [
    'No Linear: Settings → Security & access → Personal API keys → New key.',
    'Cole a chave em LINEAR_API_KEY no .env.local. Quer só um projeto? Coloque o nome dele em LINEAR_PROJETO.',
    'Sem projeto, aparecem as issues atribuídas a você. Reinicie o npm run dev depois de salvar.',
  ],

  async buscar(env) {
    const campos = 'nodes { identifier title url dueDate state { type } project { name } }'
    const query = env.LINEAR_PROJETO
      ? `query($p: String!) { issues(first: 150, filter: { dueDate: { null: false }, project: { name: { eqIgnoreCase: $p } } }) { ${campos} } }`
      : `query { viewer { assignedIssues(first: 150, filter: { dueDate: { null: false } }) { ${campos} } } }`

    const r = await fetch('https://api.linear.app/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: env.LINEAR_API_KEY },
      body: JSON.stringify({ query, variables: env.LINEAR_PROJETO ? { p: env.LINEAR_PROJETO } : {} }),
    })
    const j = await r.json()
    if (j.errors) throw new Error(j.errors.map(e => e.message).join('; '))
    const nos = (j.data.issues ?? j.data.viewer.assignedIssues).nodes

    return nos.map(i => ({
      titulo: `${i.identifier} · ${i.title}`,
      inicio: i.dueDate,
      diaInteiro: true,
      link: i.url,
      feito: ['completed', 'canceled'].includes(i.state.type),
    }))
  },
}
