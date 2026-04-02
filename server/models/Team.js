import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

// Generate a unique 6-char alphanumeric team code
function generateTeamCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

const teamSchema = new mongoose.Schema({
  teamName:       { type: String, required: true, unique: true, trim: true },
  teamCode:       { type: String, unique: true, sparse: true },   // 6-char invite code (set on create)
  leadName:       { type: String, default: '' },                  // name of the team lead
  password:       { type: String, required: true },               // team login password (hashed)
  members:        [{ type: String }],                             // list of member names (including lead)
  score:          { type: Number, default: 0 },
  round2Score:    { type: Number, default: 0 },
  round3Score:    { type: Number, default: 0 },
  currentRound:   { type: Number, default: 1 },
  isDisqualified:  { type: Boolean, default: false },
  isShortlisted:   { type: Boolean, default: false },   // qualified for Final Phase
  finalSubmitted:  { type: Boolean, default: false },   // submitted Final Phase answers
  finalRank:       { type: Number, default: null },      // order of correct final submission
}, { timestamps: true })

// Hash password before save
teamSchema.pre('save', async function () {
  if (!this.isModified('password')) return
  this.password = await bcrypt.hash(this.password, 10)
})

// Generate teamCode before first save if not set
teamSchema.pre('save', async function () {
  if (this.teamCode) return
  // Generate a unique code (retry on collision)
  let code, exists
  do {
    code = generateTeamCode()
    exists = await mongoose.model('Team').findOne({ teamCode: code })
  } while (exists)
  this.teamCode = code
})

teamSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password)
}

export default mongoose.model('Team', teamSchema)