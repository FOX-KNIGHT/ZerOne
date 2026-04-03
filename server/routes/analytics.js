import express from 'express'
import Team from '../models/Team.js'
import Challenge from '../models/Challenge.js'
import Submission from '../models/Submission.js'
import { verifyAdmin, roleBasedAccess } from '../middleware/authenticate.js'

const router = express.Router()

router.use(verifyAdmin)
router.use(roleBasedAccess(['superadmin', 'judge']))

router.get('/overview', async (req, res) => {
  try {
    const totalTeams = await Team.countDocuments()
    const totalSubmissions = await Submission.countDocuments()
    
    const maxScoreTeam = await Team.findOne().sort({ score: -1, lastScoreUpdatedAt: 1 }).select('score')
    const highestScore = maxScoreTeam ? maxScoreTeam.score : 0

    const avgScoreResult = await Team.aggregate([
      { $group: { _id: null, avgScore: { $avg: "$score" } } }
    ])
    const averageScore = avgScoreResult.length > 0 ? Array.from(avgScoreResult)[0].avgScore : 0

    const mostSolved = await Submission.aggregate([
      { $match: { isCorrect: true } },
      { $group: { _id: "$challengeId", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 1 },
      { $lookup: { from: 'challenges', localField: '_id', foreignField: '_id', as: 'challenge' } }
    ])

    let mostSolvedChallenge = null
    if (mostSolved.length > 0 && Array.from(mostSolved)[0].challenge.length > 0) {
      mostSolvedChallenge = {
        title: Array.from(mostSolved)[0].challenge[0].title,
        solves: Array.from(mostSolved)[0].count
      }
    }

    res.json({
      totalTeams,
      totalSubmissions,
      averageScore: Number(averageScore.toFixed(2)),
      highestScore,
      mostSolvedChallenge
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.get('/teams', async (req, res) => {
  try {
    const teamAnalytics = await Submission.aggregate([
      {
        $group: {
          _id: "$teamId",
          totalSubmissions: { $sum: 1 },
          correctSubmissions: { $sum: { $cond: ["$isCorrect", 1, 0] } },
          totalHintsUsed: { $sum: { $cond: ["$hintUsed", 1, 0] } }
        }
      },
      {
        $lookup: {
          from: "teams",
          localField: "_id",
          foreignField: "_id",
          as: "team"
        }
      },
      { $unwind: "$team" },
      {
        $project: {
          teamName: "$team.teamName",
          score: "$team.score",
          lastScoreUpdatedAt: "$team.lastScoreUpdatedAt",
          accuracy: {
            $multiply: [
              { $divide: ["$correctSubmissions", { $max: ["$totalSubmissions", 1] }] },
              100
            ]
          },
          hintsUsed: "$totalHintsUsed"
        }
      },
      { $sort: { score: -1, lastScoreUpdatedAt: 1 } }
    ])

    res.json(teamAnalytics)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.get('/challenges', async (req, res) => {
  try {
    const challengeAnalytics = await Submission.aggregate([
      {
        $group: {
          _id: "$challengeId",
          totalAttempts: { $sum: 1 },
          correctSubmissions: { $sum: { $cond: ["$isCorrect", 1, 0] } }
        }
      },
      {
        $lookup: {
          from: "challenges",
          localField: "_id",
          foreignField: "_id",
          as: "challenge"
        }
      },
      { $unwind: "$challenge" },
      {
        $project: {
          title: "$challenge.title",
          points: "$challenge.points",
          totalAttempts: 1,
          correctSubmissions: 1,
          successRate: {
            $multiply: [
              { $divide: ["$correctSubmissions", { $max: ["$totalAttempts", 1] }] },
              100
            ]
          }
        }
      },
      { $sort: { successRate: -1 } }
    ])

    res.json(challengeAnalytics)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

export default router
