const formatName = require('./../../lib/utils/createFullNameForDB')
const types = require('../types')
const { tokenize } = require('../tokenizeField')

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    'User',
    {
      id: types.get('id'),
      lookupId: types.get('lookupId'),
      email: { type: DataTypes.STRING, allowNull: false, validate: { min: 3 } },
      firstName: { type: DataTypes.STRING },
      lastName: { type: DataTypes.STRING },
      fullName: { type: DataTypes.STRING },
      hash: { type: DataTypes.STRING },
      settings: types.get('settings'),
      createdAt: types.get('createdAt'),
      updatedAt: types.get('updatedAt'),
      deactivatedAt: types.get('deactivatedAt')
    },
    {
      freezeTableName: true
    }
  )
  User.associate = models => {
    User.belongsTo(models.Role, {
      as: 'role',
      foreignKey: 'roleId'
    })
  }
  /* eslint-disable no-param-reassign */
  User.addHook('beforeCreate', instance => {
    let fullName = ''
    if (instance.firstName) {
      instance.firstName = formatName(instance.firstName)
      fullName = `${instance.firstName} `
    }
    if (instance.lastName) {
      instance.lastName = formatName(instance.lastName)
      fullName = `${fullName}${formatName(instance.lastName)}`
    }
    if (!instance.firstName) fullName = null
    instance.fullName = fullName
  })

  tokenize(User, 'lookupId')

  return User
}
