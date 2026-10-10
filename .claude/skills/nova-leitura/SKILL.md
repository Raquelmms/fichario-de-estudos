---
name: nova-leitura
description: Transforma um material de estudo (PDF, capítulo, artigo, link, anotações) numa leitura grifada do caderno (dados/leituras/<curso>-<n>.json), com grifos, post-its e teste rápido. Use quando a pessoa pedir pra grifar, resumir ou "fazer a leitura" de um módulo.
argument-hint: <curso> <módulo> <PDF, link ou texto>
---

# /nova-leitura

Crie `dados/leituras/<curso>-<n>.json` no formato de leitura grifada do `CLAUDE.md`.

## Entrada

`<curso>` é o id (ou nome aproximado) de um curso em `dados/cursos/`; `<n>` é o número do módulo.
O resto é o material. Se faltar o curso ou o módulo, veja os cursos existentes e escolha o que bate com o assunto;
só pergunte se não der pra saber.

## Como escrever

- **Leia o material inteiro** antes de começar. Não invente nada que não esteja nele.
- Escreva com as suas palavras, em português, num tom de caderno de amiga: claro e direto.
  Citações literais só curtas (uma frase), em `def.original` ou `citacao`, com a página.
- **Seções** seguem a ordem do material: de 3 a 6 seções, cada uma com 3 a 8 blocos.
- **Grifos com moderação**: `==amarelo==` só no que cairia na prova (1 ou 2 por parágrafo, no máximo);
  `++verde++` pra termos definidos.
- Use `def` pra cada conceito-chave, `tabela` pra comparações, `fluxo` pra processos em etapas,
  `postit` pra macetes, exemplos do dia a dia e "cuidado com isso". Cerca de 1 post-it por seção.
- `ideia`: a ideia central em uma frase.
- `teste`: de 4 a 8 perguntas curtas, com respostas de uma ou duas frases, cobrindo as seções.
- `referencias`: no formato que o curso usa (APA se não souber), com página/capítulo quando houver.
- `minutos`: estimativa honesta pra ler a leitura grifada (não o original).

No fim, diga o caminho do arquivo e o que ficou de fora do material, se algo ficou.
