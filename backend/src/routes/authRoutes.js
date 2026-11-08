import { Router } from 'express'
import {
    login,
    register,
    getLogs,
    createLog
} from '../controllers/authController.js'

const router = Router()

router.post('/auth/login', login)
router.post('/auth/register', register)
router.get('/logs', getLogs)
router.post('/logs', createLog)

export default router
