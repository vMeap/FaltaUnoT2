const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'

export async function loginUser(email, password) {
    const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    })

    const data = await response.json()
    if (!response.ok) {
        throw new Error(data.error || 'Error al iniciar sesión.')
    }
    return data.user
}

export async function registerUser(name, email, password) {
    const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
    })

    const data = await response.json()
    if (!response.ok) {
        throw new Error(data.error || 'Error al registrar la cuenta.')
    }
    return data.user
}

export async function fetchMatches() {
    const response = await fetch(`${API_URL}/matches`)
    if (!response.ok) {
        throw new Error('No se pudieron cargar los partidos.')
    }
    return response.json()
}

export async function createMatchApi(values) {
    const response = await fetch(`${API_URL}/matches`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
    })

    const data = await response.json()
    if (!response.ok) {
        throw new Error(data.error || 'Error al crear partido.')
    }
    return data
}

export async function updateMatchApi(id, values) {
    const response = await fetch(`${API_URL}/matches/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
    })

    const data = await response.json()
    if (!response.ok) {
        throw new Error(data.error || 'Error al editar partido.')
    }
    return data
}

export async function deleteMatchApi(id) {
    const response = await fetch(`${API_URL}/matches/${id}`, {
        method: 'DELETE'
    })

    if (!response.ok) {
        throw new Error('Error al eliminar partido.')
    }
    return response.json()
}

export async function fetchWeather(latitude = -32.883, longitude = -71.248) {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`
    const response = await fetch(url)
    if (!response.ok) {
        throw new Error('Error al consultar clima.')
    }
    const data = await response.json()
    return data.current_weather
}

export async function fetchLogs() {
    const response = await fetch(`${API_URL}/logs`)
    if (!response.ok) {
        throw new Error('No se pudo cargar el historial.')
    }
    return response.json()
}

export async function sendLog(userEmail, action, detail) {
    await fetch(`${API_URL}/logs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userEmail, action, detail })
    })
}
