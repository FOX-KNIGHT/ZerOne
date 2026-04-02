import express from 'express'
import Team from '../models/Team.js'
import HintPurchase from '../models/HintPurchase.js'
import Section3Submission from '../models/Section3Submission.js'
import { authenticate } from '../middleware/authenticate.js'
import { SECTION3_CHALLENGES, HINT_COSTS } from '../data/section3_challenges.js'

const router = express.Router()

// GET /api/section3/challenges — returns challenges WITHOUT answers or hint text
router.get('/challenges', authenticate, async (req, res) => {
  try {
    const teamId = req.team.teamId

    // Which hints did this team already buy?
    const purchases = await HintPurchase.find({ teamId })
    const purchaseMap = {}
    for (const p of purchases) {
      if (!purchaseMap[p.challengeIndex]) purchaseMap[p.challengeIndex] = []
      purchaseMap[p.challengeIndex].push(p.hintLevel)
    }

    // Which challenges did this team already solve?
    const solved = await Section3Submission.find({ teamId, correct: true })
    const solvedSet = new Set(solved.map(s => s.challengeIndex))

    const result = SECTION3_CHALLENGES.map(ch => {
      const unlockedLevels = purchaseMap[ch.index] || []
      return {
        index:       ch.index,
        title:       ch.title,
        category:    ch.category,
        points:      ch.points,
        difficulty:  ch.difficulty,
        description: ch.description,
        solved:      solvedSet.has(ch.index),
        // Only send hint text for hints the team purchased
        hints: [1, 2, 3].map(level => ({
          level,
          cost:     HINT_COSTS[level],
          unlocked: unlockedLevels.includes(level),
          text:     unlockedLevels.includes(level) ? ch.hints[level - 1] : null,
        })),
      }
    })

    res.json({ challenges: result })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// POST /api/section3/hint — purchase a hint
router.post('/hint', authenticate, async (req, res) => {
  try {
    const teamId = req.team.teamId
    const { challengeIndex, hintLevel } = req.body

    if (challengeIndex === undefined || !hintLevel) {
      return res.status(400).json({ message: 'challengeIndex and hintLevel required' })
    }
    if (![1, 2, 3].includes(hintLevel)) {
      return res.status(400).json({ message: 'hintLevel must be 1, 2, or 3' })
    }
    if (!SECTION3_CHALLENGES[challengeIndex]) {
      return res.status(400).json({ message: 'Invalid challengeIndex' })
    }

    // Check not already purchased
    const existing = await HintPurchase.findOne({ teamId, challengeIndex, hintLevel })
    if (existing) {
      return res.status(409).json({ message: 'Hint already purchased', alreadyOwned: true })
    }

    const cost = HINT_COSTS[hintLevel]
    const team = await Team.findById(teamId)
    if (!team) return res.status(404).json({ message: 'Team not found' })

    // Deduct points (allow going below 0 is fine, will be clamped later if needed)
    await Team.findByIdAndUpdate(teamId, { $inc: { score: -cost } })

    // Record purchase
    await HintPurchase.create({ teamId, challengeIndex, hintLevel, pointsDeducted: cost })

    // Return the hint text
    const challenge = SECTION3_CHALLENGES[challengeIndex]
    const hintText = challenge.hints[hintLevel - 1]

    req.app.get('io')?.emit('scoreUpdate')

    res.json({
      message:      `Hint ${hintLevel} unlocked! -${cost} points deducted.`,
      hintText,
      pointsDeducted: cost,
    })
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: 'Hint already purchased', alreadyOwned: true })
    }
    res.status(500).json({ message: err.message })
  }
})

// POST /api/section3/submit — submit answer for a challenge
router.post('/submit', authenticate, async (req, res) => {
  try {
    const teamId = req.team.teamId
    const { challengeIndex, answer } = req.body

    if (challengeIndex === undefined || !answer) {
      return res.status(400).json({ message: 'challengeIndex and answer required' })
    }

    const challenge = SECTION3_CHALLENGES[challengeIndex]
    if (!challenge) return res.status(400).json({ message: 'Invalid challengeIndex' })

    // Check already solved
    const existing = await Section3Submission.findOne({ teamId, challengeIndex, correct: true })
    if (existing) {
      return res.status(409).json({ message: 'Already solved this challenge!', alreadySolved: true })
    }

    const isCorrect = answer.trim().toUpperCase() === challenge.answer.toUpperCase()

    if (isCorrect) {
      // Save submission
      await Section3Submission.findOneAndUpdate(
        { teamId, challengeIndex },
        { answer, correct: true, pointsAwarded: challenge.points },
        { upsert: true, new: true }
      )
      // Award points
      await Team.findByIdAndUpdate(teamId, { $inc: { score: challenge.points, round3Score: challenge.points } })
      req.app.get('io')?.emit('scoreUpdate')

      return res.json({
        correct: true,
        message: `Correct! +${challenge.points} points!`,
        pointsAwarded: challenge.points,
      })
    } else {
      // Save wrong attempt (won't block re-try unless correct)
      await Section3Submission.findOneAndUpdate(
        { teamId, challengeIndex },
        { answer, correct: false, pointsAwarded: 0 },
        { upsert: true }
      )
      return res.json({ correct: false, message: 'Wrong answer. Try again!' })
    }
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

export default router
