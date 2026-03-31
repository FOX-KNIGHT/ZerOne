import mongoose from 'mongoose'

const submissionSchema = new mongoose.Schema({
  teamId: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
  challengeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Challenge', required: true },
  isCorrect: { type: Boolean, required: true },
  hintUsed: { type: Boolean, default: false },
  pointsAwarded: { type: Number, default: 0 },
  submittedAt: { type: Date, default: Date.now }
})

// prevent duplicate submissions per team per challenge
submissionSchema.index({ teamId: 1, challengeId: 1 }, { unique: true })

export default mongoose.model('Submission', submissionSchema)