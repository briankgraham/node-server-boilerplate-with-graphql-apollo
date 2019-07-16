const { Router } = require('express')
const { catchErrors } = require('../lib/utils/asyncErrorHandler')
const { sessionMiddleware } = require('./session')

// add middleware that could occur on all routes
// Example: check for users session / cookie
module.exports = () => {
  const routes = Router()

  routes.use(sessionMiddleware)

  routes.use(
    catchErrors(async (req, res, next) => {
      if (req.url === '/api/health') return res.sendStatus(200)

      const { headers } = req
      if (headers.authorization && !!/Basic/.test(headers.authorization)) {
        const [, base64key] = headers.authorization.split(' ')
        const [basicAuthKey] = Buffer.from(base64key, 'base64')
          .toString('ascii')
          .split(':')
        // NOTE: Pass basicAuthKey down to any route that needs it.
        // Can be decoded on a per-route basis.
        req.basicAuthKey = basicAuthKey
      }
      return next()
    })
  )

  return routes
}
