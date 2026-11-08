import { Router } from 'express'
import {
    getMatches,
    getMatchStats,
    createMatch,
    updateMatch,
    deleteMatch
} from '../controllers/matchController.js'

const router = Router()

router.get('/matches/stats', getMatchStats)
router.get('/matches', getMatches)
router.post('/matches', createMatch)
router.put('/matches/:id', updateMatch)
router.delete('/matches/:id', deleteMatch)

export default router

