import express from 'express'
import mongoose from 'mongoose'
import Submission from '../models/Submission.js'
import Challenge from '../models/Challenge.js'
import Team from '../models/Team.js'
import { authenticate } from '../middleware/authenticate.js'
import { submissionLimiter } from '../middleware/rateLimiter.js'

const router = express.Router()

router.post('/', submissionLimiter, authenticate, async (req, res) => {
  const session = await mongoose.startSession()
  let result = null

  try {
    await session.withTransaction(async () => {
      const { challengeId, answer, hintUsed } = req.body
      const teamId = req.team.teamId

      // Check already submitted
      const existing = await Submission.findOne({ teamId, challengeId }).session(session)
      if (existing) {
        throw new Error('Already submitted')
      }

      const challenge = await Challenge.findById(challengeId).session(session)
      if (!challenge) {
        throw new Error('Challenge not found')
      }

      const isCorrect = challenge.answer.trim().toLowerCase() === answer.trim().toLowerCase()
      const pointsAwarded = isCorrect
        ? challenge.points - (hintUsed ? challenge.hint?.cost || 0 : 0)
        : 0

      const [submission] = await Submission.create([{
        teamId, challengeId, isCorrect, hintUsed, pointsAwarded
      }], { session })

      // Update team score
      let updatedTeam = null
      if (isCorrect) {
        updatedTeam = await Team.findByIdAndUpdate(
          teamId,
          { $inc: { score: pointsAwarded } },
          { new: true, session }
        )
      }

      result = {
        isCorrect,
        pointsAwarded,
        message: isCorrect ? 'Correct!' : 'Wrong answer',
        teamName: updatedTeam ? updatedTeam.teamName : null,
        challengeTitle: challenge.title
      }
    })

    // Transaction succeeded, emit events
    const io = req.app.get('io')
    if (result.isCorrect) {
      io.emit('scoreUpdate')
      io.emit('recentSolve', {
        teamName: result.teamName,
        challengeTitle: result.challengeTitle,
        points: result.pointsAwarded,
        timestamp: new Date()
      })
      io.emit('liveLeaderboardUpdate')
      // Sync submission across team computers
      io.to(req.team.teamId).emit('challengeSolved', { challengeId: req.body.challengeId })
    }

    res.json({
      isCorrect: result.isCorrect,
      pointsAwarded: result.pointsAwarded,
      message: result.message
    })

  } catch (err) {
    if (err.message === 'Already submitted') return res.status(400).json({ message: 'Already submitted' })
    if (err.message === 'Challenge not found') return res.status(404).json({ message: 'Challenge not found' })
    if (err.code === 11000) return res.status(400).json({ message: 'Already submitted' })
    
    // If transaction unsupported due to standalone mongo, fallback:
    console.error('Submission error:', err.message)
    res.status(500).json({ message: err.message })
  } finally {
    session.endSession()
  }
})

export default router