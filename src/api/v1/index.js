const { Router } = require('express')
const { version } = require('./../../../package.json')

module.exports = () => {
  const api = Router()

  api.get('*', async (req, res, next) => {
    if (!/api/.test(req.url)) {
      return res.status(400).json({ errors: 'Bad Request' })
    }
    return next()
  })

  api.get('/api/v1', (req, res) => {
    const protocolVersion = 1
    res.json({ version, protocolVersion })
  })

  return api
}
