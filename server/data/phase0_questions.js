// Phase 0 — Log-Based MCQ Questions
// Source: log_questions.txt + 150log.txt

export const PHASE0_QUESTIONS = [
  {
    id: 1,
    question: 'Which user repeatedly failed login attempts throughout the logs?',
    options: ['User_09', 'User_02', 'User_14', 'User_30'],
    answer: 'B', // User_02
    section: 'A',
  },
  {
    id: 2,
    question: 'Which IP address is associated with repeated failed logins?',
    options: ['192.168.1.32', '192.168.1.11', '192.168.1.59', '192.168.1.45'],
    answer: 'B', // 192.168.1.11
    section: 'A',
  },
  {
    id: 3,
    question: 'What does "LOGIN_SUCCESS" indicate?',
    options: ['Failed login', 'Unauthorized access', 'Successful authentication', 'System error'],
    answer: 'C',
    section: 'A',
  },
  {
    id: 4,
    question: 'Which action represents downloading a file?',
    options: ['ACCESS_SETTINGS', 'REQUEST_FILE', 'DOWNLOAD', 'UPLOAD_FILE'],
    answer: 'C',
    section: 'A',
  },
  {
    id: 5,
    question: 'What does "ACCESS_DENIED" mean?',
    options: ['Access granted', 'Login successful', 'Permission restricted', 'File uploaded'],
    answer: 'C',
    section: 'A',
  },
  {
    id: 6,
    question: 'Which user accessed "/admin_panel" but was denied?',
    options: ['User_22', 'User_28', 'User_30', 'All of the above'],
    answer: 'D',
    section: 'B',
  },
  {
    id: 7,
    question: 'What pattern is visible in User_02 activity?',
    options: ['Frequent successful logins', 'Repeated failed login attempts', 'File downloads', 'Upload activity'],
    answer: 'B',
    section: 'B',
  },
  {
    id: 8,
    question: 'Which type of action appears most frequently overall?',
    options: ['ERROR', 'WARN', 'INFO', 'DEBUG'],
    answer: 'C',
    section: 'B',
  },
  {
    id: 9,
    question: 'Which action indicates uploading data to the server?',
    options: ['DOWNLOAD', 'REQUEST_FILE', 'UPLOAD_FILE', 'ACCESS_REPORTS'],
    answer: 'C',
    section: 'B',
  },
  {
    id: 10,
    question: 'Which user performed both LOGIN_SUCCESS and ACCESS_DENIED actions?',
    options: ['User_28', 'User_13', 'User_05', 'All of the above'],
    answer: 'D',
    section: 'B',
  },
  {
    id: 11,
    question: 'What type of cyber attack is most likely indicated in the logs?',
    options: ['Phishing', 'SQL Injection', 'Brute-force attack', 'Malware'],
    answer: 'C',
    section: 'C',
  },
  {
    id: 12,
    question: 'Which resource is most frequently denied access?',
    options: ['/admin_panel', '/root', '/secure_data', 'All are frequent'],
    answer: 'D',
    section: 'C',
  },
  {
    id: 13,
    question: 'Which user appears multiple times performing DOWNLOAD actions?',
    options: ['User_28', 'User_04', 'User_10', 'All of the above'],
    answer: 'D',
    section: 'C',
  },
  {
    id: 14,
    question: 'What is the best way to analyze such logs efficiently?',
    options: ['Read randomly', 'Focus only on INFO logs', 'Identify patterns and repeated entries', 'Ignore timestamps'],
    answer: 'C',
    section: 'C',
  },
  {
    id: 15,
    question: 'Which behavior is most suspicious?',
    options: ['Single login success', 'Repeated login failures from same IP', 'Accessing dashboard', 'Downloading files'],
    answer: 'B',
    section: 'C',
  },
]

export const POINTS_PER_QUESTION = 10
export const TOTAL_QUESTIONS = 15
