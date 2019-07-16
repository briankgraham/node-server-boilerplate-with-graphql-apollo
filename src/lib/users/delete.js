const db = require('../../db/models/')

const deleteUser = async userId => {
  const user = await db.User.findOne({
    where: {
      id: userId
    }
  })
  if (!user) {
    throw new Error(JSON.stringify({ status: 404, message: 'No such user when deleting user' }))
  }
  return user.destroy()
}

const archiveUser = async userId => {
  const rawUser = await db.User.findOne({
    where: {
      id: userId,
      deactivatedAt: null
    }
  })
  if (!rawUser) {
    throw new Error(JSON.stringify({ status: 404, message: 'No such user when archiving user' }))
  }
  return rawUser.update({ deactivatedAt: Date.now() })
}

module.exports = {
  deleteUser,
  archiveUser
}
