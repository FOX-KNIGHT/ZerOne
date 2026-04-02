import mongoose from 'mongoose'

const section3SubmissionSchema = new mongoose.Schema({
  teamId:         { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
  challengeIndex: { type: Number, required: true },  // 0, 1, or 2
  answer:         { type: String, required: true },
  correct:        { type: Boolean, default: false },
  pointsAwarded:  { type: Number, default: 0 },
}, { timestamps: true })

section3SubmissionSchema.index({ teamId: 1, challengeIndex: 1 }, { unique: true })

export default mongoose.model('Section3Submission', section3SubmissionSchema)
