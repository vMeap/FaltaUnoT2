import { Router } from 'express'
import {
    getMatches,
    getMatchStats,
    createMatch,
    updateMatch,
    deleteMatch
} from '../controllers/matchController.js'
import { requireUser, requireAdmin } from '../middleware/auth.js'

const router = Router()

router.get('/matches/stats', getMatchStats)
router.get('/matches', getMatches)
router.post('/matches', requireUser, requireAdmin, createMatch)
router.put('/matches/:id', requireUser, requireAdmin, updateMatch)
router.delete('/matches/:id', requireUser, requireAdmin, deleteMatch)

export default router

