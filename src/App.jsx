import { useEffect, useMemo, useState } from 'react'
import initialMatches from './data/initialMatches.json'
import AlertMessage from './components/AlertMessage.jsx'
import CreateMatchModal from './components/CreateMatchModal.jsx'
import MyMatchesPanel from './components/MyMatchesPanel.jsx'
import './styles.css'

const MATCHES_KEY = 'faltauno.matches.v1'
const MY_MATCHES_KEY = 'faltauno.myMatches.v1'

function readStoredArray(key, fallback) {
  try {
    const stored = localStorage.getItem(key)
    if (!stored) return fallback
    const parsed = JSON.parse(stored)
    return Array.isArray(parsed) ? parsed : fallback
  } catch {
    return fallback
  }
}

function App() {
  const [matches, setMatches] = useState(() => readStoredArray(MATCHES_KEY, initialMatches))
  const [myMatchIds, setMyMatchIds] = useState(() => readStoredArray(MY_MATCHES_KEY, []))
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [alert, setAlert] = useState(null)
  const [sportFilter, setSportFilter] = useState('Todos')
  const [search, setSearch] = useState('')

  useEffect(() => {
    localStorage.setItem(MATCHES_KEY, JSON.stringify(matches))
  }, [matches])

  useEffect(() => {
    localStorage.setItem(MY_MATCHES_KEY, JSON.stringify(myMatchIds))
  }, [myMatchIds])

  const visibleMatches = useMemo(() => matches.filter((match) => {
    const matchesSport = sportFilter === 'Todos' || match.sport === sportFilter
    const query = search.trim().toLocaleLowerCase('es')
    const text = `${match.sport} ${match.location} ${match.level}`.toLocaleLowerCase('es')
    return matchesSport && text.includes(query)
  }), [matches, sportFilter, search])

  function joinMatch(id) {
    const match = matches.find((item) => item.id === id)
    if (!match || match.slots <= 0 || myMatchIds.includes(id)) return
    setMatches((current) => current.map((item) => item.id === id ? { ...item, slots: item.slots - 1 } : item))
    setMyMatchIds((current) => [...current, id])
    setAlert({ type: 'success', message: `Te inscribiste en ${match.sport} en ${match.location}.` })
  }

  function cancelMatch(id) {
    const match = matches.find((item) => item.id === id)
    if (!match || !myMatchIds.includes(id)) return
    setMatches((current) => current.map((item) => item.id === id ? { ...item, slots: item.slots + 1 } : item))
    setMyMatchIds((current) => current.filter((matchId) => matchId !== id))
    setAlert({ type: 'warning', message: 'Cancelaste tu inscripción. El cupo quedó disponible.' })
  }

  function createMatch(values) {
    const newMatch = { ...values, id: crypto.randomUUID() }
    setMatches((current) => [newMatch, ...current])
    setShowCreateModal(false)
    setAlert({ type: 'success', message: 'Partido publicado. Ya aparece en la lista.' })
  }

  return (
    <>
      <header className="site-header">
        <nav className="navbar navbar-expand-lg container py-3" aria-label="Navegación principal">
          <a className="navbar-brand fw-bold" href="#inicio"><span className="brand-mark">+</span> FaltaUno</a>
          <div className="ms-auto d-flex align-items-center gap-3">
            <a className="nav-link d-none d-sm-inline" href="#partidos">Partidos</a>
            <a className="nav-link" href="#mis-partidos">Mis partidos <span className="badge rounded-pill text-bg-success">{myMatchIds.length}</span></a>
            <button className="btn btn-primary rounded-pill px-3" onClick={() => setShowCreateModal(true)}>Crear partido</button>
          </div>
        </nav>
      </header>

      <main id="inicio" className="container py-4 py-lg-5">
        <section className="hero rounded-4 p-4 p-md-5 mb-5">
          <p className="eyebrow mb-2">Deporte amateur, equipos completos</p>
          <h1 className="display-5 fw-bold">Completa el partido.<br /><span>Juega el partido.</span></h1>
          <p className="lead text-secondary mt-3 mb-4">Encuentra partidos cerca de ti o publica uno para sumar a quien falta.</p>
          <a className="btn btn-primary btn-lg rounded-pill px-4" href="#partidos">Buscar partidos</a>
        </section>

        <AlertMessage alert={alert} onClose={() => setAlert(null)} />
        <div className="row g-4" id="partidos">
          <section className="col-12 col-lg-8" aria-labelledby="matches-title">
            <div className="d-flex flex-column flex-md-row justify-content-between gap-3 mb-3">
              <div><p className="eyebrow mb-1">Encuentra tu próximo partido</p><h2 className="h3 fw-bold" id="matches-title">Partidos disponibles</h2></div>
              <label className="visually-hidden" htmlFor="match-search">Buscar partidos</label>
              <input id="match-search" className="form-control search-input" type="search" placeholder="Buscar por deporte o lugar" value={search} onChange={(event) => setSearch(event.target.value)} />
            </div>
            <div className="d-flex flex-wrap gap-2 mb-3" role="group" aria-label="Filtrar por deporte">
              {['Todos', 'Fútbol', 'Básquetbol', 'Pádel'].map((sport) => <button key={sport} className={`btn btn-sm rounded-pill ${sportFilter === sport ? 'btn-success' : 'btn-outline-secondary'}`} onClick={() => setSportFilter(sport)}>{sport}</button>)}
            </div>
            <div className="row g-3">
              {visibleMatches.map((match) => {
                const joined = myMatchIds.includes(match.id)
                return <div className="col-12 col-md-6" key={match.id}>
                  <article className="card match-card h-100"><div className="card-body p-4 d-flex flex-column">
                    <div className="d-flex justify-content-between align-items-center mb-3"><span className="sport-icon" aria-hidden="true">{match.sport === 'Fútbol' ? 'F' : match.sport === 'Pádel' ? 'P' : 'B'}</span><span className="badge rounded-pill text-bg-light">{match.level}</span></div>
                    <h3 className="h5 fw-bold">{match.sport}</h3><p className="mb-1 text-secondary">{match.location}</p>
                    <p className="small text-secondary">{new Date(`${match.date}T12:00:00`).toLocaleDateString('es-CL')} · {match.time} hrs</p>
                    <p className="fw-semibold mt-auto mb-3">{match.slots > 0 ? `Faltan ${match.slots} ${match.slots === 1 ? 'jugador' : 'jugadores'}` : 'Partido completo'}</p>
                    <button className={`btn rounded-pill ${joined ? 'btn-outline-danger' : 'btn-primary'}`} disabled={match.slots === 0 && !joined} onClick={() => joined ? cancelMatch(match.id) : joinMatch(match.id)}>{joined ? 'Dar de baja' : match.slots === 0 ? 'Sin cupos' : 'Yo apaño'}</button>
                  </div></article>
                </div>
              })}
              {visibleMatches.length === 0 && <div className="col-12"><div className="empty-state"><strong>No encontramos partidos</strong><p className="mb-0">Prueba con otro deporte o ubicación.</p></div></div>}
            </div>
          </section>
          <aside className="col-12 col-lg-4" id="mis-partidos"><MyMatchesPanel matches={matches} myMatchIds={myMatchIds} onCancel={cancelMatch} /></aside>
        </div>
      </main>
      <footer className="container py-4 border-top text-secondary small d-flex justify-content-between"><span>© 2026 FaltaUno</span><span>Deporte amateur, equipos completos.</span></footer>
      {showCreateModal && <CreateMatchModal onSubmit={createMatch} onClose={() => setShowCreateModal(false)} />}
    </>
  )
}

export default App
