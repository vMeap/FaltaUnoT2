import TarjetaPartido from './TarjetaPartido.jsx'

function ListaPartidos({ matches: partidos, myMatchIds: idsMisPartidos, isAdmin: esAdministrador, loading: cargando, onJoin: alInscribirse, onCancel: alCancelar, onEdit: alEditar, onDelete: alEliminar }) {
    return (
        <div className="row g-3">
            {partidos.map((partido) => (
                <div className="col-12 col-md-6" key={partido.id}>
                    <TarjetaPartido
                        match={partido}
                        joined={idsMisPartidos.includes(partido.id)}
                        isAdmin={esAdministrador}
                        loading={cargando}
                        onJoin={alInscribirse}
                        onCancel={alCancelar}
                        onEdit={alEditar}
                        onDelete={alEliminar}
                    />
                </div>
            ))}

            {partidos.length === 0 && (
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

export default ListaPartidos
