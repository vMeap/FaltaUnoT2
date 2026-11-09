import { useEffect, useMemo, useState } from 'react'
import initialMatches from '../shared/initialMatches.js'
import { validMatchDate } from '../shared/dates.js'
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
  fetchMyRegistrations,
  joinMatchApi,
  leaveMatchApi,
  getStorage,
  logoutUser
} from './services/api.js'
import './styles.css'

const MATCHES_KEY = 'faltauno.matches.v1'
const MY_MATCHES_KEY = 'faltauno.myMatches.v1'
const USER_KEY = 'faltauno.user.v1'
const STORAGE_KEY = 'faltauno.storage.v1'

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

function readStoredUser(key) {
  try {
    const stored =
      localStorage.getItem(key) || sessionStorage.getItem(key)

    if (!stored) return null

    const parsed = JSON.parse(stored)

    if (
      parsed &&
      typeof parsed === 'object' &&
      typeof parsed.id === 'string' &&
      typeof parsed.token === 'string' &&
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
  const [storage, setStorage] = useState(getStorage)
  const [user, setUser] = useState(() => readStoredUser(USER_KEY))

  const [matches, setMatches] = useState(() =>
    readStoredArray(`${MATCHES_KEY}.${storage}`, storage === 'memory' ? initialMatches : []).filter((match) => validMatchDate(match.date))
  )

  const [myMatchIds, setMyMatchIds] = useState(() =>
    user ? readStoredArray(`${MY_MATCHES_KEY}.${storage}.${user.id}`, []) : []
  )
  const [loadingRegistrations, setLoadingRegistrations] = useState(true)

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingMatch, setEditingMatch] = useState(null)
  const [showActivityModal, setShowActivityModal] = useState(false)
  const [alert, setAlert] = useState(null)
  const [sportFilter, setSportFilter] = useState('Todos')
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (!user) return
    let active = true

    Promise.all([fetchMatches(storage), fetchMyRegistrations(user.id, storage)])
      .then(([list, ids]) => {
        if (!active) return
        setMatches(list)
        setMyMatchIds(ids.filter((id) => list.some((match) => match.id === id)))
      })
      .catch((error) => {
        if (active) showError(error)
      })
      .finally(() => {
        if (active) setLoadingRegistrations(false)
      })

    return () => { active = false }
  }, [user, storage])

  useEffect(() => {
    if (user && !loadingRegistrations) {
      localStorage.setItem(`${MATCHES_KEY}.${storage}`, JSON.stringify(matches))
      localStorage.setItem(`${MY_MATCHES_KEY}.${storage}.${user.id}`, JSON.stringify(myMatchIds))
    }
  }, [matches, myMatchIds, storage, user, loadingRegistrations])

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
  const isAdmin = user?.role === 'admin'
  const storageName = storage === 'memory' ? 'Memoria' : storage === 'mysql' ? 'MySQL' : 'MongoDB'

  function isCurrentView() {
    return getStorage() === storage && readStoredUser(USER_KEY)?.token === user?.token
  }

  function showError(error) {
    if (error.status === 401) {
      handleLogout()
      return
    }
    setAlert({ type: 'danger', message: error.message })
  }

  function handleStorageChange(nextStorage) {
    if (nextStorage === storage) return
    localStorage.setItem(STORAGE_KEY, nextStorage)
    setLoadingRegistrations(true)
    setMatches(readStoredArray(`${MATCHES_KEY}.${nextStorage}`, nextStorage === 'memory' ? initialMatches : []).filter((match) => validMatchDate(match.date)))
    setMyMatchIds(readStoredArray(`${MY_MATCHES_KEY}.${nextStorage}.${user.id}`, []))
    setShowCreateModal(false)
    setEditingMatch(null)
    setShowActivityModal(false)
    setAlert(null)
    setStorage(nextStorage)
  }

  function persistSession(sessionUser, rememberMe = true) {
    const payload = JSON.stringify({
      id: sessionUser.id,
      name: sessionUser.name,
      email: sessionUser.email,
      role: sessionUser.role,
      token: sessionUser.token
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
      email: matchedUser.email,
      role: matchedUser.role,
      token: matchedUser.token
    }

    persistSession(sessionUser, rememberMe)
    setMatches(readStoredArray(`${MATCHES_KEY}.${storage}`, storage === 'memory' ? initialMatches : []).filter((match) => validMatchDate(match.date)))
    setMyMatchIds(readStoredArray(`${MY_MATCHES_KEY}.${storage}.${sessionUser.id}`, []))
    setLoadingRegistrations(true)
    setUser(sessionUser)
    setAlert({
      type: 'success',
      message: `¡Bienvenido de vuelta, ${matchedUser.name}!`
    })
  }

  function handleRegister(newUser, rememberMe = true) {
    handleLogin(newUser, rememberMe)
    setAlert({
      type: 'success',
      message: `¡Cuenta creada con éxito! Bienvenido a FaltaUno, ${newUser.name}.`
    })
  }

  function handleLogout() {
    logoutUser().catch(() => {})
    localStorage.removeItem(USER_KEY)
    sessionStorage.removeItem(USER_KEY)
    setUser(null)
    setMyMatchIds([])
    setLoadingRegistrations(true)
    setShowCreateModal(false)
    setEditingMatch(null)
    setShowActivityModal(false)
    setAlert(null)
  }

  async function joinMatch(id) {
    const match = matches.find((item) => item.id === id)

    if (!user || loadingRegistrations || !match || match.slots <= 0 || myMatchIds.includes(id)) return

    try {
      const { slots } = await joinMatchApi(id, user.id, user.email, storage)
      if (!isCurrentView()) return

      setMatches((current) =>
        current.map((item) => item.id === id ? { ...item, slots } : item)
      )
      setMyMatchIds((current) => current.includes(id) ? current : [...current, id])

      setAlert({
        type: 'success',
        message: `Te inscribiste en ${match.sport} en ${match.location}.`
      })
    } catch (error) {
      if (isCurrentView()) showError(error)
    }
  }

  async function cancelMatch(id) {
    const match = matches.find((item) => item.id === id)

    if (!user || loadingRegistrations || !match || !myMatchIds.includes(id)) return

    try {
      const { slots } = await leaveMatchApi(id, user.id, user.email, storage)
      if (!isCurrentView()) return

      setMatches((current) =>
        current.map((item) => item.id === id ? { ...item, slots } : item)
      )
      setMyMatchIds((current) => current.filter((matchId) => matchId !== id))

      setAlert({
        type: 'warning',
        message: 'Cancelaste tu inscripción. El cupo quedó disponible.'
      })
    } catch (error) {
      if (isCurrentView()) showError(error)
    }
  }

  async function saveMatch(values) {
    if (!isAdmin || loadingRegistrations) return
    if (editingMatch) {
      try {
        const updated = await updateMatchApi(editingMatch.id, {
          ...values,
          userEmail: user.email
        }, storage)
        if (!isCurrentView()) return
        setMatches((current) =>
          current.map((item) => (item.id === editingMatch.id ? updated : item))
        )
      } catch (error) {
        if (isCurrentView()) showError(error)
        return
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
      }, storage)
      if (!isCurrentView()) return
      setMatches((current) => [created, ...current])
    } catch (error) {
      if (isCurrentView()) showError(error)
      return
    }

    setShowCreateModal(false)
    setAlert({
      type: 'success',
      message: 'Partido publicado. Ya aparece en la lista.'
    })
  }

  function handleOpenEdit(match) {
    if (!isAdmin || loadingRegistrations) return
    setAlert(null)
    setEditingMatch(match)
    setShowCreateModal(true)
  }

  async function handleDeleteMatch(id) {
    if (!isAdmin || loadingRegistrations) return
    try {
      await deleteMatchApi(id, storage)
      if (!isCurrentView()) return
    } catch (error) {
      if (isCurrentView()) showError(error)
      return
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
        onLogin={handleLogin}
        onRegister={handleRegister}
      />
    )
  }

  return (
    <div className="app-page min-vh-100 d-flex flex-column">
      <Navbar
        user={user}
        storage={storage}
        onStorageChange={handleStorageChange}
        myMatchesCount={myMatchIds.length}
        onCreateMatch={() => {
          if (!isAdmin || loadingRegistrations) return
          setAlert(null)
          setEditingMatch(null)
          setShowCreateModal(true)
        }}
        onOpenProfile={() => setShowActivityModal(true)}
        onLogout={handleLogout}
      />

      <main id="inicio" className="container py-4 py-lg-5 flex-grow-1">
        <Hero />
        <p className="small text-secondary" role="status">{loadingRegistrations ? 'Cargando partidos e inscripciones...' : `Mostrando partidos e inscripciones de ${storageName}.`}</p>

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
              isAdmin={isAdmin}
              loading={loadingRegistrations}
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
              loading={loadingRegistrations}
            />
          </aside>
        </div>
      </main>

      <Footer />

      {showCreateModal && (
        <CreateMatchModal
          editingMatch={editingMatch}
          onSubmit={saveMatch}
          errorMessage={alert?.type === 'danger' ? alert.message : ''}
          onClose={() => {
            setEditingMatch(null)
            setShowCreateModal(false)
          }}
        />
      )}

      {showActivityModal && (
        <ActivityModal
          user={user}
          storage={storage}
          onClose={() => setShowActivityModal(false)}
        />
      )}
    </div>
  )
}

export default App
