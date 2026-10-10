---
name: novo-curso
description: Cria um curso novo no caderno (dados/cursos/<id>.json) a partir de uma ementa, plano de ensino, página do curso, PDF ou descrição solta. Use quando a pessoa pedir pra adicionar/montar/organizar um curso, matéria, trilha, livro ou certificação no caderno.
---

# /novo-curso

Monte um arquivo `dados/cursos/<id>.json` seguindo o formato do `CLAUDE.md`.

## Entrada

O que vier depois do comando: texto colado, link, caminho de arquivo (PDF, imagem da ementa) ou só o nome do curso.
Leia o material todo antes de escrever.

## Como montar

1. **id**: nome em minúsculas, sem acento, com hífens. Se já existir um arquivo com esse id, acrescente `-2`.
2. **Módulos**: um por unidade, semana, capítulo ou tópico da ementa, na ordem. `titulo` curto, em português (se o original for em outra língua, traduza e mantenha o original no resumo só se ajudar).
3. **Datas**: se a ementa tiver calendário, preencha `inicio`/`fim` de cada módulo e as `data` dos prazos (formato `AAAA-MM-DD` ou `AAAA-MM-DDTHH:MM`, no fuso da pessoa). Se não tiver, deixe os módulos sem data e não invente prazos.
4. **Prazos**: só os que aparecem no material (provas, trabalhos, entregas). `tipo` entre tarefa, prova, leitura, projeto, aula ou outro. Se a ementa trouxer a distribuição de pontos, use em `peso`.
5. **Resumo**: 2 a 4 itens por módulo, com o que será estudado, se o material disser. Senão, deixe `[]`. Não invente conteúdo.
6. `emoji` e `cor` que combinem com o assunto; evite repetir a cor de outro curso que já esteja em `dados/cursos/`.
7. `anotacoes` vazio e `feito: false` em tudo.

Depois de gravar, diga em 2 ou 3 linhas o que foi criado (quantos módulos, quantos prazos, o que ficou sem data)
e lembre que com `npm run dev` rodando o curso já aparece na tela.
