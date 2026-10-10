import { useEffect, useState } from 'react'

// Campo que salva sozinho quando você sai dele (ou aperta Enter). Esc desfaz.
export default function Campo({ valor, onSalvar, multilinha = false, tipo = 'text', className = '', ...resto }) {
  const texto = valor == null ? '' : String(valor)
  const [rascunho, setRascunho] = useState(texto)
  useEffect(() => setRascunho(texto), [texto])

  const salvar = () => {
    if (rascunho === texto) return
    onSalvar(tipo === 'number' ? (rascunho === '' ? null : +rascunho) : rascunho)
  }
  const Tag = multilinha ? 'textarea' : 'input'
  return (
    <Tag
      className={`campo ${className}`}
      type={multilinha ? undefined : tipo}
      value={rascunho}
      onChange={e => setRascunho(e.target.value)}
      onBlur={salvar}
      onKeyDown={e => {
        if (e.key === 'Enter' && !multilinha) e.currentTarget.blur()
        if (e.key === 'Escape') setRascunho(texto)
      }}
      {...resto}
    />
  )
}
