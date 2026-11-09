import { Router } from 'express'
import { getRegistrations, joinMatch, leaveMatch } from '../controllers/registrationController.js'
import { requireUser } from '../middleware/auth.js'

const router = Router()
router.use(requireUser)

router.get('/', getRegistrations)
router.post('/', joinMatch)
router.delete('/:matchId', leaveMatch)

export default router
