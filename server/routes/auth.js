import express from 'express'
import jwt from 'jsonwebtoken'
import { z } from 'zod'
import Team from '../models/Team.js'
import Admin from '../models/Admin.js'
import { loginLimiter } from '../middleware/rateLimiter.js'
import { validate } from '../middleware/validate.js'
import { authenticate } from '../middleware/authenticate.js'

const router = express.Router()

// ─── Schemas ─────────────────────────────────────────────────────────────────

const createTeamSchema = z.object({
  body: z.object({
    teamName: z.string().min(1, 'Team name required'),
    leadName: z.string().min(1, 'Your name is required'),
    password: z.string().min(4, 'Password must be at least 4 chars'),
  })
}).passthrough()

const joinTeamSchema = z.object({
  body: z.object({
    teamCode:   z.string().length(6, 'Team code must be 6 characters'),
    memberName: z.string().min(1, 'Your name is required'),
  })
}).passthrough()

const adminLoginSchema = z.object({
  body: z.object({
    email:    z.string().email('Valid email required'),
    password: z.string().min(1, 'Password required'),
  })
}).passthrough()

// ─── Helpers ──────────────────────────────────────────────────────────────────

function signTeamToken(team) {
  return jwt.sign(
    { teamId: team._id, teamName: team.teamName, teamCode: team.teamCode, role: 'team' },
    process.env.JWT_SECRET,
    { expiresIn: '10h' }
  )
}

function teamPayload(team) {
  return {
    teamId:       team._id,
    teamName:     team.teamName,
    teamCode:     team.teamCode,
    leadName:     team.leadName,
    members:      team.members,
    score:        team.score,
    round2Score:  team.round2Score,
    round3Score:  team.round3Score,
    currentRound: team.currentRound,
  }
}

// ─── POST /auth/create  — Team Lead creates a new team ───────────────────────
// Returns: { token, teamCode, team }
router.post('/create', loginLimiter, validate(createTeamSchema), async (req, res) => {
  try {
    const { teamName, leadName, password } = req.body

    const existing = await Team.findOne({ teamName })
    if (existing) {
      return res.status(400).json({ message: 'Team name already taken. Choose another.' })
    }

    const team = await Team.create({
      teamName: teamName.trim(),
      leadName: leadName.trim(),
      password,
      members: [leadName.trim()],
    })

    const token = signTeamToken(team)

    // Notify admin in real-time
    const io = req.app.get('io')
    if (io) {
      io.emit('teamRegistered', {
        teamId:   team._id,
        teamName: team.teamName,
        leadName: team.leadName,
        teamCode: team.teamCode,
        timestamp: new Date().toISOString(),
      })
    }

    res.status(201).json({ message: 'Team created!', token, teamCode: team.teamCode, team: teamPayload(team) })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ─── POST /auth/join  — Teammate joins via 6-char code ───────────────────────
// Returns: { token, team }
router.post('/join', loginLimiter, validate(joinTeamSchema), async (req, res) => {
  try {
    const { teamCode, memberName } = req.body

    const team = await Team.findOne({ teamCode: teamCode.toUpperCase() })
    if (!team)             return res.status(404).json({ message: 'Invalid team code. Check with your Team Lead.' })
    if (team.isDisqualified) return res.status(403).json({ message: 'This team has been disqualified.' })

    // Add member if not already listed
    const name = memberName.trim()
    if (!team.members.includes(name)) {
      team.members.push(name)
      await team.save()
    }

    const token = signTeamToken(team)
    res.json({ message: 'Joined team!', token, team: teamPayload(team) })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ─── POST /auth/login  — Team lead logs back in (by teamName + password) ─────
router.post('/login', loginLimiter, async (req, res) => {
  try {
    const { teamName, password } = req.body
    if (!teamName || !password) return res.status(400).json({ message: 'teamName and password required' })

    const team = await Team.findOne({ teamName })
    if (!team)               return res.status(404).json({ message: 'Team not found' })
    if (team.isDisqualified) return res.status(403).json({ message: 'This team has been disqualified for security violations.' })

    const valid = await team.comparePassword(password)
    if (!valid) return res.status(401).json({ message: 'Invalid password' })

    const token = signTeamToken(team)
    res.json({ token, team: teamPayload(team) })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ─── POST /auth/register  — Alias for /create (backwards compat) ─────────────
router.post('/register', loginLimiter, validate(createTeamSchema), async (req, res) => {
  try {
    const { teamName, leadName = 'Lead', password } = req.body
    const existing = await Team.findOne({ teamName })
    if (existing) return res.status(400).json({ message: 'Team already exists' })

    const team = await Team.create({ teamName: teamName.trim(), leadName: leadName.trim(), password, members: [leadName.trim()] })
    const token = signTeamToken(team)

    const io = req.app.get('io')
    if (io) io.emit('teamRegistered', { teamId: team._id, teamName: team.teamName, teamCode: team.teamCode })

    res.status(201).json({ message: 'Team created', token, teamCode: team.teamCode, team: teamPayload(team) })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ─── POST /auth/disqualify-self — called by AntiCheatWrapper on fullscreen exit
// Team's own JWT — no admin needed. Marks team disqualified in MongoDB immediately.
router.post('/disqualify-self', authenticate, async (req, res) => {
  try {
    const { teamId, teamName } = req.team

    const team = await Team.findByIdAndUpdate(
      teamId,
      { isDisqualified: true },
      { new: true }
    )
    if (!team) return res.status(404).json({ message: 'Team not found' })

    // Push to admin panel in real-time
    const io = req.app.get('io')
    if (io) {
      io.emit('teamDisqualified', {
        teamId,
        teamName: teamName || team.teamName,
        reason:    'Fullscreen violation — exited secure mode',
        timestamp: new Date().toISOString(),
      })
    }

    res.json({ message: 'Team disqualified', teamName: team.teamName })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ─── POST /auth/admin/login ───────────────────────────────────────────────────
router.post('/admin/login', loginLimiter, validate(adminLoginSchema), async (req, res) => {
  try {
    const { email, password } = req.body

    const admin = await Admin.findOne({ email })
    if (!admin) return res.status(404).json({ message: 'Admin not found' })

    const valid = await admin.comparePassword(password)
    if (!valid) return res.status(401).json({ message: 'Invalid password' })

    const token = jwt.sign(
      { adminId: admin._id, email: admin.email, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: '10h' }
    )

    res.json({ token, admin: { adminId: admin._id, email: admin.email, role: admin.role } })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ─── POST /auth/admin/setup ───────────────────────────────────────────────────
router.post('/admin/setup', async (req, res) => {
  try {
    const adminCount = await Admin.countDocuments()
    if (adminCount > 0) return res.status(403).json({ message: 'Setup already completed' })
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ message: 'email and password required' })
    const user = await Admin.create({ email, password, role: 'superadmin' })
    res.status(201).json({ message: 'Superadmin created', email: user.email })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

export default router