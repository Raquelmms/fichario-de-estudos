# Conectores

O caderno funciona sem nenhum conector. Eles servem pra puxar coisas de fora
e mostrar junto com os seus prazos: eventos da agenda, issues do Linear, etc.

| arquivo | traz | precisa no `.env.local` |
|---|---|---|
| `agenda.mjs` | eventos de qualquer agenda com link iCal (Google, Outlook, Apple…) | `AGENDA_ICS_URL` |
| `linear.mjs` | issues com data de entrega | `LINEAR_API_KEY` (e, se quiser, `LINEAR_PROJETO`) |

Conector sem a variável preenchida fica desligado. A tela **Ajustes** do caderno
mostra quais estão ligados e o passo a passo de cada um.

## Criar o seu

1. Copie `_modelo.mjs` para um nome novo, tipo `notion.mjs` ou `todoist.mjs`.
2. Preencha `nome`, `precisa` e a função `buscar(env)`, que devolve uma lista de
   `{ titulo, inicio, diaInteiro?, fim?, link?, feito? }`.
3. Coloque a chave no `.env.local` e reinicie o `npm run dev`.

Os conectores rodam no servidor local (no seu computador), então as chaves
nunca vão pro navegador. Eles só funcionam com `npm run dev`; a versão
publicada no GitHub Pages mostra só o que está em `dados/`.

Dá pra pedir pro Claude Code: *"cria um conector do Todoist seguindo o
conectores/_modelo.mjs"*.
