import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Team from '../models/Team.js';
import Submission from '../models/Submission.js';
import Round from '../models/Round.js';
import Challenge from '../models/Challenge.js';
import ZerOneSubmission from '../models/ZerOneSubmission.js';
import Admin from '../models/Admin.js';

dotenv.config({ path: '../.env' });

async function reset() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/zerone');
    console.log('Connected.');

    // Collections to clear
    console.log('Clearing Teams...');
    await Team.deleteMany({});
    
    console.log('Clearing Submissions...');
    await Submission.deleteMany({});
    await ZerOneSubmission.deleteMany({});

    console.log('Resetting Rounds...');
    await Round.deleteMany({});

    // Note: Challenges and Admins are typically preserved.
    // If you want a total wipe, uncomment below:
    // console.log('Clearing Challenges...');
    // await Challenge.deleteMany({});
    // console.log('Clearing Admins...');
    // await Admin.deleteMany({});

    console.log('Database reset complete. All team data and competition state erased.');
    process.exit(0);
  } catch (err) {
    console.error('Reset failed:', err);
    process.exit(1);
  }
}

reset();
