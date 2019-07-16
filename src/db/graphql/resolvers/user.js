// Resolvers: A map of functions which return data for the schema.
const { authenticate, getUsers, exportSafeUser } = require('../../../lib/users')
const { getTenantSettings } = require('../../../lib/settings')
const { can } = require('./../auth')

const getUserSettings = async userSettings => {
  const defaultSettings = await getTenantSettings('user.defaults')
  return Object.assign(defaultSettings, userSettings)
}

module.exports = {
  Query: {
    getUserWithAuth: async (parent, { email, password }, { req }) => {
      const rawUser = await authenticate(email, password)
      const user = exportSafeUser(rawUser)
      req.session.loggedIn = true
      req.session.userId = user.id
      req.session.roles = user.roles
      user.settings = await getUserSettings(user.settings)
      return user
    },
    getUserAuthVerification: async (parent, args, { req }) => ({ isLoggedIn: !!req.session.loggedIn }),
    getUser: can('superadmin').createResolver(async (parent, args, { db, req }) => {
      const user = await db.User.findOne({ where: { id: req.session.userId } })
      user.settings = await getUserSettings(user.settings)
      return user
    }),
    getUsers: can('superadmin').createResolver(async (parent, args, { req }) => {
      const rawUsers = await getUsers(args, req.session.userId)
      const users = rawUsers.rows.map(user => exportSafeUser(user))
      return {
        list: users,
        count: users.length
      }
    })
  },
  Mutation: {
    updateUser: can('superadmin').createResolver(async (parent, args, { req }) => {
      // Merge existing settings with new settings and update entire object
      if (args.settings) {
        args.settings = Object.assign(req.User.settings, args.settings)
      }
      const user = await req.User.update(args, { returning: true })
      user.settings = await getUserSettings(user.settings)
      return user
    })
  }
}
