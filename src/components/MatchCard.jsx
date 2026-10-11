function MatchCard({ match, joined, onJoin, onCancel }) {
    const date = new Date(`${match.date}T12:00:00`).toLocaleDateString('es-CL')
    const full = match.slots <= 0

    let buttonText = 'Yo apaño'

    if (joined) {
        buttonText = 'Dar de baja'
    } else if (full) {
        buttonText = 'Sin cupos'
    }

    function handleClick() {
        if (joined) {
            onCancel(match.id)
        } else {
            onJoin(match.id)
        }
    }

    return (
        <article className="card match-card h-100">
            <div className="card-body p-4 d-flex flex-column">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <span className="sport-icon" aria-hidden="true">
                        {match.sport.charAt(0)}
                    </span>

                    <span className="badge rounded-pill text-bg-light">
                        {match.level}
                    </span>
                </div>

                <h3 className="h5 fw-bold">{match.sport}</h3>

                <p className="mb-1 text-secondary">{match.location}</p>

                <p className="small text-secondary">
                    {date} · {match.time} hrs
                </p>

                <p className="fw-semibold mt-auto mb-3">
                    {full
                        ? 'Partido completo'
                        : `Faltan ${match.slots} ${match.slots === 1 ? 'jugador' : 'jugadores'}`}
                </p>

                <button
                    type="button"
                    className={`btn rounded-pill ${joined ? 'btn-outline-danger' : 'btn-primary'}`}
                    disabled={full && !joined}
                    onClick={handleClick}
                >
                    {buttonText}
                </button>
            </div>
        </article>
    )
}

export default MatchCard