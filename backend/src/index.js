import express from 'express'
import cors from 'cors'
import interfazSwagger from 'swagger-ui-express'
import { conectarBasesDeDatos } from './baseDeDatos.js'
import rutasAutenticacion from './routes/rutasAutenticacion.js'
import rutasPartidos from './routes/rutasPartidos.js'
import rutasInscripciones from './routes/rutasInscripciones.js'
import { documentoSwagger } from './documentacionApi.js'
import { seleccionarAlmacenamiento } from './middleware/almacenamiento.js'

const servidor = express()
const PUERTO = process.env.PORT || 4000

servidor.use(cors())
servidor.use(express.json())

servidor.use('/api/docs', interfazSwagger.serve, interfazSwagger.setup(documentoSwagger))
servidor.use('/api', seleccionarAlmacenamiento)
servidor.use('/api', rutasAutenticacion)
servidor.use('/api', rutasPartidos)
servidor.use('/api/registrations', rutasInscripciones)

conectarBasesDeDatos().then(() => {
    servidor.listen(PUERTO, () => {
        console.log(`Servidor corriendo en http://localhost:${PUERTO}`)
        console.log(`Swagger disponible en http://localhost:${PUERTO}/api/docs`)
    })
})
