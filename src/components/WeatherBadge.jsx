import { useEffect, useState } from 'react'
import { fetchMatchWeather, getForecastAvailability, hasCoordinates, MAX_FORECAST_DAYS } from '../services/weatherService.js'
import './WeatherBadge.css'

function getFallbackMessage(latitude, longitude, date, time) {
  if (!hasCoordinates(latitude, longitude)) return 'Clima no disponible'

  const availability = getForecastAvailability(date, time)
  if (availability === 'available') return null
  if (availability === 'too-far') return `Pronóstico disponible ${MAX_FORECAST_DAYS - 1} días antes del partido`
  if (availability === 'past') return 'Sin pronóstico: la fecha ya pasó'
  return 'Clima no disponible'
}

function WeatherBadge({ latitude, longitude, date, time }) {
  const [result, setResult] = useState(null)
  const [attempt, setAttempt] = useState(0)

  const fallbackMessage = getFallbackMessage(latitude, longitude, date, time)
  const requestKey = [latitude, longitude, date, time, attempt].join('|')

  useEffect(() => {
    if (fallbackMessage) return undefined
    const controller = new AbortController()

    fetchMatchWeather({ latitude, longitude, date, time }, { signal: controller.signal })
      .then((weather) => setResult({ key: requestKey, weather, failed: false }))
      .catch((error) => {
        if (error.name === 'AbortError') return
        console.error('No se pudo obtener el clima:', error)
        setResult({ key: requestKey, weather: null, failed: true })
      })

    return () => controller.abort()
  }, [latitude, longitude, date, time, requestKey, fallbackMessage])

  if (fallbackMessage) {
    return <p className="weather-badge weather-badge-muted">{fallbackMessage}</p>
  }

  if (result?.key !== requestKey) {
    return <p className="weather-badge weather-badge-loading" role="status">Cargando clima...</p>
  }

  if (result.failed) {
    return (
      <div className="weather-badge weather-badge-error" role="alert">
        <span>No se pudo cargar el clima</span>
        <button type="button" className="btn btn-sm btn-outline-danger rounded-pill" onClick={() => setAttempt((current) => current + 1)}>Reintentar</button>
      </div>
    )
  }

  if (!result.weather) {
    return <p className="weather-badge weather-badge-muted">Sin pronóstico para esa hora</p>
  }

  const { temperature, description, precipitationProbability, windSpeed } = result.weather

  return (
    <div className="weather-badge">
      <p className="weather-badge-main"><strong>{temperature} °C</strong> {description}</p>
      <p className="weather-badge-details">
        {precipitationProbability !== null && <span>Lluvia {precipitationProbability} %</span>}
        {windSpeed !== null && <span>Viento {windSpeed} km/h</span>}
        <a href="https://open-meteo.com/" target="_blank" rel="noreferrer">Datos: Open-Meteo.com</a>
      </p>
    </div>
  )
}

export default WeatherBadge
