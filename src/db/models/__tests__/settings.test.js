const { teardownDb } = require('../../../lib/testHelpers/testUtils')
const db = require('../')

beforeAll(async () => {
  await db.DefaultSettings.create({ key: 'users.defaults', value: '{}' })
})

afterAll(async () => {
  await db.DefaultSettings.destroy({ where: { key: 'users.defaults' } })
  await teardownDb()
})

describe('Settings-CRUD', () => {
  test('It should create a Settings record', async () => {
    const { key } = await db.Settings.create({ key: 'users.defaults', value: '{}' })
    expect(key).toBe('users.defaults')
    return db.Settings.destroy({ where: { key } })
  })
})
