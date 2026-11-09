const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'
const STORAGE_KEY = 'faltauno.storage.v1'

export function getStorage() {
    const storage = localStorage.getItem(STORAGE_KEY)
    return ['memory', 'mysql', 'mongodb'].includes(storage) ? storage : 'mysql'
}

async function request(path, options = {}, storage = getStorage()) {
    let token
    try {
        token = JSON.parse(localStorage.getItem('faltauno.user.v1') || sessionStorage.getItem('faltauno.user.v1') || 'null')?.token
    } catch {}
    const separator = path.includes('?') ? '&' : '?'
    const response = await fetch(`${API_URL}${path}${separator}${new URLSearchParams({ storage })}`, {
        ...options,
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }
    })
    const data = await response.json()
    if (!response.ok) {
        const error = new Error(data.error || 'No se pudo completar la solicitud.')
        error.status = response.status
        throw error
    }
    return data
}

export async function loginUser(email, password) {
    const data = await request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) })
    return data.user
}

export async function registerUser(name, email, password) {
    const data = await request('/auth/register', { method: 'POST', body: JSON.stringify({ name, email, password }) })
    return data.user
}

export function logoutUser() {
    return request('/auth/logout', { method: 'POST' })
}

export function fetchMatches(storage) {
    return request('/matches', {}, storage)
}

export function createMatchApi(values, storage) {
    return request('/matches', { method: 'POST', body: JSON.stringify(values) }, storage)
}

export function updateMatchApi(id, values, storage) {
    return request(`/matches/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(values) }, storage)
}

export function deleteMatchApi(id, storage) {
    return request(`/matches/${encodeURIComponent(id)}`, { method: 'DELETE' }, storage)
}

export function fetchMyRegistrations(userId, storage) {
    return request(`/registrations?${new URLSearchParams({ userId })}`, {}, storage)
}

export function joinMatchApi(matchId, userId, userEmail, storage) {
    return request('/registrations', { method: 'POST', body: JSON.stringify({ matchId, userId, userEmail }) }, storage)
}

export function leaveMatchApi(matchId, userId, userEmail, storage) {
    const query = new URLSearchParams({ userId, userEmail })
    return request(`/registrations/${encodeURIComponent(matchId)}?${query}`, { method: 'DELETE' }, storage)
}

export function fetchLogs(storage) {
    return request('/logs', {}, storage)
}

export function sendLog(userEmail, action, detail) {
    return request('/logs', { method: 'POST', body: JSON.stringify({ userEmail, action, detail }) })
}

export async function fetchWeather(latitude = -32.883, longitude = -71.248) {
    const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`)
    if (!response.ok) throw new Error('Error al consultar clima.')
    const data = await response.json()
    return data.current_weather
}
