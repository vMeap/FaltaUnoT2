import MatchCard from './MatchCard.jsx'

function MatchList({ matches, myMatchIds, onJoin, onCancel }) {
    return (
        <div className="row g-3">
            {matches.map((match) => (
                <div className="col-12 col-md-6" key={match.id}>
                    <MatchCard
                        match={match}
                        joined={myMatchIds.includes(match.id)}
                        onJoin={onJoin}
                        onCancel={onCancel}
                    />
                </div>
            ))}

            {matches.length === 0 && (
                <div className="col-12">
                    <div className="empty-state">
                        <strong>No encontramos partidos</strong>
                        <p className="mb-0">
                            Prueba con otro deporte o ubicación.
                        </p>
                    </div>
                </div>
            )}
        </div>
    )
}

export default MatchList