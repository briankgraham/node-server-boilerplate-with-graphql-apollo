const db = require('./../../db/models/')

const { modelTreeFactory, destroyTree } = require('./crudTestHelpers')
const { signup, encodeSession } = require('./../users')

module.exports = {
  teardownDb: async () =>
    new Promise(resolve =>
      db.sequelize.authenticate().then(e => {
        if (!e) {
          db.sequelize
            .close()
            .then(() => resolve())
            .catch(() => resolve())
        }
      })
    ),
  destroyTable: async table =>
    new Promise(resolve =>
      db[table]
        .destroy({ where: {} })
        .catch(e => {
          console.log('That did not go as planned when destroying a table in TESTS: ', e)
        })
        .then(() => resolve())
    ),
  createTestUserWithSession: async (id, role = 'external') => {
    const email = `${id}@me.com`
    const currentRole = await db.Role.findOne({ where: { type: role } })
    const user = await signup({
      body: {
        email,
        password: 'password',
        passwordRepeat: 'password',
        roleId: currentRole.id
      }
    })
    const savedUser = await user.save()
    return [savedUser, encodeSession(savedUser.id)]
  },
  createCRUDModelTree: async (table, customData = {}) => {
    if (!modelTreeFactory[table]) {
      throw new Error('Unsupported Model')
    }
    return modelTreeFactory[table](customData)
  },
  destroyCRUDModelTree: destroyTree,
  makeUserWithEmail: async (email, role = 'superadmin') => {
    const currentRole = await db.Role.findOne({ where: { type: role } })
    return {
      email,
      password: 'hello',
      passwordRepeat: 'hello',
      firstName: email.split('@')[0],
      lastName: email.split('@')[1],
      roleId: currentRole.id
    }
  }
}
