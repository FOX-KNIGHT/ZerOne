import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, ".env") });

const teamUpdates = [
  { nameRegex: /^abhimanyu$/i, score: 30 },
  { nameRegex: /^plain.?3xt$/i, score: 30 },
  { nameRegex: /^team soul$/i, score: 30 },
  { nameRegex: /^a\^?2r$/i, score: 30 },
  { nameRegex: /^decrypt$/i, score: 30 },
  { nameRegex: /^zero day s?quad$/i, score: 30 },
  { nameRegex: /^crawler2$/i, score: 30 },
  { nameRegex: /^cipherseekers$/i, score: 10 },
  { nameRegex: /^red\s?line$/i, score: 10 },
  { nameRegex: /^hash hunters?s?$/i, score: 10 },
  { nameRegex: /^memory\s*error$/i, score: 10 },
];

const teamSchema = new mongoose.Schema({
  teamName: { type: String, required: true, unique: true, trim: true },
  score: { type: Number, default: 0 }
});
const Team = mongoose.models.Team || mongoose.model("Team", teamSchema);

async function updateScores() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB.");

  for (const update of teamUpdates) {
    const result = await Team.updateMany(
      { teamName: { $regex: update.nameRegex } }, 
      { $set: { score: update.score } }
    );
    if (result.matchedCount > 0) {
        const matchingTeams = await Team.find({teamName: { $regex: update.nameRegex }}, "teamName score").lean();
        console.log(`[OK] Updated ${result.matchedCount}: ${matchingTeams.map(t => `${t.teamName} (${t.score})`).join(', ')}`);
    } else {
        console.log(`[--] NO MATCH FOUND FOR ${update.nameRegex}`);
    }
  }

  process.exit();
}
updateScores();
