const session = require('express-session')
const SequelizeStore = require('connect-session-sequelize')(session.Store)

const db = require('../db/models/')

const isProduction = process.env.NODE_ENV === 'production'

module.exports = {
  sessionMiddleware: session({
    store: new SequelizeStore({
      db: db.sequelize,
      table: 'session'
    }),
    name: 'sid',
    secret: process.env.MOCK_SESSION_SECRET,
    resave: false,
    httpOnly: isProduction,
    secure: isProduction,
    saveUninitialized: false,
    maxAge: 30 * 24 * 60 * 60 * 1000,
    cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 } // 30 days
  }),
  verifySession: (req, res, next) => {
    if (!req.session.loggedIn) {
      throw new Error(JSON.stringify({ status: 403 }))
    }
    next()
  },
  destroySession: (req, res) => {
    req.session.destroy(() => {
      res.json({ result: { success: true } })
    })
  }
}
