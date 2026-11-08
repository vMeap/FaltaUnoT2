-- Inicialización de Base de Datos Relacional PostgreSQL (FaltaUno - Hito 3)

CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    email VARCHAR(160) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(30) NOT NULL DEFAULT 'jugador',
    favorite_sport VARCHAR(50) NOT NULL DEFAULT 'Fútbol',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS matches (
    id VARCHAR(64) PRIMARY KEY,
    sport VARCHAR(50) NOT NULL,
    location VARCHAR(160) NOT NULL,
    date VARCHAR(20) NOT NULL,
    time VARCHAR(20) NOT NULL,
    level VARCHAR(50) NOT NULL,
    slots INTEGER NOT NULL DEFAULT 1,
    latitude DOUBLE PRECISION DEFAULT -32.883,
    longitude DOUBLE PRECISION DEFAULT -71.248,
    organizer_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Usuarios iniciales
INSERT INTO users (id, name, email, password, role, favorite_sport)
VALUES
    ('user-1', 'Kevin', 'kevin@faltauno.cl', '123456', 'organizador', 'Fútbol'),
    ('user-2', 'Matías Rojas', 'matias@faltauno.cl', '123456', 'jugador', 'Fútbol'),
    ('user-3', 'Camila Soto', 'camila@faltauno.cl', '123456', 'organizador', 'Pádel'),
    ('user-4', 'Diego Morales', 'diego@faltauno.cl', '123456', 'jugador', 'Básquetbol')
ON CONFLICT (email) DO NOTHING;

-- Partidos iniciales (continuidad con initialMatches.json del Taller 2)
INSERT INTO matches (id, sport, location, date, time, level, slots, latitude, longitude, organizer_id)
VALUES
    ('match-1', 'Fútbol', 'Complejo Unión La Calera', '2026-11-07', '20:00', 'Amateur', 1, -32.789, -71.213, 'user-1'),
    ('match-2', 'Fútbol', 'Canchas San Luis de Quillota', '2026-11-08', '18:30', 'Intermedio', 2, -32.883, -71.248, 'user-2'),
    ('match-3', 'Pádel', 'Pádel Club Centro', '2026-11-09', '19:00', 'Amateur', 1, -32.883, -71.248, 'user-3'),
    ('match-4', 'Básquetbol', 'Gimnasio Municipal', '2026-11-10', '17:30', 'Amateur', 1, -32.883, -71.248, 'user-4'),
    ('match-5', 'Fútbol', 'Centro Deportivo Marcelo Salas', '2026-11-11', '12:00', 'Amateur', 3, -32.883, -71.248, 'user-1')
ON CONFLICT (id) DO NOTHING;
