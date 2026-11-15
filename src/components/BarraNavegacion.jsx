function BarraNavegacion({ user: usuario, storage: almacenamiento, onStorageChange: alCambiarAlmacenamiento, myMatchesCount: cantidadMisPartidos, onCreateMatch: alCrearPartido, onOpenProfile: alAbrirPerfil, onLogout: alCerrarSesion }) {
    return (
        <header className="site-header">
            <nav
                className="navbar navbar-expand-lg container py-3"
                aria-label="Navegación principal"
            >
                <a className="navbar-brand fw-bold" href="#inicio">
                    <span className="brand-mark">+</span> FaltaUno
                </a>

                <div className="ms-auto d-flex align-items-center flex-wrap gap-2 gap-sm-3">
                    <a className="nav-link d-none d-md-inline" href="#partidos">
                        Partidos
                    </a>

                    <a className="nav-link" href="#mis-partidos">
                        Mis partidos{' '}
                        <span className="badge rounded-pill text-bg-success">
                            {cantidadMisPartidos}
                        </span>
                    </a>

                    <div>
                        <label className="small text-secondary d-block" htmlFor="storage">Almacenamiento</label>
                        <select id="storage" className="form-select form-select-sm" value={almacenamiento} onChange={(evento) => alCambiarAlmacenamiento(evento.target.value)}>
                            <option value="memory">Memoria</option>
                            <option value="mysql">MySQL</option>
                            <option value="mongodb">MongoDB</option>
                        </select>
                    </div>

                    {usuario?.role === 'admin' && <button
                        type="button"
                        className="btn btn-primary rounded-pill px-3"
                        onClick={alCrearPartido}
                    >
                        Crear partido
                    </button>}

                    {usuario && (
                        <div className="user-pill d-flex align-items-center gap-2 ps-sm-2">
                            <button
                                type="button"
                                className="btn btn-light btn-sm rounded-pill d-inline-flex align-items-center gap-2 px-2 py-1 border"
                                onClick={alAbrirPerfil}
                                title="Ver actividad reciente"
                            >
                                <span className="user-avatar" aria-hidden="true">
                                    {usuario.name.charAt(0).toUpperCase()}
                                </span>
                                <span className="small fw-semibold d-none d-sm-inline text-truncate user-name">
                                    {usuario.name}
                                    <small className="d-block text-secondary">{usuario.role === 'admin' ? 'Administrador' : 'Jugador'}</small>
                                </span>
                            </button>

                            <button
                                type="button"
                                className="btn btn-outline-secondary btn-sm rounded-pill px-3"
                                onClick={alCerrarSesion}
                            >
                                Salir
                            </button>
                        </div>
                    )}
                </div>
            </nav>
        </header>
    )
}

export default BarraNavegacion
