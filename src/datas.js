// Datas no fuso do computador. Prazo só com dia ("2026-10-20") vale até 23:59.
export const lerData = s => (s ? new Date(s.length === 10 ? s + 'T23:59' : s) : null)
export const chaveDia = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

const fmt = op => new Intl.DateTimeFormat('pt-BR', op)
export const diaMes = d => fmt({ day: '2-digit', month: '2-digit' }).format(d)
export const diaSemana = d => fmt({ weekday: 'long' }).format(d)
export const diaSemanaCurto = d => fmt({ weekday: 'short' }).format(d).replace('.', '')
export const hora = d => fmt({ hour: '2-digit', minute: '2-digit' }).format(d)

export function falta(prazo, agora = new Date()) {
  const ms = prazo - agora
  if (ms <= 0) return 'já passou'
  const h = Math.floor(ms / 3600000)
  const d = Math.floor(h / 24)
  if (d >= 2) return `${d} dias`
  if (h >= 1) return `${h}h ${Math.floor((ms % 3600000) / 60000)}min`
  return `${Math.floor(ms / 60000)} min`
}

// "hoje", "amanhã" ou "qui 16/10"
export function quandoCurto(d, agora = new Date()) {
  const dias = Math.round((new Date(chaveDia(d) + 'T12:00') - new Date(chaveDia(agora) + 'T12:00')) / 864e5)
  if (dias === 0) return 'hoje'
  if (dias === 1) return 'amanhã'
  if (dias === -1) return 'ontem'
  return `${diaSemanaCurto(d)} ${diaMes(d)}`
}
