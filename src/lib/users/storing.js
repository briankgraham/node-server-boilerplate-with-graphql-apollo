const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const db = require('../../db/models/')
const { getTenantSetting } = require('../settings')

const BCRYPT_SALT_ROUNDS = 10

const signup = async ({ body = {}, User = db.User }) => {
  const { email, firstName, lastName, password, passwordRepeat, roleId } = body

  if (!roleId) throw new Error(JSON.stringify({ status: 422, message: 'Need role for user' }))
  const user = await User.build({
    email,
    firstName,
    lastName,
    roleId
  })

  // Check if user email is unique
  if ((await User.count({ where: { email } })) > 0) {
    throw new Error(JSON.stringify({ status: 409, message: 'User with that email already exists' }))
  }

  // Check password and generate hash
  if (!password || !password.length) throw new Error(JSON.stringify({ status: 400, message: 'Expected password to not be blank' }))
  if (password !== passwordRepeat) throw new Error(JSON.stringify({ status: 400, message: 'Expected passwords to match' }))

  const salt = await bcrypt.genSalt(BCRYPT_SALT_ROUNDS)
  user.hash = await bcrypt.hash(password, salt)

  // Save
  const savedUser = await user.save()

  return savedUser
}

const authenticate = async (email, password) => {
  if (!email) throw new Error(JSON.stringify({ status: 400, message: 'Email cannot be blank' }))
  if (!password || !password.length) throw new Error(JSON.stringify({ status: 400, message: 'Password cannot be blank' }))

  const user = await db.User.findOne({
    where: {
      email: email.toLowerCase(),
      deactivatedAt: null
    },
    include: [
      {
        model: db.Role,
        as: 'role',
        attributes: ['id', 'type', 'createdAt', 'updatedAt']
      }
    ]
  })
  if (user) {
    const comparison = await bcrypt.compare(password, user.hash)
    if (comparison === true) {
      return { ...user.toJSON(), roles: [user.role.type] }
    }
  }
  throw new Error(JSON.stringify({ status: 404, message: 'Incorrect email or password' }))
}

const inviteUser = async (email, role, firstName = '', lastName = '') => {
  // encode email with tenant's jwt secret
  // make a call to Mandrill with invitationToken as part of payload or something
  const jwtSecret = await getTenantSetting('tenant.jwt.secret')
  const token = jwt.sign({ email, role, firstName, lastName }, jwtSecret, { expiresIn: '7d' })

  if ((await db.User.count({ where: { email } })) > 0) {
    throw new Error(JSON.stringify({ status: 409, message: 'User with that email already exists' }))
  }

  return {
    email,
    firstName,
    lastName,
    token,
    fromFirstName: '',
    fromLastName: ''
  }
}

const forgotPassword = async user => jwt.sign({ userId: user.id }, user.hash, { expiresIn: '24h' })

const resetPassword = async (user, resetPasswordToken, newPassword) => {
  const payload = jwt.verify(resetPasswordToken, user.hash)
  if (!payload || payload.userId !== user.id) {
    throw new Error(JSON.stringify({ status: 403, message: 'Invalid reset password token given, could not reset password' }))
  }
  await setPassword(user, newPassword)
  return user.save()
}

const setPassword = async (user, newPassword) => {
  const salt = await bcrypt.genSalt(BCRYPT_SALT_ROUNDS)
  const hash = await bcrypt.hash(newPassword, salt)
  user.set({ hash })
  return user.save()
}

const updateUser = async (userId, body) => {
  const rawUser = await db.User.findOne({
    where: {
      id: userId
    },
    include: [
      {
        model: db.Role,
        as: 'role',
        required: false,
        attributes: ['id', 'type', 'createdAt', 'updatedAt']
      }
    ]
  })
  if (!rawUser) {
    throw new Error(JSON.stringify({ status: 400, message: 'No such user when updating user' }))
  }

  if (body.email) {
    const doesEmailExist = await db.User.count({
      where: {
        id: {
          [db.sequelize.Op.ne]: userId
        },
        email: body.email
      }
    })
    if (doesEmailExist) throw new Error(JSON.stringify({ status: 409, message: 'Cannot update user, email already exists' }))
  }

  rawUser.set(body)
  await rawUser.save()
  return rawUser
}

const updatePrimaryUserRole = async (userId, roleId) => {
  const user = await db.User.findOne({ where: { id: userId } })
  await user.update({ roleId })
  return db.User.findOne({
    where: { id: userId },
    include: [
      {
        model: db.Role,
        as: 'role',
        attributes: ['id', 'type', 'createdAt', 'updatedAt']
      }
    ]
  })
}

module.exports = {
  signup,
  authenticate,
  inviteUser,
  forgotPassword,
  resetPassword,
  setPassword,
  updateUser,
  updatePrimaryUserRole
}
