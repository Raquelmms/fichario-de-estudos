import { useEffect, useRef } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Highlight from '@tiptap/extension-highlight'
import { TextStyle, Color } from '@tiptap/extension-text-style'
import { TaskList, TaskItem } from '@tiptap/extension-list'
import { Placeholder } from '@tiptap/extensions'
import { GRIFOS } from '../grifos.js'

const CANETAS = [
  { nome: 'preta', cor: null },
  { nome: 'azul', cor: '#2f62c9' },
  { nome: 'vermelha', cor: '#d23f4a' },
  { nome: 'verde', cor: '#1f8a55' },
  { nome: 'roxa', cor: '#7a4fc9' },
]

// Página de texto do caderno: escreve, grifa com 6 cores, muda a cor da caneta.
// Salva sozinha 0,6 s depois que você para de digitar.
// envolver: põe o texto dentro de outra coisa (a página com post-its e adesivos).
export default function Editor({ html, onSalvar, editavel, placeholder = 'Comece a escrever…', extras, envolver = t => t }) {
  const timer = useRef(null)
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] } }),
      Highlight.configure({ multicolor: true }),
      TextStyle,
      Color,
      TaskList,
      TaskItem.configure({ nested: true }),
      Placeholder.configure({ placeholder }),
    ],
    content: html || '',
    editable: editavel,
    shouldRerenderOnTransaction: true,
    onUpdate: ({ editor }) => {
      clearTimeout(timer.current)
      timer.current = setTimeout(() => onSalvar(editor.isEmpty ? '' : editor.getHTML()), 600)
    },
  })

  // Se o arquivo mudou por fora (Claude Code, resumo com IA), mostra o novo conteúdo.
  useEffect(() => {
    if (!editor || editor.isFocused) return
    const atual = editor.isEmpty ? '' : editor.getHTML()
    if ((html || '') !== atual) editor.commands.setContent(html || '', { emitUpdate: false })
  }, [html, editor])

  useEffect(() => () => clearTimeout(timer.current), [])

  if (!editor) return null
  const c = () => editor.chain().focus()
  const ativo = (nome, attrs) => (editor.isActive(nome, attrs) ? 'ativa' : '')

  return (
    <div className="editor">
      {editavel && (
        <div className="barra" role="toolbar" aria-label="formatação">
          <span className="grupo">
            <button className={`ferramenta ${ativo('bold')}`} onClick={() => c().toggleBold().run()} aria-label="negrito"><b>B</b></button>
            <button className={`ferramenta ${ativo('italic')}`} onClick={() => c().toggleItalic().run()} aria-label="itálico"><i>I</i></button>
            <button className={`ferramenta ${ativo('underline')}`} onClick={() => c().toggleUnderline().run()} aria-label="sublinhado"><u>S</u></button>
            <button className={`ferramenta ${ativo('heading', { level: 2 })}`} onClick={() => c().toggleHeading({ level: 2 }).run()} aria-label="título">T</button>
            <button className={`ferramenta ${ativo('heading', { level: 3 })}`} onClick={() => c().toggleHeading({ level: 3 }).run()} aria-label="subtítulo">t</button>
            <button className={`ferramenta ${ativo('bulletList')}`} onClick={() => c().toggleBulletList().run()} aria-label="lista">•</button>
            <button className={`ferramenta ${ativo('orderedList')}`} onClick={() => c().toggleOrderedList().run()} aria-label="lista numerada">1.</button>
            <button className={`ferramenta ${ativo('taskList')}`} onClick={() => c().toggleTaskList().run()} aria-label="lista de tarefas">☑</button>
            <button className={`ferramenta ${ativo('code')}`} onClick={() => c().toggleCode().run()} aria-label="código">{'</>'}</button>
          </span>

          <span className="grupo" aria-label="marca-texto">
            <span className="grupo-nome">grifar</span>
            {GRIFOS.map(g => (
              <button
                key={g.id}
                className={`marca-texto ${ativo('highlight', { color: g.cor })}`}
                style={{ '--grifo': g.cor }}
                title={g.nome}
                aria-label={`grifar de ${g.id} (${g.nome})`}
                onClick={() => c().toggleHighlight({ color: g.cor }).run()}
              />
            ))}
            <button className="ferramenta" onClick={() => c().unsetHighlight().run()} title="tirar grifo" aria-label="tirar grifo">⌫</button>
          </span>

          <span className="grupo" aria-label="caneta">
            <span className="grupo-nome">caneta</span>
            {CANETAS.map(k => (
              <button
                key={k.nome}
                className={`caneta ${k.cor ? ativo('textStyle', { color: k.cor }) : ''}`}
                style={{ '--caneta': k.cor || 'var(--tinta)' }}
                aria-label={`caneta ${k.nome}`}
                title={`caneta ${k.nome}`}
                onClick={() => (k.cor ? c().setColor(k.cor).run() : c().unsetColor().run())}
              />
            ))}
          </span>

          {extras && <span className="grupo grupo-extras">{extras}</span>}
        </div>
      )}
      {envolver(<EditorContent editor={editor} className="texto-aula" />)}
    </div>
  )
}
