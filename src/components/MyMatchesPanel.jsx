function MyMatchesPanel({ matches, myMatchIds, onCancel }) {
  const joinedMatches = myMatchIds.map((id) => matches.find((match) => match.id === id)).filter(Boolean)

  return (
    <section className="my-matches-card p-4" aria-labelledby="my-matches-title">
      <div className="d-flex justify-content-between align-items-center mb-1">
        <h2 className="h5 fw-bold mb-0" id="my-matches-title">Mis partidos</h2>
        <span className="small text-secondary">{joinedMatches.length} {joinedMatches.length === 1 ? 'inscrito' : 'inscritos'}</span>
      </div>
      <p className="small text-secondary mb-3">Partidos a los que te has unido.</p>
      {joinedMatches.length === 0 ? <div className="empty-state py-4"><p className="small mb-0">Aún no te has inscrito.</p></div> : <ul className="list-unstyled d-grid gap-3 mb-0">
        {joinedMatches.map((match) => <li className="my-match-item" key={match.id}>
          <strong className="small">{match.sport} · {match.level}</strong>
          <p className="small text-secondary mb-2">{match.location}<br />{new Date(`${match.date}T12:00:00`).toLocaleDateString('es-CL')} · {match.time} hrs</p>
          <button type="button" className="btn btn-link btn-sm text-danger p-0" onClick={() => onCancel(match.id)}>Dar de baja</button>
        </li>)}
      </ul>}
    </section>
  )
}

export default MyMatchesPanel
