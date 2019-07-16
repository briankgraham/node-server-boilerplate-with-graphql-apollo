jest.mock('sequelize')
jest.mock('fs')

const db = jest.genMockFromModule('../index')

const Chance = require('chance')

let mockModelStore = []

const createRandomDefaultSettings = (seed, params = {}) => {
  const chance = new Chance('defaultSettings', seed)
  const { defaultSettingsId } = params
  const obj = {
    id: defaultSettingsId || chance.integer({ min: 1, max: 99999 })
  }
  return {
    ...obj,
    toJSON: () => Object.assign({}, obj)
  }
}

const clearMockStore = () => {
  mockModelStore = []
}

const addMockDefaultSettings = (seed, params) => {
  if (!mockModelStore.DefaultSettings) mockModelStore.DefaultSettings = []
  const obj = createRandomDefaultSettings(seed, params)
  mockModelStore.DefaultSettings.push(obj)
  return obj
}

const mockedDb = {
  ...db,
  clearMockStore,
  addMockDefaultSettings,
  DefaultSettings: {
    findOne: jest.fn(() => (mockModelStore.DefaultSettings && mockModelStore.DefaultSettings[0]) || addMockDefaultSettings(1))
  }
}

// Populate mock store with one random entity to start to minimize test boilerplate in simple cases
// In a more complex test, in the `beforeEach`, there is always the option
// to clear the mock store (clearMockStore)
mockedDb.addMockDefaultSettings(1)

mockedDb.sequelize = {
  QueryTypes: {
    SELECT: 'SELECT'
  }
}

module.exports = mockedDb
