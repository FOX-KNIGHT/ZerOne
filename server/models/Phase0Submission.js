import mongoose from 'mongoose'

const phase0Schema = new mongoose.Schema({
  teamId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true, unique: true },
  answers:   { type: Object, default: {} },   // { "1": "B", "2": "C", ... }
  results:   { type: Object, default: {} },   // { "1": { correct: true, answer: "B", submitted: "B" } }
  score:     { type: Number, default: 0 },
  correct:   { type: Number, default: 0 },
}, { timestamps: true })

export default mongoose.model('Phase0Submission', phase0Schema)
