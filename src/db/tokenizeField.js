const shortid = require('shortid')

module.exports = {
  // This function takes a Sequelize model and a list of fields
  // It sets up create hooks to ensure that all fields listed
  // get a token when the model is created
  tokenize: (Model, fields) => {
    const fieldLists = Array.isArray(fields) ? fields : [fields]

    const hookHandler = instance => {
      fieldLists.forEach(field => {
        // if the field has a value, leave it alone
        if (!instance[field]) {
          // eslint-disable-next-line no-param-reassign
          instance[field] = shortid.generate()
        }
      })
    }

    const hookHandlerBulk = instances => {
      instances.forEach(instance => hookHandler(instance))
    }

    // Model.addHook('beforeUpdate', hookHandler)
    Model.addHook('beforeCreate', hookHandler)
    // Model.addHook('beforeBulkUpdate', hookHandlerBulk)
    Model.addHook('beforeBulkCreate', hookHandlerBulk)
  }
}
