const redis = require('redis')
const { promisify } = require('util')

let get = async () => {}
let set = async () => {}
let del = async () => {}
let resetCacheIfExists = async () => {}

const client = process.env.NODE_ENV !== 'test' ? redis.createClient({ host: process.env.MOCK_CACHE_HOST }) : null

if (process.env.NODE_ENV !== 'test') {
  get = promisify(client.get).bind(client)
  set = promisify(client.set).bind(client)
  del = promisify(client.del).bind(client)
  resetCacheIfExists = async key => {
    const cachedUser = await get(key)
    if (cachedUser) {
      await del(key)
      return true
    }
    return false
  }
}

module.exports = { get, set, del, resetCacheIfExists }
