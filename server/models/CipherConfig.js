import mongoose from 'mongoose'

const cipherConfigSchema = new mongoose.Schema({
  round: { type: Number, required: true, unique: true }, // 2 or 3
  // ── Round 2 fields ──────────────────────────────────────────────────────────
  assignedTeamName: { type: String },
  passwordWord:     { type: String },
  folderCipher:    { name: String, params: mongoose.Schema.Types.Mixed },
  passwordCipher1: { name: String, params: mongoose.Schema.Types.Mixed },
  passwordCipher2: { name: String, params: mongoose.Schema.Types.Mixed },
  // ── Round 3 fields ──────────────────────────────────────────────────────────
  vaultCiphers:     [{ name: String, params: mongoose.Schema.Types.Mixed }],
  correctFlag:      { type: String },
  vaultFilePath:    { type: String },
  logFilePath:      { type: String }, // Round 1 log file
  // Atomic bonus rank counter — $inc prevents race conditions
  bonusRankCounter: { type: Number, default: 0 },
}, { timestamps: true })

export default mongoose.model('CipherConfig', cipherConfigSchema)
