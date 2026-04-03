import express from 'express'
import Round from '../models/Round.js'
import Team from '../models/Team.js'
import Submission from '../models/Submission.js'

const router = express.Router()

router.get('/live', async (req, res) => {
  try {
    const activeRound = await Round.findOne({ isActive: true })
    const now = new Date()
    let remainingTime = 0
    if (activeRound && activeRound.endsAt) {
      remainingTime = Math.max(0, Math.floor((activeRound.endsAt - now) / 1000))
    }

    const topTeams = await Team.find()
      .sort({ score: -1, lastScoreUpdatedAt: 1 })
      .limit(5)
      .select('teamName score')

    const recentSolvesDocs = await Submission.find({ isCorrect: true })
      .sort({ submittedAt: -1 })
      .limit(10)
      .populate('teamId', 'teamName')
      .populate('challengeId', 'title')

    const recentSolves = recentSolvesDocs.map(doc => ({
      teamName: doc.teamId?.teamName || "Deleted Team",
      challengeTitle: doc.challengeId?.title || "Deleted Challenge",
      points: doc.pointsAwarded,
      timestamp: doc.submittedAt
    }))

    res.json({
      activeRound: activeRound ? activeRound.roundNumber : null,
      remainingTime,
      topTeams,
      recentSolves
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.get('/round', async (req, res) => {
  try {
    const activeRound = await Round.findOne({ isActive: true })
    res.json(activeRound)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

export default router
