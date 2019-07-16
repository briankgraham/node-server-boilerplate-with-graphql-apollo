const jwt = require('jsonwebtoken')
const includes = require('lodash/includes')

const { getTenantSetting } = require('../settings')

const db = require('../../db/models')

const LIMIT = 20

const exportSafeUser = user => {
  if (!user) return user
  const object = user.toJSON ? user.toJSON() : user
  delete object.hash
  return object
}

const encodeSession = async userId => {
  const jwtSecret = await getTenantSetting('tenant.jwt.secret')
  const payload = jwt.sign({ userId }, jwtSecret)
  return payload
}

const decodeSession = async token => {
  const jwtSecret = await getTenantSetting('tenant.jwt.secret')
  const payload = jwt.verify(token, jwtSecret)
  if (!payload || !payload.userId) throw new Error(JSON.stringify({ status: 404, message: 'Invalid Token' }))
  return payload.userId
}

const getUsers = async ({ page = 1, limit = LIMIT, sortBy, sortDirection }) => {
  let order = [['fullName', 'ASC']]

  const sortFilters = {
    userFullName: direction => [['fullName', direction.toUpperCase()]],
    userEmail: direction => [['email', direction.toUpperCase()]]
  }

  if (Object.hasOwnProperty.call(sortFilters, sortBy)) {
    order = sortFilters[sortBy](sortDirection)
  }

  return db.User.findAndCountAll({
    limit,
    offset: limit * (page - 1),
    distinct: true,
    order,
    attributes: ['id', 'lookupId', 'email', 'createdAt', 'updatedAt', 'firstName', 'lastName', 'fullName'],
    include: [
      {
        model: db.Role,
        as: 'role',
        attributes: ['id', 'type'],
        required: false
      }
    ],
    where: {
      deactivatedAt: null
    }
  })
}

const getUser = async ({ id, email }) => {
  const query = id ? { id } : { email }
  const user = await db.User.findOne({ where: query, include: [{ model: db.Role, as: 'role' }] })
  if (user) {
    return { ...user, roles: [user.role.type] }
  }
  throw new Error(JSON.stringify({ status: 404, message: 'User not found' }))
}

const hasRole = (user, role) => includes(user.roles, role)

const requireRole = (user, role) => {
  if (!hasRole(user, role)) throw new Error(JSON.stringify({ status: 404, message: 'Permission denied' }))
}

module.exports = {
  exportSafeUser,
  encodeSession,
  decodeSession,
  getUsers,
  getUser,
  hasRole,
  requireRole
}
