import mongoose from 'mongoose'
import dotenv from 'dotenv'
import Challenge from '../models/Challenge.js'
import Round from '../models/Round.js'
import CipherConfig from '../models/CipherConfig.js'

dotenv.config()

const challenges = [
  // ROUND 1: THE INFILTRATION (WARMUP & CIPHERS)
  {
    title: 'First Contact',
    description: 'The binary signal is simple. Decode the sequence: 01011010 01100101 01110010 01101111 01001111 01101110 01100101',
    type: 'flag',
    answer: 'ZeroOne',
    points: 50,
    round: 1,
    category: 'Binary',
    difficulty: 'Easy',
    hint: { text: 'Convert binary to ASCII.', cost: 5 }
  },
  {
    title: 'Caesar\'s Gateway',
    description: 'A message was left behind: "Wkh txlfn eurzq ira mxpsv". It uses a shift of 3. What is the original first word?',
    type: 'flag',
    answer: 'The',
    points: 75,
    round: 1,
    category: 'Crypto',
    difficulty: 'Easy',
    hint: { text: 'Decrement every letter by 3 places in the alphabet.', cost: 10 }
  },
  {
    title: 'Base Architecture',
    description: 'What base system uses digits 0-9 and letters A-F?',
    type: 'mcq',
    options: ['Binary', 'Octal', 'Decimal', 'Hexadecimal'],
    answer: 'Hexadecimal',
    points: 30,
    round: 1,
    category: 'General',
    difficulty: 'Easy'
  },
  {
    title: 'Protocol Identification',
    description: 'Which port is typically used for secure shell (SSH) access?',
    type: 'mcq',
    options: ['21', '22', '80', '443'],
    answer: '22',
    points: 40,
    round: 1,
    category: 'Network',
    difficulty: 'Easy'
  },
  {
    title: 'Hidden in Plain Sight',
    description: 'The flag is hidden in the metadata of this prompt. (Just kidding, it is static: zerone{hidden_data})',
    type: 'flag',
    answer: 'zerone{hidden_data}',
    points: 100,
    round: 1,
    category: 'OSINT',
    difficulty: 'Medium',
    hint: { text: 'Read the description carefully.', cost: 15 }
  },

  // ROUND 2: SYSTEM BREACH (TECH & LOGIC)
  {
    title: 'Bypass Mainframe',
    description: 'The central core requires an access token. The log shows a pattern: A1, B2, C3... What is the token for "Z"?',
    type: 'flag',
    answer: 'Z26',
    points: 150,
    round: 2,
    category: 'Logic',
    difficulty: 'Medium',
    hint: { text: 'A is 1st letter, B is 2nd...', cost: 30 }
  },
  {
    title: 'SQL injection 101',
    description: 'Which character is most commonly used to break out of a SQL string literal and start an injection?',
    type: 'mcq',
    options: [';', '\'', '--', '#'],
    answer: '\'',
    points: 100,
    round: 2,
    category: 'Web',
    difficulty: 'Medium'
  },
  {
    title: 'Network Sniffer',
    description: 'You captured a packet with the following hex: 48 65 6c 6c 6f. Decode it.',
    type: 'flag',
    answer: 'Hello',
    points: 120,
    round: 2,
    category: 'Network',
    difficulty: 'Medium',
    hint: { text: 'Hex to String.', cost: 20 }
  },
  {
    title: 'Secure Hash',
    description: 'Which of the following is NOT a hashing algorithm?',
    type: 'mcq',
    options: ['MD5', 'SHA-256', 'AES-128', 'Bcrypt'],
    answer: 'AES-128',
    points: 80,
    round: 2,
    category: 'Crypto',
    difficulty: 'Easy',
    hint: { text: 'One of these is for encryption, not hashing.', cost: 10 }
  },
  {
    title: 'Admin Session',
    description: 'Find the entry point. The server uses default credentials for the legacy database: admin/_____.',
    type: 'flag',
    answer: 'password',
    points: 200,
    round: 2,
    category: 'Exploit',
    difficulty: 'Medium',
    hint: { text: 'It is the most common password in the world.', cost: 50 }
  },

  // ROUND 3: THE CORE (ADVANCED CTF)
  {
    title: 'RSA Decoding',
    description: 'Given p=3, q=11, and e=3. Find the public key (n, e). Enter as "n,e".',
    type: 'flag',
    answer: '33,3',
    points: 300,
    round: 3,
    category: 'Crypto',
    difficulty: 'Hard',
    hint: { text: 'n = p * q', cost: 100 }
  },
  {
    title: 'Buffer Overflow',
    description: 'To overwrite the return address, how many bytes do we need to overflow if the buffer is 64 bytes and the EBP is 4 bytes?',
    type: 'flag',
    answer: '68',
    points: 400,
    round: 3,
    category: 'Pwn',
    difficulty: 'Hard',
    hint: { text: 'Buffer + EBP = overflow point.', cost: 150 }
  },
  {
    title: 'Zero-Day logic',
    description: 'A system is vulnerable to a Buffer Overflow if it uses which function?',
    type: 'mcq',
    options: ['strncpy', 'fgets', 'gets', 'snprintf'],
    answer: 'gets',
    points: 150,
    round: 3,
    category: 'Pwn',
    difficulty: 'Medium'
  },
  {
    title: 'Rootkit Discovery',
    description: 'The rootkit hides its presence by hooking which system call in Linux?',
    type: 'mcq',
    options: ['read', 'write', 'getdents', 'open'],
    answer: 'getdents',
    points: 250,
    round: 3,
    category: 'Forensics',
    difficulty: 'Hard'
  },
  {
    title: 'The Final Flag',
    description: 'The mainframe is wide open. Recover the core fragment: zerone{c0r3_cl34nup_succ3ss}',
    type: 'flag',
    answer: 'zerone{c0r3_cl34nup_succ3ss}',
    points: 1000,
    round: 3,
    category: 'General',
    difficulty: 'Extreme'
  }
]

const rounds = [
  { roundNumber: 1, isActive: true, duration: 3600 },
  { roundNumber: 2, isActive: false, duration: 3600 },
  { roundNumber: 3, isActive: false, duration: 3600 }
]

const cipherConfigs = [
  {
    round: 2,
    assignedTeamName: 'GHOST_ALPHA',
    passwordWord: 'KRYPTOS',
    folderCipher: { name: 'AES', params: { key: 'secret' } },
    passwordCipher1: { name: 'Shift', params: { shift: 5 } },
    passwordCipher2: { name: 'Reverse', params: {} }
  },
  {
    round: 3,
    correctFlag: 'zerone{final_vault_breached}',
    vaultCiphers: [
      { name: 'XOR', params: { key: 0xAA } },
      { name: 'Base64', params: {} }
    ]
  }
]

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI)
    console.log('Connected to MongoDB for seeding...')

    // Clear existing content (Optional, but good for fresh start)
    await Challenge.deleteMany({})
    await Round.deleteMany({})
    await CipherConfig.deleteMany({})

    // Insert new data
    await Challenge.insertMany(challenges)
    await Round.insertMany(rounds)
    await CipherConfig.insertMany(cipherConfigs)

    console.log('Seeding completed successfully!')
    console.log(`- ${challenges.length} Challenges added.`)
    console.log(`- ${rounds.length} Rounds initialized.`)
    console.log(`- ${cipherConfigs.length} CipherConfigs added.`)

    process.exit(0)
  } catch (err) {
    console.error('Seeding failed:', err)
    process.exit(1)
  }
}

seed()
