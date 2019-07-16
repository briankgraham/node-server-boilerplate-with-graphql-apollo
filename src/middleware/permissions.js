const { catchErrors } = require('../lib/utils/asyncErrorHandler')

const checkPermissions = role => async (req, res, next) => {
  if (!req.session.userId) {
    throw new Error('Could not authenticate user')
  }

  if (req.session.roles[0] !== role) {
    throw new Error('User does not have proper access')
  }

  next()
}

const can = role => catchErrors(checkPermissions(role))

const graphQlCan = role => checkPermissions(role)

module.exports = { can, graphQlCan }
