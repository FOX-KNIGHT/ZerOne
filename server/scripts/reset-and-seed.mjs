/**
 * ZerOne — Clean DB Reset
 * Drops everything and creates ONLY the superadmin.
 * NO teams are pre-seeded — teams register themselves during the event.
 *
 * Usage (from /server):
 *   node scripts/reset-and-seed.mjs
 */

import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Load .env
const envPath = path.join(__dirname, '../.env')
try {
  process.loadEnvFile(envPath)
} catch {
  const raw = fs.readFileSync(envPath, 'utf-8')
  for (const line of raw.split('\n')) {
    const t = line.trim()
    if (!t || t.startsWith('#')) continue
    const i = t.indexOf('='); if (i < 0) continue
    const k = t.slice(0, i).trim()
    const v = t.slice(i + 1).trim().replace(/^["']|["']$/g, '')
    if (!process.env[k]) process.env[k] = v
  }
}

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/zerone'

const adminSchema = new mongoose.Schema({
  email:    { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role:     { type: String, enum: ['superadmin', 'judge'], default: 'judge' }
}, { timestamps: true })

const Admin = mongoose.model('Admin', adminSchema)

async function run() {
  console.log('\n🔗 Connecting to MongoDB:', MONGO_URI)
  await mongoose.connect(MONGO_URI)
  console.log('✅ Connected!\n')

  // Drop everything
  console.log('🗑️  Dropping all collections...')
  const collections = ['teams', 'admins', 'challenges', 'rounds', 'submissions', 'zeronesubmissions', 'cipherconfigs']
  for (const col of collections) {
    try   { await mongoose.connection.dropCollection(col); console.log(`   ✓ ${col}`) }
    catch (e) { if (e.code === 26) console.log(`   ~ skip: ${col}`) }
  }

  // Superadmin only
  console.log('\n👤 Creating superadmin...')
  const hpwd = await bcrypt.hash('admin123', 10)
  await Admin.create({ email: 'admin@zerone.io', password: hpwd, role: 'superadmin' })
  console.log('   ✓ admin@zerone.io / admin123\n')

  const line = '═'.repeat(55)
  console.log(line)
  console.log('🎉  DB RESET COMPLETE — ZERO TEAMS')
  console.log(line)
  console.log()
  console.log('  ADMIN  →  admin@zerone.io / admin123')
  console.log()
  console.log('  Teams will register themselves at:')
  console.log('  http://localhost:5173')
  console.log()
  console.log('  FLOW:')
  console.log('  1. Team Lead → ./create_team.sh → gets 6-char code')
  console.log('  2. Teammates → ./join_team.sh   → enter code + name')
  console.log('  3. All land on dashboard with fullscreen enforced')
  console.log('  4. Fullscreen exit = PERMANENT DISQUALIFICATION in DB')
  console.log(line)

  await mongoose.disconnect()
}

run().catch(err => { console.error('\n❌', err.message); process.exit(1) })
