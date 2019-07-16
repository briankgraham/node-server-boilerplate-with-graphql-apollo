// NOTE: Helpers to retrieve any Tenant Setting, or any Default Setting
const Sequelize = require('sequelize')
const isPlainObject = require('lodash/isPlainObject')

const { DefaultSettings, Settings } = require('./../db/models/')

const { Op } = Sequelize

// getDefaultSetting: EXAMPLE: 'tenant.feature.notifications' -> { setting1: '', setting2: '' }
// Used if you need the settings for a Model. Get the default settings, and merge w/ Model Settings
// getTenantSetting: if you need one setting (merges defaults with overrides) Example: 'tenant.feature.jedi' -> return { type: 'sith-lord' }
// getTenantSettings: regex matches a group of settings (merges defaults with overrides) Example: 'tenant.feature' -> returns { feature1: '', feature2: '', etc. }
module.exports = {
  getDefaultSetting: async key => findOneSetting(key, DefaultSettings),
  getTenantSetting: async key => {
    const [defaults, overrides] = await findAndCombineSettings(key)
    const { value: defaultVal } = defaults
    const overrideVal = overrides ? overrides.value : null

    if (isPlainObject(defaultVal)) {
      return Object.assign(defaultVal, overrideVal)
    }

    return overrideVal || defaultVal
  },
  getTenantSettings: async key => {
    const [defaults, overrides] = await findAndCombineSettingsThatMatch(key) // each is an array of objects
    return Object.assign({}, ...defaults.map(({ value }) => value), ...overrides.map(({ value }) => value))
  }
}

// ****** FUNCTION-HELPERS ***********
async function findOneSetting(key, model) {
  return model.findOne({
    where: { key },
    attributes: ['value'],
    raw: true
  })
}

async function findAndCombineSettings(key) {
  return Promise.all([findSetting(key, DefaultSettings), findSetting(key, Settings)])
}

async function findSetting(key, model) {
  return model.findOne({
    where: { key },
    attributes: ['value'],
    raw: true
  })
}

async function findAndCombineSettingsThatMatch(key) {
  return Promise.all([findSettingsThatMatch(key, DefaultSettings), findSettingsThatMatch(key, Settings)])
}

async function findSettingsThatMatch(key, model) {
  return model.findAll({
    where: { key: { [Op.like]: `${key}.%` } },
    attributes: ['value'],
    raw: true
  })
}
