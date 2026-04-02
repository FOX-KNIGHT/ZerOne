import express from 'express'
import Challenge from '../models/Challenge.js'
import Round from '../models/Round.js'
import Team from '../models/Team.js'
import { verifyAdmin, roleBasedAccess } from '../middleware/authenticate.js'

const router = express.Router()

router.use(verifyAdmin)
router.use(roleBasedAccess(['superadmin', 'judge']))

// Challenges CRUD
router.post('/challenges', async (req, res) => {
  try {
    const challenge = await Challenge.create(req.body)
    res.status(201).json(challenge)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.put('/challenges/:id', async (req, res) => {
  try {
    const challenge = await Challenge.findByIdAndUpdate(req.params.id, req.body, { new: true })
    res.json(challenge)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.delete('/challenges/:id', async (req, res) => {
  try {
    await Challenge.findByIdAndDelete(req.params.id)
    res.json({ message: 'Challenge deleted' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Rounds Control
router.post('/round/start', async (req, res) => {
  try {
    const { roundNumber, duration } = req.body
    
    // Deactivate others
    await Round.updateMany({}, { isActive: false })
    
    const now = new Date()
    const endsAt = new Date(now.getTime() + duration * 1000)

    const round = await Round.findOneAndUpdate(
      { roundNumber },
      { isActive: true, duration, unlockedAt: now, endsAt },
      { new: true, upsert: true }
    )

    req.app.get('io').emit('startRound', { roundNumber, duration, unlockedAt: now, endsAt })
    res.json(round)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.post('/round/end', async (req, res) => {
  try {
    const round = await Round.findOneAndUpdate(
      { isActive: true },
      { isActive: false },
      { new: true }
    )
    if (round) {
       req.app.get('io').emit('endRound', { roundNumber: round.roundNumber })
    }
    res.json(round || { message: 'No active round to end' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Team Control
router.get('/teams', async (req, res) => {
  try {
    const teams = await Team.find().select('-password')
    res.json(teams)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.post('/team/adjust-score', roleBasedAccess(['superadmin']), async (req, res) => {
  try {
    const { teamId, amount } = req.body
    const team = await Team.findByIdAndUpdate(
      teamId,
      { $inc: { score: amount } },
      { new: true }
    )
    req.app.get('io').emit('scoreUpdate')
    res.json(team)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.post('/team/disqualify', roleBasedAccess(['superadmin']), async (req, res) => {
  try {
    const { teamId } = req.body
    const team = await Team.findByIdAndUpdate(teamId, { isDisqualified: true }, { new: true })
    if (team) {
      req.app.get('io').to(teamId).emit('forceLogout', { reason: 'JUDGE_INTERVENTION' })
    }
    res.json({ message: 'Team disqualified', team })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.post('/team/reinstate', roleBasedAccess(['superadmin']), async (req, res) => {
  try {
    const { teamId } = req.body
    const team = await Team.findByIdAndUpdate(teamId, { isDisqualified: false }, { new: true })
    res.json({ message: 'Team reinstated', team })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

export default router
