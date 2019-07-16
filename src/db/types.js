const sequelize = require('sequelize')

const defaults = {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: sequelize.DataTypes.INTEGER
  },
  lookupId: {
    type: sequelize.DataTypes.STRING,
    unique: true
  },
  settings: {
    type: sequelize.DataTypes.JSONB
  },
  title: {
    type: sequelize.DataTypes.STRING
  },
  createdAt: {
    type: sequelize.DataTypes.DATE
  },
  deactivatedAt: {
    type: sequelize.DataTypes.DATE,
    allowNull: true
  },
  updatedAt: {
    type: sequelize.DataTypes.DATE
  },
  lockedAt: {
    type: sequelize.DataTypes.DATE
  },
  isActive: {
    type: sequelize.DataTypes.BOOLEAN
  }
}

module.exports = {
  // don't return the object, sequelize treats them as mutables
  get: key => ({ ...defaults[key] })
}
