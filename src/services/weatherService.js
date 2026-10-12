const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast'

const HOURLY_VARIABLES = [
  'temperature_2m',
  'precipitation_probability',
  'weather_code',
  'wind_speed_10m',
]

export const MAX_FORECAST_DAYS = 16

const MS_PER_DAY = 24 * 60 * 60 * 1000
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/
const TIME_PATTERN = /^\d{2}:\d{2}/

const WEATHER_CODES = {
  0: 'Despejado',
  1: 'Mayormente despejado',
  2: 'Parcialmente nublado',
  3: 'Nublado',
  45: 'Niebla',
  48: 'Niebla con escarcha',
  51: 'Llovizna ligera',
  53: 'Llovizna moderada',
  55: 'Llovizna intensa',
  56: 'Llovizna helada ligera',
  57: 'Llovizna helada intensa',
  61: 'Lluvia ligera',
  63: 'Lluvia moderada',
  65: 'Lluvia intensa',
  66: 'Lluvia helada ligera',
  67: 'Lluvia helada intensa',
  71: 'Nevada ligera',
  73: 'Nevada moderada',
  75: 'Nevada intensa',
  77: 'Granos de nieve',
  80: 'Chubascos ligeros',
  81: 'Chubascos moderados',
  82: 'Chubascos violentos',
  85: 'Chubascos de nieve ligeros',
  86: 'Chubascos de nieve intensos',
  95: 'Tormenta eléctrica',
  96: 'Tormenta con granizo ligero',
  97: 'Tormenta eléctrica intensa',
  99: 'Tormenta con granizo intenso',
}

const UNKNOWN_CONDITION = 'Condición desconocida'

const cache = new Map()

function isCoordinate(value) {
  return value !== null && value !== undefined && value !== '' && Number.isFinite(Number(value))
}

export function hasCoordinates(latitude, longitude) {
  return isCoordinate(latitude) && isCoordinate(longitude)
}

export function getForecastAvailability(date, time, today = new Date()) {
  if (!DATE_PATTERN.test(date ?? '') || !TIME_PATTERN.test(time ?? '')) return 'invalid'

  const matchDay = new Date(`${date}T00:00`)
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const daysAhead = Math.round((matchDay - todayStart) / MS_PER_DAY)

  if (Number.isNaN(daysAhead)) return 'invalid'
  if (daysAhead < 0) return 'past'
  if (daysAhead >= MAX_FORECAST_DAYS) return 'too-far'
  return 'available'
}

export function toMatchWeather(data, date, time) {
  const hourly = data?.hourly
  if (!hourly?.time) return null

  const targetHour = `${date}T${time.slice(0, 2)}:00`
  const index = hourly.time.indexOf(targetHour)
  if (index === -1 || hourly.temperature_2m?.[index] == null) return null

  const windSpeed = hourly.wind_speed_10m?.[index]

  return {
    temperature: Math.round(hourly.temperature_2m[index]),
    precipitationProbability: hourly.precipitation_probability?.[index] ?? null,
    windSpeed: windSpeed == null ? null : Math.round(windSpeed),
    description: WEATHER_CODES[hourly.weather_code?.[index]] ?? UNKNOWN_CONDITION,
  }
}

export async function fetchMatchWeather({ latitude, longitude, date, time }, { signal } = {}) {
  const cacheKey = `${latitude},${longitude},${date},${time.slice(0, 2)}`
  if (cache.has(cacheKey)) return cache.get(cacheKey)

  const params = new URLSearchParams({
    latitude,
    longitude,
    hourly: HOURLY_VARIABLES.join(','),
    timezone: 'auto',
    start_date: date,
    end_date: date,
  })

  const response = await fetch(`${FORECAST_URL}?${params}`, { signal })

  if (!response.ok) {
    const body = await response.json().catch(() => null)
    throw new Error(`Open-Meteo: ${body?.reason ?? `error HTTP ${response.status}`}`)
  }

  const weather = toMatchWeather(await response.json(), date, time)
  cache.set(cacheKey, weather)
  return weather
}
