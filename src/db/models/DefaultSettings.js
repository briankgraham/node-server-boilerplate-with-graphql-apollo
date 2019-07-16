const types = require('../types')

module.exports = (sequelize, DataTypes) => {
  const DefaultSettings = sequelize.define(
    'DefaultSettings',
    {
      key: { type: DataTypes.STRING, primaryKey: true },
      value: types.get('settings'),
      createdAt: types.get('createdAt'),
      updatedAt: types.get('updatedAt')
    },
    {
      freezeTableName: true
    }
  )

  return DefaultSettings
}
