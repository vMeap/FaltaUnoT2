import { Router } from 'express'
import { obtenerInscripciones, inscribirseEnPartido, cancelarInscripcionPartido } from '../controllers/controladorInscripciones.js'
import { verificarUsuario } from '../middleware/autenticacion.js'

const enrutador = Router()
enrutador.use(verificarUsuario)

enrutador.get('/', obtenerInscripciones)
enrutador.post('/', inscribirseEnPartido)
enrutador.delete('/:matchId', cancelarInscripcionPartido)

export default enrutador
