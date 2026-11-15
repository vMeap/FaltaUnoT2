function BuscadorPartidos({ search: busqueda, onSearchChange: alCambiarBusqueda }) {
    return (
        <>
            <label className="visually-hidden" htmlFor="match-search">
                Buscar partidos
            </label>

            <input
                id="match-search"
                className="form-control search-input"
                type="search"
                placeholder="Buscar por deporte o lugar"
                value={busqueda}
                onChange={(evento) => alCambiarBusqueda(evento.target.value)}
            />
        </>
    )
}

export default BuscadorPartidos