import AdmZip from 'adm-zip'
import CipherConfig from '../models/CipherConfig.js'
import ZerOneSubmission from '../models/ZerOneSubmission.js'
import Team from '../models/Team.js'
import { applyCipher } from '../../shared/ciphers.js'

export async function submitRound2(req, res) {
  try {
    if (!req.file) return res.status(400).json({ message: 'No ZIP file uploaded' })

    const config = await CipherConfig.findOne({ round: 2 })
    if (!config) return res.status(400).json({ message: 'Round 2 not configured yet' })

    const { assignedTeamName, passwordWord, folderCipher, passwordCipher1, passwordCipher2 } = config

    // ── Compute expected values server-side ────────────────────────────────
    const expectedFolderName = applyCipher(
      folderCipher.name, assignedTeamName, folderCipher.params
    )
    const afterCipher1 = applyCipher(
      passwordCipher1.name, passwordWord, passwordCipher1.params
    )
    const expectedPassword = applyCipher(
      passwordCipher2.name, afterCipher1, passwordCipher2.params
    )

    // ── Open uploaded ZIP ──────────────────────────────────────────────────
    let zip
    try {
      zip = new AdmZip(req.file.path)
    } catch {
      return res.status(400).json({ message: 'Could not open ZIP file. Is it a valid .zip?' })
    }

    let score = 0
    const breakdown = { folderName: 0, cipher1: 0, cipher2: 0 }
    const errors = []

    // ── Check 1: folder name (10 pts) ────────────────────────────────────
    const entries = zip.getEntries()
    const folderEntry = entries.find(
      (e) => e.isDirectory && e.entryName.replace(/\/$/, '').toUpperCase() === expectedFolderName.toUpperCase()
    )
    if (folderEntry) {
      breakdown.folderName = 10
      score += 10
    } else {
      errors.push(`Folder name mismatch. Expected: ${expectedFolderName}`)
    }

    // ── Check 2 & 3: password validation (20 pts) ─────────────────────────
    // Try to read the .txt entry using the expected password
    const txtEntry = entries.find((e) => !e.isDirectory && e.entryName.endsWith('.txt'))
    if (!txtEntry) {
      errors.push('No .txt file found inside the ZIP')
    } else {
      try {
        // adm-zip reads password-protected entries via getData with password option
        const content = zip.readAsText(txtEntry, expectedPassword)
        if (content && content.trim().toUpperCase() === assignedTeamName.toUpperCase()) {
          breakdown.cipher1 = 10
          breakdown.cipher2 = 10
          score += 20
        } else {
          // Password worked but content mismatch — give partial credit for cracking it
          breakdown.cipher1 = 5
          breakdown.cipher2 = 5
          score += 10
          errors.push(`.txt content mismatch. Expected your original team name: ${assignedTeamName}`)
        }
      } catch {
        errors.push('ZIP password incorrect — verify your cipher chain application')
      }
    }

    // ── Save submission ────────────────────────────────────────────────────
    const teamId = req.team?.teamId || req.team?.id
    await ZerOneSubmission.create({
      teamId,
      round: 2,
      type: 'zip',
      score,
      breakdown,
      errors,
      filePath: req.file.path,
    })

    // Update team round2Score
    await Team.findByIdAndUpdate(teamId, { $inc: { round2Score: score, score } })

    // Emit leaderboard refresh
    req.app.get('io').emit('leaderboard:update')

    res.json({ success: true, score, breakdown, errors })
  } catch (err) {
    console.error('Round 2 submission error:', err)
    res.status(500).json({ message: 'Server error during ZIP validation', detail: err.message })
  }
}
