import express from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import CipherConfig from '../models/CipherConfig.js'
import { authenticate, verifyAdmin } from '../middleware/authenticate.js'

const router = express.Router()

// ── Multer storage config ───────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/'
    fs.mkdirSync(dir, { recursive: true })
    cb(null, dir)
  },
  filename: (_, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
})
const upload = multer({ storage })

// ── ADMIN: Set Round 2 config + broadcast via Socket.io ────────────────────
router.post('/round2', verifyAdmin, async (req, res) => {
  try {
    const { assignedTeamName, passwordWord, folderCipher, passwordCipher1, passwordCipher2 } = req.body
    const config = await CipherConfig.findOneAndUpdate(
      { round: 2 },
      { assignedTeamName, passwordWord, folderCipher, passwordCipher1, passwordCipher2 },
      { upsert: true, new: true }
    )
    // Broadcast live config to all connected participants
    req.app.get('io').emit('round2:config', {
      assignedTeamName,
      passwordWord,
      folderCipherName: folderCipher?.name,
      passwordCipher1Name: passwordCipher1?.name,
      passwordCipher2Name: passwordCipher2?.name,
    })
    res.json({ success: true, config })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: err.message })
  }
})

// ── ADMIN: Upload vault ZIP for Round 3 ────────────────────────────────────
router.post('/round3/vault', verifyAdmin, upload.single('vault'), async (req, res) => {
  try {
    const { correctFlag, vaultCiphers } = req.body
    const config = await CipherConfig.findOneAndUpdate(
      { round: 3 },
      {
        correctFlag,
        vaultCiphers: typeof vaultCiphers === 'string' ? JSON.parse(vaultCiphers) : vaultCiphers,
        vaultFilePath: req.file?.path,
      },
      { upsert: true, new: true }
    )
    // Broadcast vault cipher chain so Round 3 page can display it
    req.app.get('io').emit('round3:config', {
      vaultCiphers: config.vaultCiphers,
      vaultReady: true,
    })
    res.json({ success: true, path: req.file?.path })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: err.message })
  }
})

// ── ADMIN: Upload Round 1 log file ─────────────────────────────────────────
router.post('/round1/log', verifyAdmin, upload.single('log'), async (req, res) => {
  try {
    const config = await CipherConfig.findOneAndUpdate(
      { round: 1 },
      { logFilePath: req.file?.path },
      { upsert: true, new: true }
    )
    req.app.get('io').emit('round1:log-ready', { ready: true })
    res.json({ success: true, path: req.file?.path })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: err.message })
  }
})

// ── PARTICIPANT: Get Round 2 config (cipher names only, no params) ─────────
router.get('/round2', authenticate, async (req, res) => {
  try {
    const config = await CipherConfig.findOne({ round: 2 })
    if (!config) return res.status(404).json({ message: 'Config not announced yet' })
    res.json({
      assignedTeamName:   config.assignedTeamName,
      passwordWord:       config.passwordWord,
      folderCipherName:   config.folderCipher?.name,
      passwordCipher1Name: config.passwordCipher1?.name,
      passwordCipher2Name: config.passwordCipher2?.name,
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ── PARTICIPANT: Download vault ZIP ─────────────────────────────────────────
router.get('/round3/vault', authenticate, async (req, res) => {
  try {
    const config = await CipherConfig.findOne({ round: 3 })
    if (!config?.vaultFilePath) return res.status(404).json({ message: 'Vault not ready yet' })
    res.download(path.resolve(config.vaultFilePath), 'vault.zip')
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ── PARTICIPANT: Stream Round 1 log file ────────────────────────────────────
router.get('/round1/log', authenticate, async (req, res) => {
  try {
    const config = await CipherConfig.findOne({ round: 1 })
    if (!config?.logFilePath) return res.status(404).json({ message: 'Log not ready yet' })
    res.setHeader('Content-Type', 'text/plain')
    fs.createReadStream(path.resolve(config.logFilePath)).pipe(res)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ── PARTICIPANT: Get Round 3 config (cipher chain, no flag) ─────────────────
router.get('/round3', authenticate, async (req, res) => {
  try {
    const config = await CipherConfig.findOne({ round: 3 })
    if (!config) return res.status(404).json({ message: 'Round 3 not configured yet' })
    res.json({
      vaultCiphers: config.vaultCiphers?.map(c => ({ name: c.name })), // params hidden
      vaultReady: !!config.vaultFilePath,
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

export default router
