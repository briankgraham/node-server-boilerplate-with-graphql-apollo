const capitalize = require('lodash/capitalize')
const compact = require('lodash/compact')

// Split by spaces and hyphens, then capitalize them.
module.exports = name => {
  if (name.length > 255) throw new Error(JSON.stringify({ status: 422, message: 'Name is too long' }))
  // NOTE: taken from here: https://stackoverflow.com/questions/26858833/capitalization-regex-to-allow-for-hyphenated-names
  return compact(name.split(' '))
    .map(word =>
      word
        .split(/[-–]/)
        .map(capitalize)
        .join('-')
    )
    .join(' ')
}
