const deleting = require('./delete')
const retrieval = require('./retrieval')
const storing = require('./storing')

module.exports = {
  ...retrieval,
  ...storing,
  ...deleting
}
