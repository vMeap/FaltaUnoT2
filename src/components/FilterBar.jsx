function FilterBar({ sportFilter, onFilterChange }) {
    const sports = ['Todos', 'Fútbol', 'Básquetbol', 'Pádel']

    return (
        <div
            className="d-flex flex-wrap gap-2 mb-3"
            role="group"
            aria-label="Filtrar por deporte"
        >
            {sports.map((sport) => (
                <button
                    key={sport}
                    type="button"
                    className={`btn btn-sm rounded-pill ${sportFilter === sport
                        ? 'btn-success'
                        : 'btn-outline-secondary'
                        }`}
                    aria-pressed={sportFilter === sport}
                    onClick={() => onFilterChange(sport)}
                >
                    {sport}
                </button>
            ))}
        </div>
    )
}

export default FilterBar