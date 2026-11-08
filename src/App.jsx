import { useEffect, useMemo, useState } from 'react'
import initialMatches from './data/initialMatches.json'
import initialUsers from './data/initialUsers.json'
import AlertMessage from './components/AlertMessage.jsx'
import CreateMatchModal from './components/CreateMatchModal.jsx'
import MyMatchesPanel from './components/MyMatchesPanel.jsx'
import Navbar from './components/Navbar.jsx'
import Hero from './components/Hero.jsx'
import Footer from './components/Footer.jsx'
import MatchList from './components/MatchList.jsx'
import SearchBar from './components/SearchBar.jsx'
import FilterBar from './components/FilterBar.jsx'
import Login from './components/Login.jsx'
import ActivityModal from './components/ActivityModal.jsx'
import {
  fetchMatches,
  createMatchApi,
  updateMatchApi,
  deleteMatchApi,
  sendLog
} from './services/api.js'
import './styles.css'

const MATCHES_KEY = 'faltauno.matches.v1'
const MY_MATCHES_KEY = 'faltauno.myMatches.v1'
const USERS_KEY = 'faltauno.users.v1'
const USER_KEY = 'faltauno.user.v1'

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

function readStoredUsers() {
  const stored = readStoredArray(USERS_KEY, initialUsers)
  const existingEmails = new Set(
    stored.map((item) => item.email?.toLocaleLowerCase('es'))
  )
  const missingSeeds = initialUsers.filter(
    (seed) => !existingEmails.has(seed.email.toLocaleLowerCase('es'))
  )
  return [...stored, ...missingSeeds]
}

function readStoredUser(key) {
  try {
    const stored =
      localStorage.getItem(key) || sessionStorage.getItem(key)

    if (!stored) return null

    const parsed = JSON.parse(stored)

    if (
      parsed &&
      typeof parsed === 'object' &&
      typeof parsed.name === 'string' &&
      typeof parsed.email === 'string'
    ) {
      return parsed
    }

    return null
  } catch {
    return null
  }
}

function App() {
  const [users, setUsers] = useState(readStoredUsers)
  const [user, setUser] = useState(() => readStoredUser(USER_KEY))

  const [matches, setMatches] = useState(() =>
    readStoredArray(MATCHES_KEY, initialMatches)
  )

  const [myMatchIds, setMyMatchIds] = useState(() =>
    readStoredArray(MY_MATCHES_KEY, [])
  )

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingMatch, setEditingMatch] = useState(null)
  const [showActivityModal, setShowActivityModal] = useState(false)
  const [alert, setAlert] = useState(null)
  const [sportFilter, setSportFilter] = useState('Todos')
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchMatches()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setMatches(data)
        }
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    localStorage.setItem(USERS_KEY, JSON.stringify(users))
  }, [users])

  useEffect(() => {
    localStorage.setItem(MATCHES_KEY, JSON.stringify(matches))
  }, [matches])

  useEffect(() => {
    localStorage.setItem(MY_MATCHES_KEY, JSON.stringify(myMatchIds))
  }, [myMatchIds])

  const visibleMatches = useMemo(() => {
    const query = search.trim().toLocaleLowerCase('es')

    return matches.filter((match) => {
      const matchesSport =
        sportFilter === 'Todos' || match.sport === sportFilter

      const text =
        `${match.sport} ${match.location} ${match.level}`.toLocaleLowerCase('es')

      return matchesSport && text.includes(query)
    })
  }, [matches, sportFilter, search])

  const totalOpenMatches = matches.filter((m) => m.slots > 0).length
  const totalSlotsAvailable = matches.reduce((sum, m) => sum + Number(m.slots || 0), 0)

  function persistSession(sessionUser, rememberMe = true) {
    const payload = JSON.stringify({
      id: sessionUser.id,
      name: sessionUser.name,
      email: sessionUser.email
    })

    if (rememberMe) {
      localStorage.setItem(USER_KEY, payload)
      sessionStorage.removeItem(USER_KEY)
    } else {
      sessionStorage.setItem(USER_KEY, payload)
      localStorage.removeItem(USER_KEY)
    }
  }

  function handleLogin(matchedUser, rememberMe = true) {
    const sessionUser = {
      id: matchedUser.id,
      name: matchedUser.name,
      email: matchedUser.email
    }

    persistSession(sessionUser, rememberMe)
    setUser(sessionUser)
    setAlert({
      type: 'success',
      message: `¡Bienvenido de vuelta, ${matchedUser.name}!`
    })
  }

  function handleRegister({ id, name, email, password, rememberMe = true }) {
    const newUser = {
      id: id || crypto.randomUUID(),
      name,
      email,
      password
    }

    setUsers((current) => [...current, newUser])
    persistSession(newUser, rememberMe)
    setUser({
      id: newUser.id,
      name: newUser.name,
      email: newUser.email
    })
    setAlert({
      type: 'success',
      message: `¡Cuenta creada con éxito! Bienvenido a FaltaUno, ${newUser.name}.`
    })
  }

  function handleLogout() {
    localStorage.removeItem(USER_KEY)
    sessionStorage.removeItem(USER_KEY)
    setUser(null)
    setShowCreateModal(false)
    setEditingMatch(null)
    setShowActivityModal(false)
    setAlert(null)
  }

  function joinMatch(id) {
    const match = matches.find((item) => item.id === id)

    if (!match || match.slots <= 0 || myMatchIds.includes(id)) return

    const nextSlots = match.slots - 1
    setMatches((current) =>
      current.map((item) =>
        item.id === id ? { ...item, slots: nextSlots } : item
      )
    )

    setMyMatchIds((current) => [...current, id])
    updateMatchApi(id, { slots: nextSlots, userEmail: user.email }).catch(() => {})
    sendLog(user.email, 'INSCRIPCION', `Se inscribió en ${match.sport} en ${match.location}`).catch(() => {})

    setAlert({
      type: 'success',
      message: `Te inscribiste en ${match.sport} en ${match.location}.`
    })
  }

  function cancelMatch(id) {
    const match = matches.find((item) => item.id === id)

    if (!match || !myMatchIds.includes(id)) return

    const nextSlots = match.slots + 1
    setMatches((current) =>
      current.map((item) =>
        item.id === id ? { ...item, slots: nextSlots } : item
      )
    )

    setMyMatchIds((current) =>
      current.filter((matchId) => matchId !== id)
    )
    updateMatchApi(id, { slots: nextSlots, userEmail: user.email }).catch(() => {})
    sendLog(user.email, 'BAJA', `Canceló inscripción en ${match.sport} en ${match.location}`).catch(() => {})

    setAlert({
      type: 'warning',
      message: 'Cancelaste tu inscripción. El cupo quedó disponible.'
    })
  }

  async function saveMatch(values) {
    if (editingMatch) {
      try {
        const updated = await updateMatchApi(editingMatch.id, {
          ...values,
          userEmail: user.email
        })
        setMatches((current) =>
          current.map((item) => (item.id === editingMatch.id ? updated : item))
        )
      } catch {
        setMatches((current) =>
          current.map((item) =>
            item.id === editingMatch.id ? { ...item, ...values } : item
          )
        )
      }

      setEditingMatch(null)
      setShowCreateModal(false)
      setAlert({
        type: 'success',
        message: 'Partido actualizado correctamente.'
      })
      return
    }

    try {
      const created = await createMatchApi({
        ...values,
        organizerId: user.id,
        userEmail: user.email
      })
      setMatches((current) => [created, ...current])
    } catch {
      const fallbackMatch = {
        ...values,
        id: crypto.randomUUID(),
        latitude: -32.883,
        longitude: -71.248
      }
      setMatches((current) => [fallbackMatch, ...current])
    }

    setShowCreateModal(false)
    setAlert({
      type: 'success',
      message: 'Partido publicado. Ya aparece en la lista.'
    })
  }

  function handleOpenEdit(match) {
    setEditingMatch(match)
    setShowCreateModal(true)
  }

  async function handleDeleteMatch(id) {
    try {
      await deleteMatchApi(id)
    } catch {
      // Si el backend no está activo, igual se elimina en la vista local
    }

    setMatches((current) => current.filter((item) => item.id !== id))
    setMyMatchIds((current) => current.filter((matchId) => matchId !== id))
    setAlert({
      type: 'warning',
      message: 'El partido fue eliminado de la lista.'
    })
  }

  if (!user) {
    return (
      <Login
        users={users}
        onLogin={handleLogin}
        onRegister={handleRegister}
      />
    )
  }

  return (
    <div className="app-page min-vh-100 d-flex flex-column">
      <Navbar
        user={user}
        myMatchesCount={myMatchIds.length}
        onCreateMatch={() => {
          setEditingMatch(null)
          setShowCreateModal(true)
        }}
        onOpenProfile={() => setShowActivityModal(true)}
        onLogout={handleLogout}
      />

      <main id="inicio" className="container py-4 py-lg-5 flex-grow-1">
        <Hero />

        <div className="row g-3 mb-4">
          <div className="col-12 col-sm-4">
            <div className="card match-card p-3 text-center">
              <span className="small text-secondary">Partidos publicados</span>
              <strong className="h4 fw-bold text-success mb-0">{matches.length}</strong>
            </div>
          </div>
          <div className="col-12 col-sm-4">
            <div className="card match-card p-3 text-center">
              <span className="small text-secondary">Partidos con cupos</span>
              <strong className="h4 fw-bold text-success mb-0">{totalOpenMatches}</strong>
            </div>
          </div>
          <div className="col-12 col-sm-4">
            <div className="card match-card p-3 text-center">
              <span className="small text-secondary">Cupos disponibles</span>
              <strong className="h4 fw-bold text-success mb-0">{totalSlotsAvailable}</strong>
            </div>
          </div>
        </div>

        <AlertMessage
          alert={alert}
          onClose={() => setAlert(null)}
        />

        <div className="row g-4" id="partidos">
          <section
            className="col-12 col-lg-8"
            aria-labelledby="matches-title"
          >
            <div className="d-flex flex-column flex-md-row justify-content-between gap-3 mb-3">
              <div>
                <p className="eyebrow mb-1">
                  Encuentra tu próximo partido
                </p>

                <h2 className="h3 fw-bold" id="matches-title">
                  Partidos disponibles
                </h2>
              </div>

              <SearchBar
                search={search}
                onSearchChange={setSearch}
              />
            </div>

            <FilterBar
              sportFilter={sportFilter}
              onFilterChange={setSportFilter}
            />
            <MatchList
              matches={visibleMatches}
              myMatchIds={myMatchIds}
              onJoin={joinMatch}
              onCancel={cancelMatch}
              onEdit={handleOpenEdit}
              onDelete={handleDeleteMatch}
            />
          </section>

          <aside className="col-12 col-lg-4" id="mis-partidos">
            <MyMatchesPanel
              matches={matches}
              myMatchIds={myMatchIds}
              onCancel={cancelMatch}
            />
          </aside>
        </div>
      </main>

      <Footer />

      {showCreateModal && (
        <CreateMatchModal
          editingMatch={editingMatch}
          onSubmit={saveMatch}
          onClose={() => {
            setEditingMatch(null)
            setShowCreateModal(false)
          }}
        />
      )}

      {showActivityModal && (
        <ActivityModal
          user={user}
          onClose={() => setShowActivityModal(false)}
        />
      )}
    </div>
  )
}

export default App
