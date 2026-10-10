// Conector de agenda: lê qualquer calendário que tenha um link iCal (.ics).
// Serve pra Google Agenda, Outlook, Apple, Notion Calendar, agenda da faculdade…

const DIAS_ANTES = 30
const DIAS_DEPOIS = 120

export default {
  nome: 'Agenda (iCal)',
  descricao: 'Mostra os eventos da sua agenda junto com os prazos do caderno.',
  precisa: ['AGENDA_ICS_URL'],
  como: [
    'Google Agenda: Configurações → clique na agenda → Integrar agenda → "Endereço secreto no formato iCal".',
    'Outlook: Configurações → Calendário → Calendários compartilhados → Publicar um calendário → link ICS.',
    'Cole o link em AGENDA_ICS_URL no arquivo .env.local (mais de um? separe por espaço) e reinicie o npm run dev.',
  ],

  async buscar(env) {
    const urls = env.AGENDA_ICS_URL.split(/[\s,]+/).filter(Boolean)
    const listas = await Promise.all(
      urls.map(async url => {
        const r = await fetch(url.replace(/^webcal:/, 'https:'))
        if (!r.ok) throw new Error(`a agenda respondeu ${r.status}`)
        return lerIcs(await r.text())
      }),
    )
    const de = Date.now() - DIAS_ANTES * 864e5
    const ate = Date.now() + DIAS_DEPOIS * 864e5
    return listas.flat().filter(e => {
      const t = new Date(e.inicio).getTime()
      return t >= de && t <= ate
    })
  },
}

// Leitor de .ics bem simples: pega título, início, fim e link de cada evento.
// Eventos que se repetem (RRULE) aparecem só na primeira data.
export function lerIcs(texto) {
  const linhas = texto.replace(/\r?\n[ \t]/g, '').split(/\r?\n/)
  const eventos = []
  let atual = null
  for (const linha of linhas) {
    if (linha === 'BEGIN:VEVENT') atual = {}
    else if (linha === 'END:VEVENT') {
      if (atual?.inicio) eventos.push(atual)
      atual = null
    } else if (atual) {
      const i = linha.indexOf(':')
      if (i < 0) continue
      const [nome] = linha.slice(0, i).split(';')
      const valor = linha.slice(i + 1)
      if (nome === 'SUMMARY') atual.titulo = desescapar(valor)
      else if (nome === 'URL') atual.link = valor
      else if (nome === 'DTSTART') Object.assign(atual, lerData(valor, 'inicio'))
      else if (nome === 'DTEND') Object.assign(atual, lerData(valor, 'fim'))
    }
  }
  return eventos.map(e => ({ titulo: e.titulo || '(sem título)', inicio: e.inicio, fim: e.fim, diaInteiro: !!e.diaInteiro, link: e.link }))
}

const desescapar = s => s.replace(/\\n/gi, '\n').replace(/\\([,;\\])/g, '$1')

// 20261010 → dia inteiro · 20261010T130000Z → UTC · 20261010T130000 (com TZID) → horário local
function lerData(v, campo) {
  const m = v.match(/^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})(Z)?)?$/)
  if (!m) return {}
  const [, a, me, d, h, mi, s, z] = m
  if (!h) return { [campo]: `${a}-${me}-${d}`, ...(campo === 'inicio' && { diaInteiro: true }) }
  return { [campo]: `${a}-${me}-${d}T${h}:${mi}:${s}${z ? 'Z' : ''}` }
}
