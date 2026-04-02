import { z } from 'zod'

export const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse({
    body: req.body,
    query: req.query,
    params: req.params,
  })

  if (!result.success) {
    const errors = result.error?.issues || result.error?.errors || []
    return res.status(400).json({
      message: 'Validation failed',
      errors: errors.map(e => ({ path: e.path?.join('.'), message: e.message }))
    })
  }

  next()
}
