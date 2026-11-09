-- Inicialización de Base de Datos Relacional MySQL 

CREATE DATABASE IF NOT EXISTS faltauno_db;
USE faltauno_db;

CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    email VARCHAR(160) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(30) NOT NULL DEFAULT 'jugador',
    favorite_sport VARCHAR(50) NOT NULL DEFAULT 'Fútbol',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS matches (
    id VARCHAR(64) PRIMARY KEY,
    sport VARCHAR(50) NOT NULL,
    location VARCHAR(160) NOT NULL,
    date VARCHAR(20) NOT NULL,
    time VARCHAR(20) NOT NULL,
    level VARCHAR(50) NOT NULL,
    slots INT NOT NULL DEFAULT 1,
    latitude DOUBLE DEFAULT -32.883,
    longitude DOUBLE DEFAULT -71.248,
    organizer_id VARCHAR(64),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_matches_organizer FOREIGN KEY (organizer_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS registrations (
    id VARCHAR(50) PRIMARY KEY,
    match_id VARCHAR(50) NOT NULL,
    user_id VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (match_id, user_id),
    FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Usuarios iniciales
INSERT IGNORE INTO users (id, name, email, password, role, favorite_sport)
VALUES
    ('user-1', 'Kevin', 'kevin@faltauno.cl', '123456', 'admin', 'Fútbol'),
    ('user-2', 'Matías Rojas', 'matias@faltauno.cl', '123456', 'jugador', 'Fútbol'),
    ('user-3', 'Camila Soto', 'camila@faltauno.cl', '123456', 'jugador', 'Pádel'),
    ('user-4', 'Diego Morales', 'diego@faltauno.cl', '123456', 'jugador', 'Básquetbol');

UPDATE users SET role = CASE WHEN LOWER(email) = 'kevin@faltauno.cl' THEN 'admin' ELSE 'jugador' END;

-- Partidos iniciales 


INSERT IGNORE INTO matches (id, sport, location, date, time, level, slots, latitude, longitude, organizer_id)
VALUES
    ('match-1', 'Fútbol', 'Complejo Unión La Calera', DATE_ADD(CURDATE(), INTERVAL 1 DAY), '20:00', 'Amateur', 1, -32.789, -71.213, 'user-1'),
    ('match-2', 'Fútbol', 'Canchas San Luis de Quillota', DATE_ADD(CURDATE(), INTERVAL 2 DAY), '18:30', 'Intermedio', 2, -32.883, -71.248, 'user-1'),
    ('match-3', 'Pádel', 'Pádel Club Centro', DATE_ADD(CURDATE(), INTERVAL 3 DAY), '19:00', 'Amateur', 1, -32.883, -71.248, 'user-1'),
    ('match-4', 'Básquetbol', 'Gimnasio Municipal', DATE_ADD(CURDATE(), INTERVAL 4 DAY), '17:30', 'Amateur', 1, -32.883, -71.248, 'user-1'),
    ('match-5', 'Fútbol', 'Centro Deportivo Marcelo Salas', DATE_ADD(CURDATE(), INTERVAL 5 DAY), '12:00', 'Amateur', 3, -32.883, -71.248, 'user-1');
