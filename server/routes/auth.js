import express from 'express'
import jwt from 'jsonwebtoken'
import Team from '../models/Team.js'

const router = express.Router()

// Register team (admin uses this to pre-create teams)
router.post('/register', async (req, res) => {
  try {
    const { teamName, password, members } = req.body
    const existing = await Team.findOne({ teamName })
    if (existing) return res.status(400).json({ message: 'Team already exists' })

    const team = await Team.create({ teamName, password, members })
    res.status(201).json({ message: 'Team created', teamName: team.teamName })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Team login
router.post('/login', async (req, res) => {
  try {
    const { teamName, password } = req.body
    const team = await Team.findOne({ teamName })
    if (!team) return res.status(404).json({ message: 'Team not found' })

    const valid = await team.comparePassword(password)
    if (!valid) return res.status(401).json({ message: 'Invalid password' })

    const token = jwt.sign(
      { teamId: team._id, teamName: team.teamName },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    )

    res.json({
      token,
      team: {
        teamId: team._id,
        teamName: team.teamName,
        members: team.members,
        score: team.score,
        currentRound: team.currentRound
      }
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

export default router