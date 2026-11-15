import { useEffect, useState } from 'react'
import { consultarActividad } from '../services/api.js'

function ModalActividad({ user: usuario, storage: almacenamiento, onClose: alCerrar }) {
    const [registrosActividad, establecerActividad] = useState([])
    const [cargando, establecerCargando] = useState(true)

    useEffect(() => {
        consultarActividad(almacenamiento)
            .then((datos) => establecerActividad(datos))
            .catch(() => establecerActividad([]))
            .finally(() => establecerCargando(false))
    }, [almacenamiento])

    return (
        <div
            className="modal-backdrop-custom"
            role="presentation"
            onMouseDown={(evento) => {
                if (evento.target === evento.currentTarget) alCerrar()
            }}
        >
            <section
                className="create-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="activity-title"
            >
                <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                        <p className="eyebrow mb-1">Mi cuenta ({usuario.email})</p>
                        <h2 className="h4 fw-bold mb-0" id="activity-title">
                            Actividad reciente · {almacenamiento === 'memory' ? 'Memoria' : almacenamiento === 'mysql' ? 'MySQL' : 'MongoDB'}
                        </h2>
                    </div>
                    <button
                        type="button"
                        className="btn-close"
                        aria-label="Cerrar"
                        onClick={alCerrar}
                    />
                </div>

                {cargando ? (
                    <p className="text-secondary small">Cargando registros...</p>
                ) : registrosActividad.length === 0 ? (
                    <div className="empty-state py-4">
                        <p className="small mb-0">Aún no hay actividad registrada.</p>
                    </div>
                ) : (
                    <ul className="list-unstyled d-grid gap-2 mb-0 profile-logs-list">
                        {registrosActividad.map((elemento, indice) => (
                            <li key={elemento._id || indice} className="my-match-item py-2 px-3">
                                <div className="d-flex justify-content-between align-items-center mb-1">
                                    <span className="badge text-bg-success">{elemento.action}</span>
                                    <small className="text-secondary">
                                        {new Date(elemento.date).toLocaleString('es-CL')}
                                    </small>
                                </div>
                                <p className="small mb-0">{elemento.detail}</p>
                                <small className="text-secondary">{elemento.userEmail}</small>
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </div>
    )
}

export default ModalActividad

