import { EDITAVEL } from '../dados.js'
import { baixarIcs } from '../ics.js'
import Campo from '../componentes/Campo.jsx'

export default function Ajustes({ ctx }) {
  const { dados, mudarCaderno, conectores, recarregarConectores } = ctx
  return (
    <section className="pagina">
      <h1 className="titulo-mao">Ajustes</h1>

      {EDITAVEL && (
        <div className="folha">
          <h2 className="sub-mao">O caderno</h2>
          <label className="dica" style={{ display: 'block' }}>
            título
            <Campo valor={dados.caderno.titulo} onSalvar={v => mudarCaderno(c => { c.titulo = v })} />
          </label>
          <label className="dica" style={{ display: 'block', marginTop: 10 }}>
            subtítulo
            <Campo valor={dados.caderno.subtitulo} onSalvar={v => mudarCaderno(c => { c.subtitulo = v })} />
          </label>
          <p className="dica" style={{ marginTop: 14 }}>
            Tudo o que você muda aqui vai pra pasta <code>dados/</code>, em arquivos JSON. Pra guardar uma versão (e mandar pro GitHub),
            faça <code>git add dados && git commit -m "anotações" && git push</code>.
          </p>
        </div>
      )}

      <div className="folha">
        <h2 className="sub-mao">Levar os prazos pra sua agenda</h2>
        <p>Baixa um arquivo <code>.ics</code> com todos os prazos (com lembrete 1 dia antes) pra importar no Google Agenda, Outlook ou Apple.</p>
        <button className="btn" onClick={() => baixarIcs(dados.cursos, dados.caderno.titulo)}>baixar prazos.ics</button>
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
