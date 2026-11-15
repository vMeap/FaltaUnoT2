function descargarCalendario(partido) {
  const escaparTexto = (texto) => texto.replace(/\\/g, '\\\\').replace(/\r\n|\r|\n/g, '\\n').replace(/[,;]/g, '\\$&')
  const inicio = `${partido.date.replaceAll('-', '')}T${partido.time.replaceAll(':', '').padEnd(6, '0')}`
  const lineas = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//FaltaUno//Partidos//ES',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:${partido.id}@faltauno`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')}`,
    `DTSTART:${inicio}`,
    `SUMMARY:${escaparTexto(`Partido de ${partido.sport}`)}`,
    `LOCATION:${escaparTexto(partido.location)}`,
    `DESCRIPTION:${escaparTexto(`Nivel ${partido.level}`)}`,
    'END:VEVENT',
    'END:VCALENDAR'
  ]
  const codificador = new TextEncoder()
  const contenido = lineas.map((linea) => {
    let resultado = ''
    let longitudLinea = 0
    for (const caracter of linea) {
      const tamano = codificador.encode(caracter).length
      if (longitudLinea + tamano > 75) {
        resultado += '\r\n '
        longitudLinea = 1
      }
      resultado += caracter
      longitudLinea += tamano
    }
    return resultado
  }).join('\r\n') + '\r\n'

  const direccion = URL.createObjectURL(new Blob([contenido], { type: 'text/calendar;charset=utf-8' }))
  const enlace = document.createElement('a')
  enlace.href = direccion
  enlace.download = `faltauno-${partido.id}.ics`
  document.body.appendChild(enlace)
  enlace.click()
  enlace.remove()
  setTimeout(() => URL.revokeObjectURL(direccion), 1000)
}

function PanelMisPartidos({ matches: partidos, myMatchIds: idsMisPartidos, onCancel: alCancelar, loading: cargando }) {
  const partidosInscritos = idsMisPartidos.map((identificador) => partidos.find((partido) => partido.id === identificador)).filter(Boolean)

  return (
    <section className="my-matches-card p-4" aria-labelledby="my-matches-title">
      <div className="d-flex justify-content-between align-items-center mb-1">
        <h2 className="h5 fw-bold mb-0" id="my-matches-title">Mis partidos</h2>
        <span className="small text-secondary">{partidosInscritos.length} {partidosInscritos.length === 1 ? 'inscrito' : 'inscritos'}</span>
      </div>
      <p className="small text-secondary mb-3">Partidos a los que te has unido.</p>
      {partidosInscritos.length === 0 ? <div className="empty-state py-4"><p className="small mb-0">Aún no te has inscrito.</p></div> : <ul className="list-unstyled d-grid gap-3 mb-0">
        {partidosInscritos.map((partido) => <li className="my-match-item" key={partido.id}>
          <strong className="small">{partido.sport} · {partido.level}</strong>
          <p className="small text-secondary mb-2">{partido.location}<br />{new Date(`${partido.date}T12:00:00`).toLocaleDateString('es-CL')} · {partido.time} hrs</p>
          <button type="button" className="btn btn-link btn-sm text-danger p-0" disabled={cargando} onClick={() => alCancelar(partido.id)}>Dar de baja</button>
          <button type="button" className="btn btn-link btn-sm ms-3 p-0" onClick={() => descargarCalendario(partido)}>Agendar en calendario</button>
        </li>)}
      </ul>}
    </section>
  )
}

export default PanelMisPartidos
