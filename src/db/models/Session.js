module.exports = (sequelize, DataTypes) => {
  const Session = sequelize.define(
    'session',
    {
      sid: { type: DataTypes.STRING, primaryKey: true },
      data: { type: DataTypes.JSON },
      expires: DataTypes.DATE
    },
    {
      freezeTableName: true
    }
  )

  return Session
}
