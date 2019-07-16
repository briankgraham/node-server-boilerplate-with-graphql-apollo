const db = require('../../../db/models/')
const { teardownDb } = require('../../../lib/testHelpers/testUtils')
const { signup, authenticate, encodeSession, decodeSession, hasRole, requireRole, exportSafeUser, archiveUser } = require('../index')

const getUserDefaults = async () => {
  const adminRole = await db.Role.findOne({ where: { type: 'admin' } })
  const email = 'sam-dev@fakenodeapp.com'
  return {
    email,
    password: 'hello',
    passwordRepeat: 'hello',
    firstName: 'Sam',
    lastName: 'Dev',
    roleId: adminRole.id
  }
}

describe('Users', () => {
  afterAll(async () => {
    await db.User.destroy({ where: { email: 'sam-dev@fakenodeapp.com' } })
    await teardownDb()
  })

  test('It should not be able to sign up a user without a password', async () => {
    expect.assertions(1)
    const signupParams = await getUserDefaults()
    delete signupParams.password
    await signup({ body: signupParams }).catch(e => {
      expect(e.message).toMatch('password to not be blank')
    })
  })

  test('It should not be able to sign up a user without passwordRepeat', async () => {
    expect.assertions(1)
    const signupParams = await getUserDefaults()
    signupParams.password = 'foo'
    signupParams.passwordRepeat = 'bar'
    await signup({
      body: signupParams
    }).catch(e => {
      expect(e.message).toMatch('passwords to match')
    })
  })

  test('It should return a user object with a valid hash and no password', async () => {
    const signupParams = await getUserDefaults()
    const user = await signup({
      body: signupParams
    })
    expect(!user.password)
    expect(user.hash.length).toBe(60)
    return user.destroy()
  })

  test('It should not allow duplicate users', async () => {
    expect.assertions(1)
    const signupParams = await getUserDefaults()
    const user = await signup({
      body: signupParams
    })
    await signup({
      body: signupParams
    }).catch(e => {
      expect(e.message).toMatch('already')
    })
    return user.destroy()
  })

  test('It should authenticate properly', async () => {
    expect.assertions(6)
    const signupParams = await getUserDefaults()
    const { email, password } = signupParams

    await signup({
      body: signupParams
    })
    await authenticate(email, null).catch(e => {
      expect(e.message).toMatch('Password cannot be blank')
    })
    await authenticate(email, '').catch(e => {
      expect(e.message).toMatch('Password cannot be blank')
    })
    await authenticate('', 'sth').catch(e => {
      expect(e.message).toMatch('Email cannot be blank')
    })
    await authenticate(email, 'badPassword').catch(e => {
      expect(e.message).toMatch('Incorrect email or password')
    })
    await authenticate('bademail@doesntexist.com', signupParams.password).catch(e => {
      expect(e.message).toMatch('Incorrect email or password')
    })
    const user = await authenticate(email, password)
    expect(user.email).toBe(email)
    const retrievedUser = await db.User.findOne({ where: { email } })
    return retrievedUser.destroy()
  })

  test('It should be able to check a role', () => {
    expect(hasRole({ roles: ['standard'] }, 'admin')).toBe(false)
    expect(() => requireRole({ role: 'superadmin' }, 'admin')).toThrow('Permission denied')
  })

  test('It should be able to encode and decode a session', async () => {
    const userId = 999
    const badToken = 'bla'
    const goodToken = await encodeSession(userId)
    expect(goodToken.length).toBe(123)
    expect(await decodeSession(goodToken)).toBe(userId)
    try {
      await decodeSession(badToken)
    } catch (err) {
      expect(err.toString()).toBe('JsonWebTokenError: jwt malformed')
    }
  })

  test('It should convert a user to a safe user object without password hash', async () => {
    const signupParams = await getUserDefaults()
    const user = await signup({
      body: signupParams
    })
    expect(user.hash.length).toBe(60)
    expect(!!exportSafeUser(user).hash).toBe(false)
    await user.destroy()
  })

  test('It should allow user archiving', async () => {
    expect.assertions(2)
    const signupParams = await getUserDefaults()
    const user = await signup({
      body: signupParams
    })
    expect(user.deactivatedAt).toBe(null)
    const output = await archiveUser(user.id)
    expect(output.deactivatedAt).toEqual(expect.any(Date))
  })
})
