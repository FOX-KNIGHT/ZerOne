import express from 'express'
import Team from '../models/Team.js'

const router = express.Router()

router.get('/', async (req, res) => {
  try {
    const teams = await Team.find()
      .select('teamName score members')
      .sort({ score: -1 })
    res.json(teams)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

export default router