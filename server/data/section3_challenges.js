// Section 3 — Cipher Challenges with Purchasable Hints
// Each challenge has 3 hints (30% / 50% / 70% solution revealed)
// Hint cost: Hint 1 = -10pts, Hint 2 = -20pts, Hint 3 = -30pts

export const SECTION3_CHALLENGES = [
  {
    index: 0,
    title: 'The Invisible Ink',
    category: 'Steganography',
    points: 100,
    difficulty: 'Easy',
    description: `A secret message has been hidden in plain sight. 
The message below seems like random text, but every 5th character has been marked. 
Extract the marked characters to reveal the hidden word.

MARKED TEXT:
A[X]bcde[G]fghi[E]jklm[N]nopq[T]rstuv[L]wxyz[E]01234[M]56789[A]BCDEF[N]

The extracted characters form a key term used in cybersecurity. What is it?`,
    answer: 'GENTLEMEN',
    hints: [
      'Look at the characters inside the square brackets [ ] only.',
      'There are 9 marked characters total in the text. Read them in order left to right.',
      'The word starts with G and ends with N. It has 9 letters.',
    ],
  },
  {
    index: 1,
    title: 'Binary Whisperer',
    category: 'Encoding',
    points: 100,
    difficulty: 'Easy',
    description: `Decode this binary message to reveal a secret word.
Each group of 8 bits represents one ASCII character.

01000011 01011001 01000010 01000101 01010010

What is the decoded word?`,
    answer: 'CYBER',
    hints: [
      'Binary to ASCII: convert each 8-bit group to its decimal value, then to a character.',
      'First group 01000011 = 67 in decimal = ASCII "C". Continue for the rest.',
      'The word has 5 letters. 67=C, 89=Y, 66=B, 69=E, 82=R.',
    ],
  },
  {
    index: 2,
    title: 'The Number Code',
    category: 'Cryptography',
    points: 100,
    difficulty: 'Easy',
    description: `Each letter of the alphabet has been replaced by its corresponding number (A=1, B=2, C=3, and so on).

Decode the following sequence to find the secret word:

8 - 1 - 3 - 11 - 5 - 18

What is the decoded word?`,
    answer: 'HACKER',
    hints: [
      'Look at the alphabet. The 1st letter is A, the 2nd is B. What is the 8th letter?',
      'The first letter (8) is H and the second letter (1) is A.',
      'The numbers map exactly to H-A-C-K-E-R.',
    ],
  },
]

export const HINT_COSTS = { 1: 10, 2: 20, 3: 30 }
