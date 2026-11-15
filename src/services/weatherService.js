const URL_PRONOSTICO = 'https://api.open-meteo.com/v1/forecast'

const VARIABLES_POR_HORA = [
  'temperature_2m',
  'precipitation_probability',
  'weather_code',
  'wind_speed_10m',
]

export const DIAS_MAXIMOS_PRONOSTICO = 16

const MILISEGUNDOS_POR_DIA = 24 * 60 * 60 * 1000
const PATRON_FECHA = /^\d{4}-\d{2}-\d{2}$/
const PATRON_HORA = /^\d{2}:\d{2}/

const CODIGOS_CLIMA = {
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

const CONDICION_DESCONOCIDA = 'Condición desconocida'

const resultadosGuardados = new Map()

function esCoordenada(valor) {
  return valor !== null && valor !== undefined && valor !== '' && Number.isFinite(Number(valor))
}

export function tieneCoordenadas(latitud, longitud) {
  return esCoordenada(latitud) && esCoordenada(longitud)
}

export function obtenerDisponibilidadPronostico(fecha, hora, hoy = new Date()) {
  if (!PATRON_FECHA.test(fecha ?? '') || !PATRON_HORA.test(hora ?? '')) return 'invalid'

  const diaPartido = new Date(`${fecha}T00:00`)
  const inicioHoy = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate())
  const diasRestantes = Math.round((diaPartido - inicioHoy) / MILISEGUNDOS_POR_DIA)

  if (Number.isNaN(diasRestantes)) return 'invalid'
  if (diasRestantes < 0) return 'past'
  if (diasRestantes >= DIAS_MAXIMOS_PRONOSTICO) return 'too-far'
  return 'available'
}

export function convertirClimaPartido(datos, fecha, hora) {
  const datosPorHora = datos?.hourly
  if (!datosPorHora?.time) return null

  const horaBuscada = `${fecha}T${hora.slice(0, 2)}:00`
  const indice = datosPorHora.time.indexOf(horaBuscada)
  if (indice === -1 || datosPorHora.temperature_2m?.[indice] == null) return null

  const velocidadViento = datosPorHora.wind_speed_10m?.[indice]

  return {
    temperature: Math.round(datosPorHora.temperature_2m[indice]),
    precipitationProbability: datosPorHora.precipitation_probability?.[indice] ?? null,
    windSpeed: velocidadViento == null ? null : Math.round(velocidadViento),
    description: CODIGOS_CLIMA[datosPorHora.weather_code?.[indice]] ?? CONDICION_DESCONOCIDA,
  }
}

export async function consultarClimaPartido({ latitude: latitud, longitude: longitud, date: fecha, time: hora }, { signal: senal } = {}) {
  const claveResultado = `${latitud},${longitud},${fecha},${hora.slice(0, 2)}`
  if (resultadosGuardados.has(claveResultado)) return resultadosGuardados.get(claveResultado)

  const parametros = new URLSearchParams({
    latitude: latitud,
    longitude: longitud,
    hourly: VARIABLES_POR_HORA.join(','),
    timezone: 'auto',
    start_date: fecha,
    end_date: fecha,
  })

  const respuesta = await fetch(`${URL_PRONOSTICO}?${parametros}`, { signal: senal })

  if (!respuesta.ok) {
    const cuerpo = await respuesta.json().catch(() => null)
    throw new Error(`Open-Meteo: ${cuerpo?.reason ?? `error HTTP ${respuesta.status}`}`)
  }

  const clima = convertirClimaPartido(await respuesta.json(), fecha, hora)
  resultadosGuardados.set(claveResultado, clima)
  return clima
}
