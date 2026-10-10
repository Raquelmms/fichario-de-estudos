import { lerData } from './datas.js'

// Gera um .ics com todos os prazos pra importar no Google Agenda, Outlook, Apple…
// Cada prazo vira um evento de 30 min que termina na hora do prazo, com lembrete 1 dia antes.
export function baixarIcs(materias, nome = 'Meu fichário') {
  const utc = d => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
  const esc = s => String(s).replace(/([,;\\])/g, '\\$1').replace(/\n/g, '\\n')
  const agora = utc(new Date())
  const linhas = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//caderno-de-estudos//PT-BR', `X-WR-CALNAME:${esc(nome)}`]
  for (const c of materias) {
    for (const p of c.prazos || []) {
      const fim = lerData(p.data)
      if (!fim) continue
      linhas.push(
        'BEGIN:VEVENT',
        `UID:${c.id}-${p.id}@fichario`,
        `DTSTAMP:${agora}`,
        `DTSTART:${utc(new Date(fim - 30 * 60000))}`,
        `DTEND:${utc(fim)}`,
        `SUMMARY:${esc(`${c.emoji || ''} ${c.nome} · ${p.titulo}`.trim())}`,
        ...(p.link ? [`URL:${p.link}`] : []),
        'BEGIN:VALARM', 'TRIGGER:-P1D', 'ACTION:DISPLAY', `DESCRIPTION:${esc(p.titulo)}`, 'END:VALARM',
        'END:VEVENT',
      )
    }
  }
  linhas.push('END:VCALENDAR')
  const url = URL.createObjectURL(new Blob([linhas.join('\r\n')], { type: 'text/calendar' }))
  const a = Object.assign(document.createElement('a'), { href: url, download: 'prazos.ics' })
  a.click()
  URL.revokeObjectURL(url)
}
