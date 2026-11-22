const URL_PRONOSTICO = 'https://api.open-meteo.com/v1/forecast'

const CODIGOS_CLIMA = {
    0: 'Despejado',
    1: 'Mayormente despejado',
    2: 'Parcialmente nublado',
    3: 'Nublado',
    45: 'Niebla',
    51: 'Llovizna ligera',
    53: 'Llovizna moderada',
    61: 'Lluvia ligera',
    63: 'Lluvia moderada',
    65: 'Lluvia intensa',
    80: 'Chubascos ligeros',
    95: 'Tormenta eléctrica'
}

export async function consultarClimaPartido(partido) {
    if (!partido || partido.latitude == null || partido.longitude == null) {
        return null
    }

    const parametros = new URLSearchParams({
        latitude: String(partido.latitude),
        longitude: String(partido.longitude),
        hourly: 'temperature_2m,precipitation_probability,weather_code,wind_speed_10m',
        timezone: 'auto',
        start_date: partido.date,
        end_date: partido.date
    })

    const respuesta = await fetch(`${URL_PRONOSTICO}?${parametros}`)
    if (!respuesta.ok) {
        throw new Error('No se pudo obtener el pronóstico del clima.')
    }

    const datos = await respuesta.json()
    const horas = datos?.hourly?.time
    if (! Array.isArray(horas)) return null

    const horaObjetivo = `${partido.date}T${String(partido.time).slice(0, 2)}:00`
    const indice = horas.indexOf(horaObjetivo)
    if (indice === -1) return null

    return {
        temperatura: Math.round(datos.hourly.temperature_2m[indice]),
        lluvia: datos.hourly.precipitation_probability?.[indice] ?? 0,
        viento: Math.round(datos.hourly.wind_speed_10m?.[indice] ?? 0),
        descripcion: CODIGOS_CLIMA[datos.hourly.weather_code?.[indice]] || 'Clima variable'
    }
}
