function SearchBar({ search, onSearchChange }) {
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
                value={search}
                onChange={(event) => onSearchChange(event.target.value)}
            />
        </>
    )
}

export default SearchBar