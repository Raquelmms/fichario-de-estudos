# 📓 Caderno de estudos

Um caderno de estudos que roda no seu computador, com cara de caderno de verdade:
folha pautada, post-it, marca-texto e título escrito à mão.

Serve pra faculdade, curso online, certificação, bootcamp, livro técnico, idioma,
concurso… qualquer coisa que tenha **cursos → módulos → prazos**.

- **Cursos e módulos** com resumo, palavras-chave e anotações em Markdown (com caixinhas `- [ ]` clicáveis)
- **Prazos** com tipo, data, peso e nota. Se tiver peso, ele calcula sua média ponderada
- **Próximo prazo** em destaque, lista dos próximos 14 dias e calendário do mês
- **Leituras grifadas**: o texto de estudo com grifos, post-its na margem e flashcards no final
- **Conectores opcionais**: puxa eventos da sua agenda (Google, Outlook, Apple) e issues do Linear, e dá pra criar outros
- **Exporta os prazos em `.ics`** pra importar na sua agenda, com lembrete 1 dia antes
- Tudo salvo em **arquivos JSON** na pasta `dados/`. Sem conta, sem banco, sem mensalidade

## Começar

1. Clique em **Use this template → Create a new repository** aqui no GitHub (pode ser privado).
2. Clone o seu repositório novo e rode:

```bash
npm install
npm run dev
```

O caderno abre no navegador. Ele vem com um curso de exemplo (*Git e GitHub do zero*):
dá uma olhada e depois apague pelo link **apagar curso** no fim da página dele.

Precisa do [Node.js](https://nodejs.org) 20 ou mais novo.

## Como ele salva

Enquanto o `npm run dev` está rodando, um servidorzinho local grava o que você
edita na tela direto nos arquivos de `dados/`:

```
dados/
  caderno.json            título e subtítulo
  cursos/<curso>.json     um arquivo por curso: módulos, prazos, notas, anotações
  leituras/<curso>-<n>.json   leituras grifadas (opcional)
```

O canto de cima da tela mostra **✓ salvo** a cada mudança. Pra ter backup e
histórico, é só usar o git:

```bash
git add dados && git commit -m "anotações da semana" && git push
```

Também dá pra editar os JSON na mão (ou pedir pro Claude Code). A página percebe
a mudança e atualiza sozinha.

## Conectores (opcionais)

O caderno funciona sem nenhum. Pra ligar um, copie `.env.exemplo` para `.env.local`,
preencha a chave do conector e reinicie o `npm run dev`. A tela **Ajustes** mostra
o passo a passo de cada um.

| conector | traz | variável |
|---|---|---|
| Agenda (iCal) | eventos do Google Agenda, Outlook, Apple… | `AGENDA_ICS_URL` |
| Linear | issues com data de entrega | `LINEAR_API_KEY` |

Quer Notion, Todoist, Google Classroom? Copie `conectores/_modelo.mjs` e preencha
a função `buscar`. Detalhes em [`conectores/README.md`](conectores/README.md).
O `.env.local` nunca vai pro GitHub.

## Com o Claude Code

O repositório já vem com o [`CLAUDE.md`](CLAUDE.md), que explica o formato dos dados,
e com duas skills:

- `/novo-curso <ementa, link ou texto>` monta o curso inteiro, com módulos, datas e prazos.
- `/nova-leitura <curso> <módulo> <PDF, link ou texto>` transforma o material numa leitura grifada.

## Publicar online (opcional)

Dá pra publicar uma versão **só de leitura** no GitHub Pages (pra ver no celular,
por exemplo). Nela não dá pra editar, e os conectores ficam de fora.

1. No GitHub: **Settings → Pages → Source: GitHub Actions**.
2. **Settings → Secrets and variables → Actions → Variables → New variable**:
   `PUBLICAR_PAGES` = `true`.
3. Dê um push. O site fica em `https://<seu-usuario>.github.io/<nome-do-repo>/`.

⚠️ O GitHub Pages é público mesmo com o repositório privado (a não ser em planos pagos).
Se suas anotações forem pessoais, use só o modo local.

## Mudar o visual

Cores, fontes e o papel pautado ficam todos no começo de `src/estilo.css`.
O modo escuro segue o do sistema.

## Estrutura

```
src/              o app (React + Vite)
  paginas/        Início, Curso, Módulo, Ajustes
  componentes/    Leitura grifada, Calendário, Campo editável, Markdown
servidor/         o servidor local que lê e grava dados/ e roda os conectores
conectores/       agenda.mjs, linear.mjs, _modelo.mjs
dados/            seus dados (JSON)
```
