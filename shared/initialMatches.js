import { matchDate } from './dates.js'

export default [
  { id: 'match-1', sport: 'Fútbol', location: 'Complejo Unión La Calera', date: matchDate(1), time: '20:00', level: 'Amateur', slots: 1, latitude: -32.789, longitude: -71.213, organizerId: 'user-1' },
  { id: 'match-2', sport: 'Fútbol', location: 'Canchas San Luis de Quillota', date: matchDate(2), time: '18:30', level: 'Intermedio', slots: 2, latitude: -32.883, longitude: -71.248, organizerId: 'user-1' },
  { id: 'match-3', sport: 'Pádel', location: 'Pádel Club Centro', date: matchDate(3), time: '19:00', level: 'Amateur', slots: 1, latitude: -32.883, longitude: -71.248, organizerId: 'user-1' },
  { id: 'match-4', sport: 'Básquetbol', location: 'Gimnasio Municipal', date: matchDate(4), time: '17:30', level: 'Amateur', slots: 1, latitude: -32.883, longitude: -71.248, organizerId: 'user-1' },
  { id: 'match-5', sport: 'Fútbol', location: 'Centro Deportivo Marcelo Salas', date: matchDate(5), time: '12:00', level: 'Amateur', slots: 3, latitude: -32.883, longitude: -71.248, organizerId: 'user-1' }
]
