function FiltroDeportes({ sportFilter: filtroDeporte, onFilterChange: alCambiarFiltro }) {
    const deportes = ['Todos', 'Fútbol', 'Básquetbol', 'Pádel']

    return (
        <div
            className="d-flex flex-wrap gap-2 mb-3"
            role="group"
            aria-label="Filtrar por deporte"
        >
            {deportes.map((deporte) => (
                <button
                    key={deporte}
                    type="button"
                    className={`btn btn-sm rounded-pill ${filtroDeporte === deporte
                        ? 'btn-success'
                        : 'btn-outline-secondary'
                        }`}
                    aria-pressed={filtroDeporte === deporte}
                    onClick={() => alCambiarFiltro(deporte)}
                >
                    {deporte}
                </button>
            ))}
        </div>
    )
}

export default FiltroDeportes