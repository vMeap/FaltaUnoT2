function Navbar({ myMatchesCount, onCreateMatch }) {
    return (
        <header className="site-header">
            <nav
                className="navbar navbar-expand-lg container py-3"
                aria-label="Navegación principal"
            >
                <a className="navbar-brand fw-bold" href="#inicio">
                    <span className="brand-mark">+</span> FaltaUno
                </a>

                <div className="ms-auto d-flex align-items-center gap-3">
                    <a className="nav-link d-none d-sm-inline" href="#partidos">
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
                </div>
            </nav>
        </header>
    )
}

export default Navbar