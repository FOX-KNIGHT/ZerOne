import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import mongoose from 'mongoose'
import cors from 'cors'
import dotenv from 'dotenv'
import multer from 'multer'
import fs from 'fs'
import authRoutes from './routes/auth.js'
import challengeRoutes from './routes/challenges.js'
import submissionRoutes from './routes/submissions.js'
import leaderboardRoutes from './routes/leaderboard.js'
import analyticsRoutes from './routes/analytics.js'
import displayRoutes from './routes/display.js'
import adminRoutes from './routes/admin.js'
import cipherConfigRoutes from './routes/cipherConfig.js'
import phase0Routes from './routes/phase0.js'
import section3Routes from './routes/section3.js'
import finalPhaseRoutes from './routes/finalPhase.js'
import { submitRound2 } from './controllers/round2Controller.js'
import { submitFlag } from './controllers/round3Controller.js'
import { authenticate } from './middleware/authenticate.js'
import { initSocket } from './socket/index.js'
import { startTimerService } from './services/timerService.js'

dotenv.config()

// Ensure uploads directory exists
fs.mkdirSync('uploads', { recursive: true })

const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: { origin: '*' }
})

app.set('io', io)

app.use(cors())
app.use(express.json())
app.use('/uploads', express.static('uploads'))

// ── Core routes ──────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes)
app.use('/api/challenges', challengeRoutes)
app.use('/api/submissions', submissionRoutes)
app.use('/api/leaderboard', leaderboardRoutes)
app.use('/api/admin/analytics', analyticsRoutes)
app.use('/api/display', displayRoutes)
app.use('/api/admin', adminRoutes)

// ── ZerOne cipher config routes ──────────────────────────────────────────────
app.use('/api/cipher-config', cipherConfigRoutes)

// ── Phase 0 (Log MCQ Quiz) ────────────────────────────────────────────────────
app.use('/api/phase0', phase0Routes)

// ── Section 3 (Cipher Challenges with Hints) ─────────────────────────────────
app.use('/api/section3', section3Routes)

// ── Final Phase (Drive Decryption) ───────────────────────────────────────────
app.use('/api/final', finalPhaseRoutes)

// ── Round 2 ZIP submission ────────────────────────────────────────────────────
const zipUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => { fs.mkdirSync('uploads/round2', { recursive: true }); cb(null, 'uploads/round2') },
    filename: (_, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
  }),
  fileFilter: (_, file, cb) => {
    if (file.mimetype === 'application/zip' || file.originalname.endsWith('.zip')) cb(null, true)
    else cb(new Error('Only ZIP files are allowed'))
  },
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB max
})
app.post('/api/round2/submit', authenticate, zipUpload.single('vault'), submitRound2)

// ── Round 3 flag submission ───────────────────────────────────────────────────
app.post('/api/round3/flag', authenticate, submitFlag)

initSocket(io)
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected')
    startTimerService(io)
    httpServer.listen(process.env.PORT || 5000, () => {
      console.log(`Server running on port ${process.env.PORT || 5000}`)
    })
  })
  .catch(err => console.error(err))