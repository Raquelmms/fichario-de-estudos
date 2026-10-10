---
name: nova-materia
description: Cria uma matéria nova no fichário (dados/materias/<id>.json) a partir de uma ementa, plano de ensino, página de curso, PDF ou só o nome, com capa, aulas e prazos. Use quando a pessoa pedir pra adicionar, montar ou organizar uma matéria, curso, livro ou trilha no fichário.
argument-hint: <ementa, link, arquivo ou nome da matéria>
---

# /nova-materia

Monte `dados/materias/<id>.json` no formato do `CLAUDE.md`.

1. **id**: nome em minúsculas, sem acento, com hífens. Se já existir, acrescente `-2`.
2. **Capa**: `emoji` que combine com o assunto; `cor` diferente das matérias que já existem; `capa.padrao` entre
   liso, bolinhas, listras, xadrez, quadriculado e diagonal; 1 ou 2 adesivos de enfeite
   (`{ "id", "tipo": "emoji", "valor": "✨", "x": 20–80, "y": 10–40, "r": -15–15, "s": 1 }`, x e y em % da capa).
3. **Aulas**: uma por aula, semana, unidade ou capítulo da ementa, na ordem, com `titulo` curto em português,
   `data` se a ementa tiver calendário (`AAAA-MM-DD`), `conteudo` vazio, e `postits`, `adesivos` e `teste` como `[]`.
   Se a ementa disser o que cada aula cobre, coloque em `material` (a pessoa pode rodar `/resumir` depois).
4. **Prazos**: só os que aparecem no material (provas, trabalhos, entregas), com `tipo`, `data` e `peso` se houver.
   Não invente datas.
5. `professor` se aparecer no material.

No fim, diga em 2 ou 3 linhas o que foi criado e o que ficou sem data.
