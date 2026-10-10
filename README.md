# 🗂️ Fichário de estudos

Um fichário de estudos que roda no seu computador, com cara de fichário de verdade: argolas, abas coloridas por
matéria, folha pautada, capa personalizada, post-its, adesivos e marca-texto de várias cores.

Serve pra faculdade, escola, curso online, certificação, idioma, concurso… qualquer coisa que tenha
**matérias → aulas → prazos**.

- **Matérias com capa personalizável**: cor, estampa (bolinhas, listras, xadrez…), emoji, etiqueta e adesivos que você arrasta
- **Aulas** em páginas pautadas: escreve e edita à vontade, com títulos, listas, tarefas `☑` e caneta colorida
- **Marca-texto em 6 cores**, cada uma com um significado (importante, definição, exemplo, cai na prova, número, dúvida)
- **Post-its e adesivos** que você cola e arrasta pela página (emojis, selos tipo "cai na prova" e fitas washi)
- **✨ Resumir material**: cola o texto da aula e ele vira uma página resumida, já grifada, com post-its e teste rápido
- **Prazos** com peso e nota (calcula sua média), próximo prazo em destaque e calendário
- **Conectores opcionais**: puxa eventos da sua agenda (Google, Outlook, Apple) e do Linear
- Tudo salvo em **arquivos JSON** na pasta `dados/`. Sem conta, sem banco, sem mensalidade

## Começar

1. Clique em **Use this template → Create a new repository** aqui no GitHub (pode ser privado).
2. Clone o seu repositório novo e rode:

```bash
npm install
npm run dev
```

O fichário abre no navegador com duas matérias de exemplo. Dá uma olhada e depois apague pelo link
**apagar matéria** no fim da página de cada uma.

Precisa do [Node.js](https://nodejs.org) 20 ou mais novo.

## Resumir material

Em cada aula, o botão **✨ resumir material** abre uma caixa pra colar o texto (livro, slides, transcrição,
anotações soltas). O material fica guardado na aula. Pra resumir, você tem duas opções:

- **Pelo Claude Code** (sem configurar nada): abra o Claude Code na pasta do fichário e rode
  `/resumir <matéria> <aula>`. Ele lê o material e escreve a página grifada, com post-its e teste rápido.
- **Pelo botão**: crie uma chave em [console.anthropic.com](https://console.anthropic.com/settings/keys),
  coloque `ANTHROPIC_API_KEY=…` no `.env.local` e reinicie o `npm run dev`. A API é paga por uso.

Ou escreva você mesma: a página é toda editável.

## Como ele salva

Enquanto o `npm run dev` está rodando, um servidorzinho local grava tudo o que você muda na tela direto nos
arquivos de `dados/`:

```
dados/
  fichario.json            nome do fichário
  materias/<matéria>.json  uma matéria por arquivo: capa, aulas, post-its, adesivos e prazos
```

O canto de cima mostra **✓ salvo** a cada mudança. Pra ter backup e histórico, use o git:

```bash
git add dados && git commit -m "anotações da semana" && git push
```

Também dá pra editar os JSON na mão ou pelo Claude Code. A página percebe e atualiza sozinha.

## Conectores (opcionais)

Copie `.env.exemplo` para `.env.local`, preencha o que quiser usar e reinicie o `npm run dev`.
A tela **ajustes** mostra o passo a passo.

| conector | traz | variável |
|---|---|---|
| Agenda (iCal) | eventos do Google Agenda, Outlook, Apple… | `AGENDA_ICS_URL` |
| Linear | issues com data de entrega | `LINEAR_API_KEY` |

Quer Notion, Todoist, Google Classroom? Copie `conectores/_modelo.mjs`. Detalhes em
[`conectores/README.md`](conectores/README.md). O caminho contrário também existe: **ajustes → baixar prazos.ics**
leva seus prazos pra sua agenda.

## Publicar online (opcional)

Dá pra publicar uma versão **só de leitura** no GitHub Pages (pra revisar no celular, por exemplo):

1. **Settings → Pages → Source: GitHub Actions**.
2. **Settings → Secrets and variables → Actions → Variables**: `PUBLICAR_PAGES` = `true`.
3. Dê um push. O site fica em `https://<seu-usuario>.github.io/<nome-do-repo>/`.

⚠️ O GitHub Pages é público mesmo com o repositório privado (a não ser em planos pagos).
Se suas anotações forem pessoais, use só o modo local.

## Personalizar mais

- Cores, fontes e o papel: começo de `src/estilo.css` (o modo escuro segue o do sistema).
- Adesivos: listas em `src/componentes/Adesivos.jsx`.
- Cores e significados do marca-texto: `src/grifos.js`.

## Estrutura

```
src/
  paginas/        Início, Matéria, Aula, Ajustes
  componentes/    Editor (texto + marca-texto), CamadaLivre (post-its e adesivos), Capa, Adesivos, Calendário
servidor/         servidor local: lê e grava dados/, roda conectores e o resumo com IA
conectores/       agenda.mjs, linear.mjs, _modelo.mjs
dados/            seus dados (JSON)
.claude/skills/   /resumir e /nova-materia pro Claude Code
```
