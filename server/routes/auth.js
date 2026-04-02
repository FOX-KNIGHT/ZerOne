import express from 'express'
import jwt from 'jsonwebtoken'
import { z } from 'zod'
import Team from '../models/Team.js'
import Admin from '../models/Admin.js'
import { loginLimiter } from '../middleware/rateLimiter.js'
import { validate } from '../middleware/validate.js'

const router = express.Router()

const loginSchema = z.object({
  body: z.object({
    password: z.string().min(1)
  }).passthrough()
})

const registerSchema = z.object({
  body: z.object({
    teamName: z.string().min(1),
    password: z.string().min(1),
    members: z.array(z.string()).optional()
  })
})

// Register team (admin uses this to pre-create teams)
router.post('/register', validate(registerSchema), async (req, res) => {
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
router.post('/login', loginLimiter, validate(loginSchema), async (req, res) => {
  try {
    const { teamName, password } = req.body
    if (!teamName) return res.status(400).json({ message: 'teamName is required' })

    const team = await Team.findOne({ teamName })
    if (!team) return res.status(404).json({ message: 'Team not found' })

    if (team.isDisqualified) {
      return res.status(403).json({ message: 'This team has been disqualified for security violations.' })
    }

    const valid = await team.comparePassword(password)
    if (!valid) return res.status(401).json({ message: 'Invalid password' })

    const token = jwt.sign(
      { teamId: team._id, teamName: team.teamName, role: 'team' },
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

// Admin login
router.post('/admin/login', loginLimiter, validate(loginSchema), async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email) return res.status(400).json({ message: 'email is required' })

    const admin = await Admin.findOne({ email })
    if (!admin) return res.status(404).json({ message: 'Admin not found' })

    const valid = await admin.comparePassword(password)
    if (!valid) return res.status(401).json({ message: 'Invalid password' })

    const token = jwt.sign(
      { adminId: admin._id, email: admin.email, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    )

    res.json({
      token,
      admin: {
        adminId: admin._id,
        email: admin.email,
        role: admin.role
      }
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// One-time setup for superadmin (disable if an admin already exists)
router.post('/admin/setup', async (req, res) => {
  try {
    const adminCount = await Admin.countDocuments()
    if (adminCount > 0) return res.status(403).json({ message: 'Setup already completed' })
    
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ message: 'email and password required' })

    const user = await Admin.create({ email, password, role: 'superadmin' })
    res.status(201).json({ message: 'Superadmin created successfully', email: user.email })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

export default router