import mongoose from 'mongoose'

// Separate from the existing Submission model to avoid breaking the unique
// index on {teamId, challengeId} used by the standard CTF challenge flow.
const zerOneSubmissionSchema = new mongoose.Schema({
  teamId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
  round:     { type: Number, required: true },               // 1, 2, or 3
  type:      { type: String, enum: ['zip', 'flag', 'mcq'] }, // kind of submission
  // ── ZIP (Round 2) ──
  score:     { type: Number, default: 0 },
  breakdown: { type: mongoose.Schema.Types.Mixed },          // { folderName, cipher1, cipher2 }
  errors:    [String],
  filePath:  { type: String },                               // uploaded ZIP path
  // ── Flag (Round 3) ──
  correct:   { type: Boolean },
  flag:      { type: String },
  rank:      { type: Number },                               // 1, 2, 3, 4 …
  // ── MCQ (Round 1) ──
  answers:   [mongoose.Schema.Types.Mixed],
}, { timestamps: true })

export default mongoose.model('ZerOneSubmission', zerOneSubmissionSchema)
