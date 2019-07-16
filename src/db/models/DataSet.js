const types = require('../types')

module.exports = (sequelize, DataTypes) => {
  const DataSet = sequelize.define(
    'DataSet',
    {
      id: types.get('id'),
      title: types.get('title'),
      createdAt: types.get('createdAt'),
      updatedAt: types.get('updatedAt'),
      deactivatedAt: types.get('deactivatedAt'),
      language: { type: DataTypes.STRING },
      mongoId: { type: DataTypes.STRING }
    },
    {
      freezeTableName: true
    }
  )
  DataSet.associate = models => {
    DataSet.belongsTo(models.User, {
      as: 'user',
      foreignKey: 'userId'
    })
  }

  return DataSet
}
