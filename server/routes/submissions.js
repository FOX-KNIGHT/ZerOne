import express from 'express'
import Submission from '../models/Submission.js'
import Challenge from '../models/Challenge.js'
import Team from '../models/Team.js'
import { authenticate } from '../middleware/authenticate.js'

const router = express.Router()

router.post('/', authenticate, async (req, res) => {
  try {
    const { challengeId, answer, hintUsed } = req.body
    const teamId = req.team.teamId

    // Check already submitted
    const existing = await Submission.findOne({ teamId, challengeId })
    if (existing) return res.status(400).json({ message: 'Already submitted' })

    const challenge = await Challenge.findById(challengeId)
    if (!challenge) return res.status(404).json({ message: 'Challenge not found' })

    const isCorrect = challenge.answer.trim().toLowerCase() === answer.trim().toLowerCase()
    const pointsAwarded = isCorrect
      ? challenge.points - (hintUsed ? challenge.hint.cost : 0)
      : 0

    const submission = await Submission.create({
      teamId, challengeId, isCorrect, hintUsed, pointsAwarded
    })

    // Update team score
    if (isCorrect) {
      await Team.findByIdAndUpdate(teamId, { $inc: { score: pointsAwarded } })
    }

    // Emit to socket (attached to app)
    req.app.get('io').emit('scoreUpdate')

    res.json({ isCorrect, pointsAwarded, message: isCorrect ? 'Correct!' : 'Wrong answer' })
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ message: 'Already submitted' })
    res.status(500).json({ message: err.message })
  }
})

export default router