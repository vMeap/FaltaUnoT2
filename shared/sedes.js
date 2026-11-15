// Sedes configuradas en el proyecto y coordenadas usadas por sus partidos iniciales.
export const sedes = [
  { name: 'Complejo Unión La Calera', sports: ['Fútbol'], latitude: -32.789, longitude: -71.213 },
  { name: 'Canchas San Luis de Quillota', sports: ['Fútbol'], latitude: -32.883, longitude: -71.248 },
  { name: 'Centro Deportivo Marcelo Salas', sports: ['Fútbol'], latitude: -32.883, longitude: -71.248 },
  { name: 'Gimnasio Municipal', sports: ['Básquetbol'], latitude: -32.883, longitude: -71.248 },
  { name: 'Pádel Club Centro', sports: ['Pádel'], latitude: -32.883, longitude: -71.248 }
]

export function sedesPorDeporte(deporte) {
  return sedes.filter((sede) => sede.sports.includes(deporte))
}

export function buscarSede(deporte, ubicacion) {
  return sedesPorDeporte(deporte).find((sede) => sede.name === ubicacion)
}
