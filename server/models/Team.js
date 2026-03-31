import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const teamSchema = new mongoose.Schema({
  teamName: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  members: [{ type: String }],
  score: { type: Number, default: 0 },
  currentRound: { type: Number, default: 1 }
}, { timestamps: true })

teamSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()
  this.password = await bcrypt.hash(this.password, 10)
  next()
})

teamSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password)
}

export default mongoose.model('Team', teamSchema)