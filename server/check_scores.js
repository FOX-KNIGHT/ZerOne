import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, ".env") });

const teamSchema = new mongoose.Schema({
  teamName: { type: String },
  score: { type: Number, default: 0 }
});
const Team = mongoose.models.Team || mongoose.model("Team", teamSchema);

async function checkScores() {
  await mongoose.connect(process.env.MONGO_URI);
  const teams = await Team.find({}, "teamName score").sort({ score: -1, teamName: 1 }).lean();
  console.log("Updated Leaderboard:");
  teams.forEach(t => {
      if (t.score > 0) {
          console.log(`${t.teamName} - ${t.score}`);
      }
  });
  process.exit();
}
checkScores();
