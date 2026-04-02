import jwt from 'jsonwebtoken'

export const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return res.status(401).json({ message: 'No token provided' })

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    if (decoded.role !== 'team' && !decoded.teamId) {
      return res.status(403).json({ message: 'Not a team account' })
    }
    req.team = decoded
    next()
  } catch {
    res.status(401).json({ message: 'Invalid token' })
  }
}

export const verifyAdmin = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return res.status(401).json({ message: 'No token provided' })

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    if (!['superadmin', 'judge'].includes(decoded.role)) {
      return res.status(403).json({ message: 'Not an admin account' })
    }
    req.admin = decoded
    next()
  } catch {
    res.status(401).json({ message: 'Invalid token' })
  }
}

export const roleBasedAccess = (roles = []) => {
  return (req, res, next) => {
    if (!req.admin || !roles.includes(req.admin.role)) {
      return res.status(403).json({ message: 'Forbidden' })
    }
    next()
  }
}