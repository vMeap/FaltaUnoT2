import express from 'express'
import cors from 'cors'
import swaggerUi from 'swagger-ui-express'
import { connectDatabases } from './db.js'
import authRoutes from './routes/authRoutes.js'
import matchRoutes from './routes/matchRoutes.js'
import registrationRoutes from './routes/registrationRoutes.js'
import { swaggerDocument } from './swagger.js'
import { selectStorage } from './middleware/storage.js'

const app = express()
const PORT = process.env.PORT || 4000

app.use(cors())
app.use(express.json())

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))
app.use('/api', selectStorage)
app.use('/api', authRoutes)
app.use('/api', matchRoutes)
app.use('/api/registrations', registrationRoutes)

connectDatabases().then(() => {
    app.listen(PORT, () => {
        console.log(`Servidor corriendo en http://localhost:${PORT}`)
        console.log(`Swagger disponible en http://localhost:${PORT}/api/docs`)
    })
})
