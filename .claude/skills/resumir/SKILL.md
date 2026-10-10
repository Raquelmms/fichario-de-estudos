---
name: resumir
description: Resume o material de uma aula do fichário (texto colado, PDF, link, slides, transcrição) e escreve a página da aula com grifos coloridos, post-its e teste rápido em dados/materias/<matéria>.json. Use quando a pessoa pedir pra resumir, grifar ou "passar a limpo" uma aula ou matéria.
argument-hint: <matéria> <aula> [material colado, caminho de arquivo ou link]
---

# /resumir

Escreve o resumo de uma aula direto no arquivo da matéria, no formato do `CLAUDE.md`.

## 1. Achar a aula

- `<matéria>`: o id ou o nome (aproximado) de um arquivo em `dados/materias/`.
- `<aula>`: o id, o número (na ordem das datas) ou o título aproximado de uma aula dessa matéria.
  Se não existir, crie uma aula nova (id de 6 letras/números aleatórios, `data` de hoje, título curto tirado do material).
- Se faltar a matéria e não der pra deduzir pelo assunto, pergunte.

## 2. Achar o material

Na ordem: o que veio depois do comando (texto, caminho de arquivo, link) → o campo `material` da aula
(o que a pessoa colou no painel "✨ resumir material" do app) → se não tiver nada, peça pra colar.
Leia tudo antes de escrever. Guarde o texto usado em `material` (se veio de arquivo/link, guarde a referência).

## 3. Escrever

- **`conteudo`** (HTML): em português do Brasil, com as suas palavras, claro e direto, como uma amiga que explica bem.
  Não invente nada que não esteja no material; citação literal só curta e entre aspas.
  Seções com `<h2>` na ordem do material; use `<p>`, `<ul>`/`<ol>` com `<li><p>…</p></li>`, `<strong>`, `<code>`, `<blockquote>`.
- **Grifos** com `<mark data-color="COR">…</mark>`, seguindo a legenda (a mesma de `src/grifos.js`):
  `#ffe066` importante · `#b2f2bb` definição · `#a5d8ff` exemplo · `#fcc2d7` cai na prova · `#ffd8a8` data, número ou fórmula · `#d0bfff` dúvida / revisar.
  Grife pouco: um ou dois grifos por parágrafo, no máximo.
- **`postits`**: 2 a 4 lembretes curtos (até 25 palavras), com macetes, analogias ou "cuidado com isso".
  Cada um: `{ "id", "cor", "texto", "x": 77, "y": 30 + 190 × posição, "r": 2 ou -2 }`, com `cor` entre amarelo, rosa, azul, verde, laranja, lilas.
- **`teste`**: 4 a 6 `{ "p", "r" }` de revisão, respostas de uma ou duas frases.

## 4. Gravar sem estragar o que já existe

- Se a aula já tem texto escrito pela pessoa, **não apague**: acrescente `<hr>` e o resumo depois.
- Mantenha os `adesivos` e os post-its que já estavam; acrescente os novos.
- Grave o JSON com 2 espaços e acentos direto (UTF-8). Com `npm run dev` rodando, a página atualiza sozinha.

No fim, diga em 2 ou 3 linhas o que entrou (seções, quantos grifos, post-its e perguntas) e o que ficou de fora do material.
