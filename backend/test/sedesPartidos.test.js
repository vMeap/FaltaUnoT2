import assert from 'node:assert/strict'
import { afterEach, test } from 'node:test'
import { crearPartido, actualizarPartido } from '../src/controllers/controladorPartidos.js'
import { partidosEnMemoria, actividadEnMemoria } from '../src/baseDeDatos.js'
import { fechaPartido } from '../../shared/fechas.js'

const partidosIniciales = partidosEnMemoria.map((partido) => ({ ...partido }))
const actividadInicial = [...actividadEnMemoria]

afterEach(() => {
  partidosEnMemoria.splice(0, partidosEnMemoria.length, ...partidosIniciales.map((partido) => ({ ...partido })))
  actividadEnMemoria.splice(0, actividadEnMemoria.length, ...actividadInicial)
})

function realizarSolicitud(cuerpo, identificador) {
  return { body: cuerpo, params: { id: identificador }, storage: 'memory', user: { id: 'user-1', email: 'kevin@faltauno.cl' } }
}

function respuesta() {
  return {
    statusCode: 200,
    status(codigo) { this.statusCode = codigo; return this },
    json(cuerpo) { this.body = cuerpo; return this }
  }
}

function partidoValido(cambios = {}) {
  return { sport: 'Fútbol', location: 'Complejo Unión La Calera', level: 'Amateur', date: fechaPartido(1), time: '20:00', slots: 2, ...cambios }
}

test('crear un partido guarda las coordenadas de la sede elegida', async () => {
  const salida = respuesta()
  await crearPartido(realizarSolicitud(partidoValido({ latitude: 0, longitude: 0 })), salida)
  assert.equal(salida.statusCode, 201)
  assert.equal(salida.body.location, 'Complejo Unión La Calera')
  assert.equal(salida.body.latitude, -32.789)
  assert.equal(salida.body.longitude, -71.213)
  assert.equal(partidosEnMemoria[0].id, salida.body.id)
})

test('crear rechaza texto libre y canchas de otro deporte sin guardar partidos', async () => {
  for (const ubicacion of ['Una cancha escrita a mano', 'Pádel Club Centro', '']) {
    const salida = respuesta()
    await crearPartido(realizarSolicitud(partidoValido({ location: ubicacion })), salida)
    assert.equal(salida.statusCode, 400)
    assert.equal(partidosEnMemoria.length, partidosIniciales.length)
  }
})

test('editar rechaza cambiar solo el deporte si la sede anterior no es compatible', async () => {
  const anterior = { ...partidosEnMemoria[0] }
  const salida = respuesta()
  await actualizarPartido(realizarSolicitud({ sport: 'Pádel' }, anterior.id), salida)
  assert.equal(salida.statusCode, 400)
  assert.deepEqual(partidosEnMemoria[0], anterior)
})

test('editar deporte y sede actualiza también las coordenadas', async () => {
  const salida = respuesta()
  await actualizarPartido(realizarSolicitud({ sport: 'Pádel', location: 'Pádel Club Centro' }, 'match-1'), salida)
  assert.equal(salida.statusCode, 200)
  assert.equal(salida.body.sport, 'Pádel')
  assert.equal(salida.body.location, 'Pádel Club Centro')
  assert.equal(salida.body.latitude, -32.883)
  assert.equal(salida.body.longitude, -71.248)
})

test('editar permite modificar los cupos conservando una sede válida', async () => {
  const salida = respuesta()
  await actualizarPartido(realizarSolicitud({ slots: 4 }, 'match-1'), salida)
  assert.equal(salida.statusCode, 200)
  assert.equal(salida.body.slots, 4)
  assert.equal(salida.body.location, 'Complejo Unión La Calera')
})
