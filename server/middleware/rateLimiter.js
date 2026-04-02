import rateLimit from 'express-rate-limit'

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 login requests per windowMs
  message: { message: 'Too many login attempts, please try again after 15 minutes' }
})

export const submissionLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // Limit each IP to 30 submissions per minute
  message: { message: 'Too many submissions, please wait a minute' }
})
