import { Router } from 'express'
import {
    login,
    register,
    getLogs,
    createLog
} from '../controllers/authController.js'
import { requireUser, logout } from '../middleware/auth.js'

const router = Router()

router.post('/auth/login', login)
router.post('/auth/register', register)
router.post('/auth/logout', requireUser, logout)
router.get('/logs', requireUser, getLogs)
router.post('/logs', requireUser, createLog)

export default router
