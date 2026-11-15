export function fechaPartido(dias = 0, ahora = new Date()) {
  const hoy = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Santiago', year: 'numeric', month: '2-digit', day: '2-digit'
  }).format(ahora)
  const fecha = new Date(`${hoy}T12:00:00Z`)
  fecha.setUTCDate(fecha.getUTCDate() + dias)
  return fecha.toISOString().slice(0, 10)
}

export function esFechaPartidoValida(fecha) {
  if (typeof fecha !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(fecha)) return false
  const interpretado = new Date(`${fecha}T12:00:00Z`)
  return !Number.isNaN(interpretado.getTime()) && interpretado.toISOString().slice(0, 10) === fecha &&
    fecha >= fechaPartido() && fecha <= fechaPartido(14)
}
