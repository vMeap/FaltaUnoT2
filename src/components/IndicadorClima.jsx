import { useEffect, useState } from 'react'
import { consultarClimaPartido, obtenerDisponibilidadPronostico, tieneCoordenadas, DIAS_MAXIMOS_PRONOSTICO } from '../services/weatherService.js'
import './IndicadorClima.css'

function obtenerMensajeAlternativo(latitud, longitud, fecha, hora) {
  if (!tieneCoordenadas(latitud, longitud)) return 'Clima no disponible'

  const disponibilidad = obtenerDisponibilidadPronostico(fecha, hora)
  if (disponibilidad === 'available') return null
  if (disponibilidad === 'too-far') return `Pronóstico disponible ${DIAS_MAXIMOS_PRONOSTICO - 1} días antes del partido`
  if (disponibilidad === 'past') return 'Sin pronóstico: la fecha ya pasó'
  return 'Clima no disponible'
}

function IndicadorClima({ latitude: latitud, longitude: longitud, date: fecha, time: hora }) {
  const [resultado, establecerResultado] = useState(null)
  const [intento, establecerIntento] = useState(0)

  const mensajeAlternativo = obtenerMensajeAlternativo(latitud, longitud, fecha, hora)
  const claveSolicitud = [latitud, longitud, fecha, hora, intento].join('|')

  useEffect(() => {
    if (mensajeAlternativo) return undefined
    const controlador = new AbortController()

    consultarClimaPartido({ latitude: latitud, longitude: longitud, date: fecha, time: hora }, { signal: controlador.signal })
      .then((clima) => establecerResultado({ key: claveSolicitud, weather: clima, failed: false }))
      .catch((error) => {
        if (error.name === 'AbortError') return
        console.error('No se pudo obtener el clima:', error)
        establecerResultado({ key: claveSolicitud, weather: null, failed: true })
      })

    return () => controlador.abort()
  }, [latitud, longitud, fecha, hora, claveSolicitud, mensajeAlternativo])

  if (mensajeAlternativo) {
    return <p className="weather-badge weather-badge-muted">{mensajeAlternativo}</p>
  }

  if (resultado?.key !== claveSolicitud) {
    return <p className="weather-badge weather-badge-loading" role="status">Cargando clima...</p>
  }

  if (resultado.failed) {
    return (
      <div className="weather-badge weather-badge-error" role="alert">
        <span>No se pudo cargar el clima</span>
        <button type="button" className="btn btn-sm btn-outline-danger rounded-pill" onClick={() => establecerIntento((actual) => actual + 1)}>Reintentar</button>
      </div>
    )
  }

  if (!resultado.weather) {
    return <p className="weather-badge weather-badge-muted">Sin pronóstico para esa hora</p>
  }

  const { temperature: temperatura, description: descripcion, precipitationProbability: probabilidadLluvia, windSpeed: velocidadViento } = resultado.weather

  return (
    <div className="weather-badge">
      <p className="weather-badge-main"><strong>{temperatura} °C</strong> {descripcion}</p>
      <p className="weather-badge-details">
        {probabilidadLluvia !== null && <span>Lluvia {probabilidadLluvia} %</span>}
        {velocidadViento !== null && <span>Viento {velocidadViento} km/h</span>}
        <a href="https://open-meteo.com/" target="_blank" rel="noreferrer">Datos: Open-Meteo.com</a>
      </p>
    </div>
  )
}

export default IndicadorClima
