import assert from 'node:assert/strict'
import { afterEach, test } from 'node:test'
import { createMatch, updateMatch } from '../src/controllers/matchController.js'
import { localMatches, localLogs } from '../src/db.js'
import { matchDate } from '../../shared/dates.js'

const initialMatches = localMatches.map((match) => ({ ...match }))
const initialLogs = [...localLogs]

afterEach(() => {
  localMatches.splice(0, localMatches.length, ...initialMatches.map((match) => ({ ...match })))
  localLogs.splice(0, localLogs.length, ...initialLogs)
})

function request(body, id) {
  return { body, params: { id }, storage: 'memory', user: { id: 'user-1', email: 'kevin@faltauno.cl' } }
}

function response() {
  return {
    statusCode: 200,
    status(code) { this.statusCode = code; return this },
    json(body) { this.body = body; return this }
  }
}

function validMatch(changes = {}) {
  return { sport: 'Fútbol', location: 'Complejo Unión La Calera', level: 'Amateur', date: matchDate(1), time: '20:00', slots: 2, ...changes }
}

test('crear un partido guarda las coordenadas de la sede elegida', async () => {
  const res = response()
  await createMatch(request(validMatch({ latitude: 0, longitude: 0 })), res)
  assert.equal(res.statusCode, 201)
  assert.equal(res.body.location, 'Complejo Unión La Calera')
  assert.equal(res.body.latitude, -32.789)
  assert.equal(res.body.longitude, -71.213)
  assert.equal(localMatches[0].id, res.body.id)
})

test('crear rechaza texto libre y canchas de otro deporte sin guardar partidos', async () => {
  for (const location of ['Una cancha escrita a mano', 'Pádel Club Centro', '']) {
    const res = response()
    await createMatch(request(validMatch({ location })), res)
    assert.equal(res.statusCode, 400)
    assert.equal(localMatches.length, initialMatches.length)
  }
})

test('editar rechaza cambiar solo el deporte si la sede anterior no es compatible', async () => {
  const before = { ...localMatches[0] }
  const res = response()
  await updateMatch(request({ sport: 'Pádel' }, before.id), res)
  assert.equal(res.statusCode, 400)
  assert.deepEqual(localMatches[0], before)
})

test('editar deporte y sede actualiza también las coordenadas', async () => {
  const res = response()
  await updateMatch(request({ sport: 'Pádel', location: 'Pádel Club Centro' }, 'match-1'), res)
  assert.equal(res.statusCode, 200)
  assert.equal(res.body.sport, 'Pádel')
  assert.equal(res.body.location, 'Pádel Club Centro')
  assert.equal(res.body.latitude, -32.883)
  assert.equal(res.body.longitude, -71.248)
})

test('editar permite modificar los cupos conservando una sede válida', async () => {
  const res = response()
  await updateMatch(request({ slots: 4 }, 'match-1'), res)
  assert.equal(res.statusCode, 200)
  assert.equal(res.body.slots, 4)
  assert.equal(res.body.location, 'Complejo Unión La Calera')
})
