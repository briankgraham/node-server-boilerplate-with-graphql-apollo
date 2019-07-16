const types = require('../types')

module.exports = (sequelize, DataTypes) => {
  const Settings = sequelize.define(
    'Settings',
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
  Settings.associate = models => {
    Settings.belongsTo(models.DefaultSettings, {
      foreignKey: 'key'
    })
  }

  return Settings
}
