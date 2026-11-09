function downloadCalendar(match) {
  const escape = (text) => text.replace(/\\/g, '\\\\').replace(/\r\n|\r|\n/g, '\\n').replace(/[,;]/g, '\\$&')
  const start = `${match.date.replaceAll('-', '')}T${match.time.replaceAll(':', '').padEnd(6, '0')}`
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//FaltaUno//Partidos//ES',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:${match.id}@faltauno`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')}`,
    `DTSTART:${start}`,
    `SUMMARY:${escape(`Partido de ${match.sport}`)}`,
    `LOCATION:${escape(match.location)}`,
    `DESCRIPTION:${escape(`Nivel ${match.level}`)}`,
    'END:VEVENT',
    'END:VCALENDAR'
  ]
  const encoder = new TextEncoder()
  const content = lines.map((line) => {
    let result = ''
    let length = 0
    for (const character of line) {
      const size = encoder.encode(character).length
      if (length + size > 75) {
        result += '\r\n '
        length = 1
      }
      result += character
      length += size
    }
    return result
  }).join('\r\n') + '\r\n'

  const url = URL.createObjectURL(new Blob([content], { type: 'text/calendar;charset=utf-8' }))
  const link = document.createElement('a')
  link.href = url
  link.download = `faltauno-${match.id}.ics`
  document.body.appendChild(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

function MyMatchesPanel({ matches, myMatchIds, onCancel, loading }) {
  const joinedMatches = myMatchIds.map((id) => matches.find((match) => match.id === id)).filter(Boolean)

  return (
    <section className="my-matches-card p-4" aria-labelledby="my-matches-title">
      <div className="d-flex justify-content-between align-items-center mb-1">
        <h2 className="h5 fw-bold mb-0" id="my-matches-title">Mis partidos</h2>
        <span className="small text-secondary">{joinedMatches.length} {joinedMatches.length === 1 ? 'inscrito' : 'inscritos'}</span>
      </div>
      <p className="small text-secondary mb-3">Partidos a los que te has unido.</p>
      {joinedMatches.length === 0 ? <div className="empty-state py-4"><p className="small mb-0">Aún no te has inscrito.</p></div> : <ul className="list-unstyled d-grid gap-3 mb-0">
        {joinedMatches.map((match) => <li className="my-match-item" key={match.id}>
          <strong className="small">{match.sport} · {match.level}</strong>
          <p className="small text-secondary mb-2">{match.location}<br />{new Date(`${match.date}T12:00:00`).toLocaleDateString('es-CL')} · {match.time} hrs</p>
          <button type="button" className="btn btn-link btn-sm text-danger p-0" disabled={loading} onClick={() => onCancel(match.id)}>Dar de baja</button>
          <button type="button" className="btn btn-link btn-sm ms-3 p-0" onClick={() => downloadCalendar(match)}>Agendar en calendario</button>
        </li>)}
      </ul>}
    </section>
  )
}

export default MyMatchesPanel
