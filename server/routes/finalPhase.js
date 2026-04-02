import express from 'express'
import Team from '../models/Team.js'
import { authenticate, verifyAdmin, roleBasedAccess } from '../middleware/authenticate.js'

const router = express.Router()

// Correct answers (case-insensitive check)
const FINAL_ANSWERS = {
  fileName:  'SENORITA',
  password:  'HATCHBACK',
  flagValue: 'OSCARVICTORROGERROMEO',
}

const FINAL_POINTS = {
  1: 300,  // 1st correct team
  2: 250,  // 2nd
  3: 200,  // 3rd
  default: 150, // everyone else
}

// Track order of correct submissions
let correctSubmissionCount = 0

// GET /api/final/access — check if team is shortlisted
router.get('/access', authenticate, async (req, res) => {
  try {
    const team = await Team.findById(req.team.teamId).select('isShortlisted teamName score')
    if (!team) return res.status(404).json({ message: 'Team not found' })
    res.json({ shortlisted: !!team.isShortlisted, teamName: team.teamName, score: team.score })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// POST /api/final/submit — submit final answers
router.post('/submit', authenticate, async (req, res) => {
  try {
    const { teamId } = req.team
    const { fileName, password, flagValue } = req.body

    const team = await Team.findById(teamId)
    if (!team) return res.status(404).json({ message: 'Team not found' })

    if (!team.isShortlisted) {
      return res.status(403).json({ message: 'Your team is not shortlisted for the Final Phase.' })
    }

    if (team.finalSubmitted) {
      return res.status(409).json({ message: 'Already submitted Final Phase!', alreadySubmitted: true })
    }

    if (!fileName || !password || !flagValue) {
      return res.status(400).json({ message: 'All three fields are required.' })
    }

    const fileNameOk  = fileName.trim().toUpperCase()  === FINAL_ANSWERS.fileName
    const passwordOk  = password.trim().toUpperCase()  === FINAL_ANSWERS.password
    const flagValueOk = flagValue.trim().toUpperCase() === FINAL_ANSWERS.flagValue

    const allCorrect = fileNameOk && passwordOk && flagValueOk

    if (allCorrect) {
      correctSubmissionCount++
      const rank = Math.min(correctSubmissionCount, 3)
      const pts  = FINAL_POINTS[rank] || FINAL_POINTS.default

      await Team.findByIdAndUpdate(teamId, {
        $inc: { score: pts },
        finalSubmitted: true,
        finalRank: correctSubmissionCount,
      })

      req.app.get('io')?.emit('scoreUpdate')
      req.app.get('io')?.emit('finalSubmission', {
        teamName: team.teamName,
        rank:     correctSubmissionCount,
        pts,
      })

      return res.json({
        correct:  true,
        rank:     correctSubmissionCount,
        pts,
        message:  `🎉 All correct! You are #${correctSubmissionCount} to finish! +${pts} points!`,
      })
    } else {
      // Tell them which fields are wrong
      return res.json({
        correct:    false,
        fileNameOk,
        passwordOk,
        flagValueOk,
        message:    'Some answers are incorrect. Check the highlighted fields and try again.',
      })
    }
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// POST /api/final/shortlist — admin shortlists top 10 teams
router.post('/shortlist', verifyAdmin, async (req, res) => {
  try {
    // Get all non-disqualified teams by score
    const topTeams = await Team.find({ isDisqualified: false })
      .sort({ score: -1 })
      .select('_id teamName score')

    const topIds = topTeams.map(t => t._id)

    // Reset all, then shortlist top 10
    await Team.updateMany({}, { isShortlisted: false })
    await Team.updateMany({ _id: { $in: topIds } }, { isShortlisted: true })

    req.app.get('io')?.emit('shortlistAnnounced', {
      teams: topTeams.map((t, i) => ({ rank: i + 1, teamName: t.teamName, score: t.score })),
    })

    res.json({ message: `Top ${topTeams.length} teams shortlisted!`, teams: topTeams })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// GET /api/final/shortlist — admin view of who's shortlisted
router.get('/shortlist', verifyAdmin, async (req, res) => {
  try {
    const teams = await Team.find({ isShortlisted: true })
      .sort({ score: -1 })
      .select('teamName score finalRank finalSubmitted')
    res.json(teams)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

export default router
