import { useEffect, useState } from 'react'
import { fetchLogs } from '../services/api.js'

function ActivityModal({ user, storage, onClose }) {
    const [logs, setLogs] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchLogs(storage)
            .then((data) => setLogs(data))
            .catch(() => setLogs([]))
            .finally(() => setLoading(false))
    }, [storage])

    return (
        <div
            className="modal-backdrop-custom"
            role="presentation"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) onClose()
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
                        <p className="eyebrow mb-1">Mi cuenta ({user.email})</p>
                        <h2 className="h4 fw-bold mb-0" id="activity-title">
                            Actividad reciente · {storage === 'memory' ? 'Memoria' : storage === 'mysql' ? 'MySQL' : 'MongoDB'}
                        </h2>
                    </div>
                    <button
                        type="button"
                        className="btn-close"
                        aria-label="Cerrar"
                        onClick={onClose}
                    />
                </div>

                {loading ? (
                    <p className="text-secondary small">Cargando registros...</p>
                ) : logs.length === 0 ? (
                    <div className="empty-state py-4">
                        <p className="small mb-0">Aún no hay actividad registrada.</p>
                    </div>
                ) : (
                    <ul className="list-unstyled d-grid gap-2 mb-0 profile-logs-list">
                        {logs.map((item, index) => (
                            <li key={item._id || index} className="my-match-item py-2 px-3">
                                <div className="d-flex justify-content-between align-items-center mb-1">
                                    <span className="badge text-bg-success">{item.action}</span>
                                    <small className="text-secondary">
                                        {new Date(item.date).toLocaleString('es-CL')}
                                    </small>
                                </div>
                                <p className="small mb-0">{item.detail}</p>
                                <small className="text-secondary">{item.userEmail}</small>
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </div>
    )
}

export default ActivityModal

