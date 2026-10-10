import { EDITAVEL } from '../dados.js'
import { baixarIcs } from '../ics.js'
import Campo from '../componentes/Campo.jsx'

export default function Ajustes({ ctx }) {
  const { dados, mudarFichario, conectores, recarregarConectores, ia } = ctx
  return (
    <section className="pagina">
      <h1 className="titulo-mao">Ajustes</h1>

      {EDITAVEL && (
        <div className="folha">
          <h2 className="sub-mao">O fichário</h2>
          <label className="dica" style={{ display: 'block' }}>
            título
            <Campo valor={dados.fichario.titulo} onSalvar={v => mudarFichario(f => { f.titulo = v })} />
          </label>
          <label className="dica" style={{ display: 'block', marginTop: 10 }}>
            subtítulo
            <Campo valor={dados.fichario.subtitulo} onSalvar={v => mudarFichario(f => { f.subtitulo = v })} />
          </label>
          <p className="dica" style={{ marginTop: 14 }}>
            Tudo o que você muda aqui vai pra pasta <code>dados/</code>, em arquivos JSON. Pra guardar uma versão (e mandar pro GitHub),
            faça <code>git add dados && git commit -m "anotações" && git push</code>.
          </p>
        </div>
      )}

      {EDITAVEL && (
        <div className="folha">
          <h2 className="sub-mao">Resumir com IA</h2>
          <p>
            O <b>✨ resumir</b> de cada aula usa o agente que você já tem instalado, com a sua assinatura. <b>Não precisa de chave.</b>
          </p>
          <p>
            Encontrei:{' '}
            {ia.agentes?.length ? ia.agentes.map(a => <span key={a.id} className="selo selo-ok" style={{ marginRight: 6 }}>{a.nome}</span>) : <span className="selo selo-off">nenhum agente</span>}
          </p>
          <p className="dica">
            Suportados: Claude Code (<code>claude</code>), Codex (<code>codex</code>), GitHub Copilot CLI (<code>copilot</code>) e Cursor CLI (<code>cursor-agent</code>).
            Pra deixar um como padrão, coloque <code>AGENTE=claude</code> (ou codex, copilot, cursor) no <code>.env.local</code>.
          </p>
          <p className="dica">
            Opcional: com <code>ANTHROPIC_API_KEY</code> no <code>.env.local</code>, a API do Claude também aparece na lista (paga por uso).{' '}
            {ia.api?.ativo ? <span className="selo selo-ok">API ligada · {ia.api.modelo}</span> : <span className="selo selo-off">API desligada</span>}
          </p>
        </div>
      )}

      <div className="folha">
        <h2 className="sub-mao">Levar os prazos pra sua agenda</h2>
        <p>Baixa um arquivo <code>.ics</code> com todos os prazos (com lembrete 1 dia antes) pra importar no Google Agenda, Outlook ou Apple.</p>
        <button className="btn" onClick={() => baixarIcs(dados.materias, dados.fichario.titulo)}>baixar prazos.ics</button>
        <p className="dica">Google Agenda: Configurações → Importar e exportar → Importar.</p>
      </div>

      <div className="linha-acoes" style={{ justifyContent: 'space-between' }}>
        <h2 className="sub-mao">Conectores</h2>
        {EDITAVEL && <button className="btn-claro" onClick={recarregarConectores}>buscar de novo</button>}
      </div>
      {!EDITAVEL ? (
        <p className="dica">Os conectores só funcionam com o caderno rodando no seu computador (<code>npm run dev</code>).</p>
      ) : (
        <>
          <p className="dica">
            Opcionais. Eles trazem coisas de fora pra aparecer junto com seus prazos. Cada um é um arquivo em <code>conectores/</code> e liga
            quando você preenche a chave dele no <code>.env.local</code>. Dá pra criar o seu a partir de <code>conectores/_modelo.mjs</code>.
          </p>
          <div className="conectores">
            {conectores.map(k => (
              <article key={k.id} className="conector">
                <h3>
                  {k.nome}
                  {k.erro ? <span className="selo selo-erro">erro</span> : k.ativo ? <span className="selo selo-ok">ligado · {k.itens?.length ?? 0} itens</span> : <span className="selo selo-off">desligado</span>}
                </h3>
                {k.descricao && <p>{k.descricao}</p>}
                {k.erro && <p className="selo-erro" style={{ border: 0 }}>⚠ {k.erro}</p>}
                {!k.ativo && k.como && (
                  <ol>{[].concat(k.como).map((passo, i) => <li key={i}>{passo}</li>)}</ol>
                )}
                {!k.ativo && <p className="dica">precisa de: {k.precisa?.map(v => <code key={v}>{v}</code>)}</p>}
              </article>
            ))}
          </div>
        </>
      )}
    </section>
  )
}
