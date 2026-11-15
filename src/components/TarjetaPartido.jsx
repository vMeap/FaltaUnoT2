import IndicadorClima from './IndicadorClima.jsx'

function TarjetaPartido({ match: partido, joined: inscrito, isAdmin: esAdministrador, loading: cargando, onJoin: alInscribirse, onCancel: alCancelar, onEdit: alEditar, onDelete: alEliminar }) {
    const fecha = new Date(`${partido.date}T12:00:00`).toLocaleDateString('es-CL')
    const completo = partido.slots <= 0

    let textoBoton = 'Yo apaño'

    if (inscrito) {
        textoBoton = 'Dar de baja'
    } else if (completo) {
        textoBoton = 'Sin cupos'
    }

    function manejarClic() {
        if (inscrito) {
            alCancelar(partido.id)
        } else {
            alInscribirse(partido.id)
        }
    }

    return (
        <article className="card match-card h-100">
            <div className="card-body p-4 d-flex flex-column">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <span className="sport-icon" aria-hidden="true">
                        {partido.sport.charAt(0)}
                    </span>

                    <span className="badge rounded-pill text-bg-light">
                        {partido.level}
                    </span>
                </div>

                <h3 className="h5 fw-bold">{partido.sport}</h3>

                <p className="mb-1 text-secondary">{partido.location}</p>

                <p className="small text-secondary">
                    {fecha} · {partido.time} hrs
                </p>

                <IndicadorClima
                    latitude={partido.latitude}
                    longitude={partido.longitude}
                    date={partido.date}
                    time={partido.time}
                />

                <p className="fw-semibold mt-auto mb-3">
                    {completo
                        ? 'Partido completo'
                        : `Faltan ${partido.slots} ${partido.slots === 1 ? 'jugador' : 'jugadores'}`}
                </p>

                <button
                    type="button"
                    className={`btn rounded-pill ${inscrito ? 'btn-outline-danger' : 'btn-primary'}`}
                    disabled={cargando || (completo && !inscrito)}
                    onClick={manejarClic}
                >
                    {textoBoton}
                </button>

                {esAdministrador && <div className="d-flex justify-content-end gap-3 mt-2 pt-2 border-top">
                    <button
                        type="button"
                        className="btn btn-link btn-sm text-secondary p-0 text-decoration-none"
                        onClick={() => alEditar(partido)}
                    >
                        Editar
                    </button>
                    <button
                        type="button"
                        className="btn btn-link btn-sm text-danger p-0 text-decoration-none"
                        onClick={() => alEliminar(partido.id)}
                    >
                        Eliminar
                    </button>
                </div>}
            </div>
        </article>
    )
}

export default TarjetaPartido
