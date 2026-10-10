# Caderno de estudos

App React + Vite. O conteúdo fica todo em `dados/` (JSON); o código raramente precisa mudar.
Com `npm run dev` rodando, a página recarrega sozinha quando um arquivo de `dados/` muda.

Escreva em português do Brasil. JSON sempre com 2 espaços de indentação e UTF-8 (acentos direto, sem `é`).

## dados/caderno.json

```json
{ "titulo": "Meu caderno de estudos", "subtitulo": "frase curta" }
```

## dados/cursos/<id>.json

O nome do arquivo é o `id` (minúsculas, hífens, sem acento).

```json
{
  "id": "calculo-1",
  "nome": "Cálculo I",
  "codigo": "MAT101",            // sigla curta pro menu; opcional
  "emoji": "📐",
  "cor": "azul",                  // azul · vermelho · verde · roxo · laranja · rosa
  "onde": "faculdade",            // texto livre; opcional
  "link": "https://…",            // opcional
  "modulos": [
    {
      "n": 1,                     // 1, 2, 3… em sequência
      "titulo": "Limites",
      "inicio": "2026-10-05",     // opcional; com início e fim o caderno sabe o módulo atual
      "fim": "2026-10-11",
      "resumo": ["uma ideia por item, aceita **negrito** e `código`"],
      "chaves": ["palavras", "chave"],
      "anotacoes": "Markdown livre. - [ ] vira caixinha clicável.",
      "feito": false
    }
  ],
  "prazos": [
    {
      "id": "p1",                 // único dentro do curso
      "titulo": "Lista 1",
      "tipo": "tarefa",           // tarefa · prova · leitura · projeto · aula · outro
      "data": "2026-10-11T23:59", // ou só "2026-10-11" (vale até 23:59)
      "modulo": 1,                // ou null
      "peso": 20,                 // opcional; com peso e nota sai a média ponderada
      "nota": 85,                 // opcional
      "link": "https://…",        // opcional
      "feito": false
    }
  ]
}
```

## dados/leituras/<curso>-<n>.json (leitura grifada)

```json
{
  "curso": "calculo-1",
  "modulo": 1,
  "titulo": "Nome do livro ou texto",
  "autores": "…",
  "capitulos": "Cap. 2 (pp. 30–45)",
  "minutos": 15,
  "link": "https://… (opcional)",
  "ideia": "A ideia central numa frase, com ==grifo==.",
  "secoes": [
    { "id": "slug-curto", "titulo": "Título da seção", "pagina": "30", "blocos": [ … ] }
  ],
  "teste": [{ "p": "pergunta", "r": "resposta" }],
  "referencias": ["Referência no formato que o curso pede (APA, ABNT…)."]
}
```

Texto dentro dos blocos aceita: `==grifo amarelo==` (o mais importante), `++grifo verde++` (definições),
`**negrito**`, `*itálico*`, `` `código` `` e `\n` pra quebra de linha.

Blocos (`t` = tipo):

| t | campos | uso |
|---|---|---|
| `p` | `texto` | parágrafo |
| `subtitulo` | `texto` | subtítulo dentro da seção |
| `def` | `termo`, `original` (citação literal, opcional), `pt` | definição |
| `postit` | `cor` (amarelo · rosa · azul · verde), `titulo`, `texto` | dica, exemplo ou macete; vai pra margem |
| `citacao` | `texto`, `fonte` | citação em destaque |
| `lista` | `itens`, `numerada` | lista |
| `tabela` | `cab` (array), `linhas` (array de arrays) | comparação |
| `fluxo` | `passos` (array) | sequência com setas |
| `codigo` | `texto` | bloco de código |
| `imagem` | `src`, `alt`, `legenda` | imagem (coloque o arquivo em `public/`) |

## Conectores

`conectores/*.mjs` (os que começam com `_` são ignorados). Cada um exporta
`{ nome, descricao, precisa: ['VAR'], como: ['passo'], async buscar(env) }`, e `buscar`
devolve `[{ titulo, inicio, diaInteiro?, fim?, link?, feito? }]`. Modelo em `conectores/_modelo.mjs`.
Rodam só no servidor local (`servidor/plugin.mjs`); chaves ficam no `.env.local`.
