const { teardownDb } = require('./../../lib/testHelpers/testUtils')
const db = require('./../../db/models/')
const { getDefaultSetting, getTenantSetting } = require('./../../lib/settings')
const { userMiscDefaultKey, userMiscDefaultValue } = require('./../__mocks__/userSettings')

const key = 'test.setting'
const defaultValue = 'default'
const overrideValue = 'override'

beforeAll(async () => {
  await db.DefaultSettings.create({ key, value: defaultValue })
  await db.DefaultSettings.create({ key: userMiscDefaultKey, value: userMiscDefaultValue })
  await db.Settings.create({ key, value: overrideValue })
})

afterAll(async () => {
  await db.Settings.destroy({ where: { key } })
  await db.DefaultSettings.destroy({ where: { key } })
  await db.DefaultSettings.destroy({ where: { key: userMiscDefaultKey } })
  await db.User.destroy({ where: { email: 'mememe@fake.com' } })
  await teardownDb()
})

describe('Settings Test', () => {
  test('It should correctly return a default setting', async () => {
    const { value } = await getDefaultSetting(key)
    expect(value).toBe(defaultValue)
  })
  test('It should correctly return a tenant-level setting instead of a default', async () => {
    const value = await getTenantSetting(key)
    expect(value).toBe(overrideValue)
  })
})
