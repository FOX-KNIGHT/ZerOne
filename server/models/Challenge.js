import mongoose from 'mongoose'

const challengeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  type: { type: String, enum: ['flag', 'mcq'], required: true },
  answer: { type: String, required: true },
  options: [{ type: String }],
  points: { type: Number, required: true },
  round: { type: Number, required: true },
  hint: {
    text: { type: String },
    cost: { type: Number, default: 0 }
  }
}, { timestamps: true })

export default mongoose.model('Challenge', challengeSchema)