const db = require('./../../db/models/')

const defaultData = {
  User: {
    firstName: 'User',
    lastName: 'Test',
    password: 'letmein',
    email: 'user.test@fakenodeapp.com'
  }
}

const createUserTree = async (tableData = {}) => ({
  User: await db.User.create({
    ...defaultData.User,
    ...(tableData.User || {})
  })
})

/* Helper functions to create a tree of sequelize models, along with their parent relationship
   All functions take two arguments:
    1: model name
    2: an object containing properties to set to each entity up the chain, keyed by model name:
      { User: { firstName: 'Sal' } }
      These will be passed up the chain and used instead of the default props
   All functions return a list of all created obects indexed by model Type
*/
module.exports = {
  modelTreeFactory: {
    User: createUserTree
  },
  destroyTree: async (tree, logging = false) => {
    if (!tree) {
      return
    }

    const modelList = ['User']

    // eslint-disable-next-line no-restricted-syntax
    for (const model of modelList) {
      if (tree[model]) {
        const { id } = tree[model]
        // eslint-disable-next-line no-await-in-loop
        await db[model].destroy({ where: { id }, logging })
      }
    }
  }
}
