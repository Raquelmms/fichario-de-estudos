# Fichário de estudos

App React + Vite. O conteúdo fica todo em `dados/` (JSON); o código raramente precisa mudar.
Com `npm run dev` rodando, a página recarrega sozinha quando um arquivo de `dados/` muda.

Escreva em português do Brasil. JSON sempre com 2 espaços de indentação e UTF-8 (acentos direto, sem `é`).
Skills: `/resumir` (resumo de uma aula) e `/nova-materia` (matéria a partir de uma ementa).

## dados/fichario.json

```json
{ "titulo": "Meu fichário", "subtitulo": "frase curta" }
```

## dados/materias/<id>.json

O nome do arquivo é o `id` (minúsculas, hífens, sem acento).

```json
{
  "id": "calculo-1",
  "nome": "Cálculo I",
  "professor": "Ana",
  "emoji": "📐",
  "cor": "azul",                         // azul · vermelho · verde · roxo · laranja · rosa · amarelo · cinza
  "capa": {
    "padrao": "bolinhas",                // liso · bolinhas · listras · xadrez · quadriculado · diagonal
    "adesivos": [ /* ver Adesivos; x e y em % da capa */ ]
  },
  "aulas": [
    {
      "id": "k3j9xa",                    // 6 letras/números, único na matéria
      "titulo": "Limites",
      "data": "2026-10-05",              // ordena as aulas e aparece no calendário
      "conteudo": "<h2>…</h2><p>…</p>",  // HTML da página (ver abaixo)
      "postits": [{ "id": "p1", "cor": "amarelo", "texto": "lembrete\ncom quebra", "x": 77, "y": 30, "r": 2 }],
      "adesivos": [],                    // x em % da largura, y em px a partir do topo da página
      "material": "texto colado pra resumir",
      "teste": [{ "p": "pergunta", "r": "resposta" }]
    }
  ],
  "prazos": [
    {
      "id": "p1",
      "titulo": "Lista 1",
      "tipo": "tarefa",                  // tarefa · prova · leitura · projeto · aula · outro
      "data": "2026-10-11T23:59",        // ou só "2026-10-11" (vale até 23:59)
      "peso": 20,                        // opcional; com peso e nota sai a média ponderada
      "nota": 85,                        // opcional
      "link": "https://…",               // opcional
      "feito": false
    }
  ]
}
```

### HTML do `conteudo`

Tags: `<h2>`, `<h3>`, `<p>`, `<ul>`/`<ol>` com `<li><p>…</p></li>`, `<strong>`, `<em>`, `<u>`, `<code>`, `<blockquote>`, `<hr>`.
Lista de tarefas: `<ul data-type="taskList"><li data-type="taskItem" data-checked="false"><label><input type="checkbox"><span></span></label><div><p>…</p></div></li></ul>`.

Grifo: `<mark data-color="#ffe066">trecho</mark>`. A legenda das cores (em `src/grifos.js`):

| cor | significa |
|---|---|
| `#ffe066` amarelo | importante |
| `#b2f2bb` verde | definição |
| `#a5d8ff` azul | exemplo |
| `#fcc2d7` rosa | cai na prova |
| `#ffd8a8` laranja | data, número ou fórmula |
| `#d0bfff` lilás | dúvida / revisar |

Caneta colorida: `<span style="color: #2f62c9">…</span>`.

### Post-its

`cor`: amarelo · rosa · azul · verde · laranja · lilas. Na página de aula, `x` é % da largura (77 = margem direita)
e `y` é px a partir do topo do papel; `r` é a inclinação em graus.

### Adesivos

```json
{ "id": "a1", "tipo": "emoji", "valor": "⭐", "x": 50, "y": 20, "r": -10, "s": 1 }
{ "id": "a2", "tipo": "selo", "valor": "cai na prova", "cor": "rosa", "x": 80, "y": 300, "r": 6, "s": 1 }
{ "id": "a3", "tipo": "fita", "valor": "listrada", "x": 50, "y": 4, "r": -4, "s": 1 }
```

`s` é a escala (0.5 a 3). Selos e fitas disponíveis estão em `src/componentes/Adesivos.jsx`.

## Resumo com IA

`servidor/resumir.mjs` chama a API do Claude (`claude-opus-5-5`, ou `RESUMO_MODELO` do `.env.local`) com saída
estruturada `{ titulo, html, postits, teste }`. Só liga com `ANTHROPIC_API_KEY` no `.env.local`.

## Conectores

`conectores/*.mjs` (os que começam com `_` são ignorados). Cada um exporta
`{ nome, descricao, precisa: ['VAR'], como: ['passo'], async buscar(env) }`, e `buscar`
devolve `[{ titulo, inicio, diaInteiro?, fim?, link?, feito? }]`. Modelo em `conectores/_modelo.mjs`.
Rodam só no servidor local (`servidor/plugin.mjs`); chaves ficam no `.env.local`.
