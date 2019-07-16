const { createResolver } = require('./helpers')
const { graphQlCan: can } = require('../../middleware/permissions')

const userCan = features =>
  createResolver(async (parent, args, { req }) => {
    if (Array.isArray(features)) {
      return Promise.all(features.map(async feature => can(feature)(req, {}, () => {})))
    }
    return can(features)(req, {}, () => {})
  })

module.exports = { can: userCan }
