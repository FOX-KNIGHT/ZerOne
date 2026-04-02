import mongoose from 'mongoose'

const hintPurchaseSchema = new mongoose.Schema({
  teamId:         { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
  challengeIndex: { type: Number, required: true },  // 0, 1, or 2 (Section 3 has 3 challenges)
  hintLevel:      { type: Number, required: true },  // 1, 2, or 3
  pointsDeducted: { type: Number, required: true },  // 10, 20, or 30
}, { timestamps: true })

// compound unique: one purchase per team+challenge+hint
hintPurchaseSchema.index({ teamId: 1, challengeIndex: 1, hintLevel: 1 }, { unique: true })

export default mongoose.model('HintPurchase', hintPurchaseSchema)
