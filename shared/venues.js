// Sedes configuradas en el proyecto y coordenadas usadas por sus partidos iniciales.
export const venues = [
  { name: 'Complejo Unión La Calera', sports: ['Fútbol'], latitude: -32.789, longitude: -71.213 },
  { name: 'Canchas San Luis de Quillota', sports: ['Fútbol'], latitude: -32.883, longitude: -71.248 },
  { name: 'Centro Deportivo Marcelo Salas', sports: ['Fútbol'], latitude: -32.883, longitude: -71.248 },
  { name: 'Gimnasio Municipal', sports: ['Básquetbol'], latitude: -32.883, longitude: -71.248 },
  { name: 'Pádel Club Centro', sports: ['Pádel'], latitude: -32.883, longitude: -71.248 }
]

export function venuesForSport(sport) {
  return venues.filter((venue) => venue.sports.includes(sport))
}

export function findVenue(sport, location) {
  return venuesForSport(sport).find((venue) => venue.name === location)
}
