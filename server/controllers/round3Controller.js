import CipherConfig from '../models/CipherConfig.js'
import ZerOneSubmission from '../models/ZerOneSubmission.js'
import Team from '../models/Team.js'

// Bonus points by placement order (0-indexed)
const BONUS_POINTS = [50, 45, 40, 30]

export async function submitFlag(req, res) {
  try {
    const { flag } = req.body
    if (!flag) return res.status(400).json({ message: 'Flag is required' })

    // ── Atomic findOneAndUpdate — prevents race conditions ──────────────────
    // Only increments if the correctFlag matches
    const config = await CipherConfig.findOneAndUpdate(
      { round: 3, correctFlag: flag.trim().toUpperCase() },
      { $inc: { bonusRankCounter: 1 } },
      { new: true }
    )

    const teamId = req.team?.teamId || req.team?.id

    if (!config) {
      // Wrong flag — record attempt
      await ZerOneSubmission.create({
        teamId,
        round: 3,
        type: 'flag',
        correct: false,
        flag,
      })
      return res.json({ correct: false, message: 'Incorrect flag. Keep trying!' })
    }

    // bonusRankCounter was already incremented → subtract 1 for 0-indexed rank
    const rank = config.bonusRankCounter - 1
    const bonusPoints = BONUS_POINTS[Math.min(rank, BONUS_POINTS.length - 1)]
    const taskPoints = 20  // base points for correct flag decode
    const total = taskPoints + bonusPoints

    // Check if this team already submitted correctly (prevent duplicate rank)
    const already = await ZerOneSubmission.findOne({ teamId, round: 3, correct: true })
    if (already) {
      return res.json({
        correct: true,
        alreadySubmitted: true,
        message: 'You already submitted the correct flag!',
        score: already.score,
          rank: already.rank,
      })
    }

    await ZerOneSubmission.create({
      teamId,
      round: 3,
      type: 'flag',
      correct: true,
      flag,
      score: total,
      rank: rank + 1,
    })

    await Team.findByIdAndUpdate(teamId, { $inc: { round3Score: total, score: total } })

    // Emit leaderboard refresh
    req.app.get('io').emit('leaderboard:update')

    const rankMessages = {
      0: '🏆 FIRST BLOOD!',
      1: '⚡ SECOND PLACE!',
      2: '🔥 THIRD PLACE!',
    }

    res.json({
      correct: true,
      rank: rank + 1,
      taskPoints,
      bonusPoints,
      total,
      message: rankMessages[rank] || '✅ Flag captured!',
    })
  } catch (err) {
    console.error('Round 3 flag error:', err)
    res.status(500).json({ message: 'Server error during flag verification' })
  }
}
