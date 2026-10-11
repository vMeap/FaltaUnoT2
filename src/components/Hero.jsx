function Hero() {
    return (
        <section className="hero rounded-4 p-4 p-md-5 mb-5">
            <p className="eyebrow mb-2">
                Deporte amateur, equipos completos
            </p>

            <h1 className="display-5 fw-bold">
                Completa el partido.
                <br />
                <span>Juega el partido.</span>
            </h1>

            <p className="lead text-secondary mt-3 mb-4">
                Encuentra partidos cerca de ti o publica uno para sumar a quien falta.
            </p>

            <a
                className="btn btn-primary btn-lg rounded-pill px-4"
                href="#partidos"
            >
                Buscar partidos
            </a>
        </section>
    )
}

export default Hero