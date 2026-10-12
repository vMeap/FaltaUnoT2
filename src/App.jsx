import { useEffect, useMemo, useState } from 'react'
import initialMatches from './data/initialMatches.json'
import AlertMessage from './components/AlertMessage.jsx'
import CreateMatchModal from './components/CreateMatchModal.jsx'
import MyMatchesPanel from './components/MyMatchesPanel.jsx'
import Navbar from './components/Navbar.jsx'
import Hero from './components/Hero.jsx'
import Footer from './components/Footer.jsx'
import MatchList from './components/MatchList.jsx'
import SearchBar from './components/SearchBar.jsx'
import FilterBar from './components/FilterBar.jsx'
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
  const [matches, setMatches] = useState(() =>
    readStoredArray(MATCHES_KEY, initialMatches)
  )

  const [myMatchIds, setMyMatchIds] = useState(() =>
    readStoredArray(MY_MATCHES_KEY, [])
  )

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

  function joinMatch(id) {
    const match = matches.find((item) => item.id === id)

    if (!match || match.slots <= 0 || myMatchIds.includes(id)) return

    setMatches((current) =>
      current.map((item) =>
        item.id === id ? { ...item, slots: item.slots - 1 } : item
      )
    )

    setMyMatchIds((current) => [...current, id])

    setAlert({
      type: 'success',
      message: `Te inscribiste en ${match.sport} en ${match.location}.`
    })
  }

  function cancelMatch(id) {
    const match = matches.find((item) => item.id === id)

    if (!match || !myMatchIds.includes(id)) return

    setMatches((current) =>
      current.map((item) =>
        item.id === id ? { ...item, slots: item.slots + 1 } : item
      )
    )

    setMyMatchIds((current) =>
      current.filter((matchId) => matchId !== id)
    )

    setAlert({
      type: 'warning',
      message: 'Cancelaste tu inscripción. El cupo quedó disponible.'
    })
  }

  function createMatch(values) {
    const newMatch = {
      ...values,
      id: crypto.randomUUID()
    }

    setMatches((current) => [newMatch, ...current])
    setShowCreateModal(false)

    setAlert({
      type: 'success',
      message: 'Partido publicado. Ya aparece en la lista.'
    })
  }

  return (
    <>
      <Navbar
        myMatchesCount={myMatchIds.length}
        onCreateMatch={() => setShowCreateModal(true)}
      />

      <main id="inicio" className="container py-4 py-lg-5">
        <Hero />

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
          onSubmit={createMatch}
          onClose={() => setShowCreateModal(false)}
        />
      )}
    </>
  )
}

export default App