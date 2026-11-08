function Navbar({ user, myMatchesCount, onCreateMatch, onOpenProfile, onLogout }) {
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
                            {myMatchesCount}
                        </span>
                    </a>

                    <button
                        type="button"
                        className="btn btn-primary rounded-pill px-3"
                        onClick={onCreateMatch}
                    >
                        Crear partido
                    </button>

                    {user && (
                        <div className="user-pill d-flex align-items-center gap-2 ps-sm-2">
                            <button
                                type="button"
                                className="btn btn-light btn-sm rounded-pill d-inline-flex align-items-center gap-2 px-2 py-1 border"
                                onClick={onOpenProfile}
                                title="Ver perfil SQL y bitácora MongoDB"
                            >
                                <span className="user-avatar" aria-hidden="true">
                                    {user.name.charAt(0).toUpperCase()}
                                </span>
                                <span className="small fw-semibold d-none d-sm-inline text-truncate user-name">
                                    {user.name}
                                </span>
                            </button>

                            <button
                                type="button"
                                className="btn btn-outline-secondary btn-sm rounded-pill px-3"
                                onClick={onLogout}
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

export default Navbar
