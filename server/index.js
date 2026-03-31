import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import mongoose from 'mongoose'
import cors from 'cors'
import dotenv from 'dotenv'
import authRoutes from './routes/auth.js'
import challengeRoutes from './routes/challenges.js'
import submissionRoutes from './routes/submissions.js'
import leaderboardRoutes from './routes/leaderboard.js'
import { initSocket } from './socket/index.js'

dotenv.config()

const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: { origin: '*' }
})

app.set('io', io)

app.use(cors())
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/challenges', challengeRoutes)
app.use('/api/submissions', submissionRoutes)
app.use('/api/leaderboard', leaderboardRoutes)

initSocket(io)

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected')
    httpServer.listen(process.env.PORT || 5000, () => {
      console.log(`Server running on port ${process.env.PORT || 5000}`)
    })
  })
  .catch(err => console.error(err))