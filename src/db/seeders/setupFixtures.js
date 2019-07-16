// A dirty little seeder but it does what it needs to do...
// seed multiple Tenants and Users.
// NOTE: everything needs to be wrapped in a transaction in order to access the Postgres tenant triggers.
const { signup } = require('./../../lib/users')
const db = require('./../models/')

const roleTypes = ['superadmin', 'admin', 'standard']

const defaultAdmin = {
  email: 'admin@imfake.ai',
  password: 'admin.mockserver'
}

// const createRandomStandardUsers = async () => {
//
// }

const createUsers = async () => {
  const [superAdminRole, adminRole, standardRole] = await Promise.all(roleTypes.map(type => db.Role.findOne({ where: { type } })))

  const params = { ...defaultAdmin, roleId: superAdminRole.id, firstName: 'Mock', lastName: 'Admin', passwordRepeat: defaultAdmin.password }

  const nonSuperAdminUsers = [
    { roleId: adminRole.id, email: 'adminguy@imfake.ai', firstName: 'Sam', lastName: 'Gam' },
    { roleId: standardRole.id, email: 'standard@imfake.ai', firstName: 'Sally', lastName: 'Fields' }
  ]

  if (!(await db.User.findOne({ where: { email: 'admin@imfake.ai' } }))) {
    const adminUser = await signup({ body: { ...params, email: 'admin@imfake.ai' } })

    console.log(`Added admin user ${adminUser.email} to database`)
  }

  const adminUser2 = await signup({
    body: {
      roleId: adminRole.id,
      email: 'test@imfake.ai',
      firstName: 'Mock',
      lastName: 'Admin2',
      password: 'admin.mockserver',
      passwordRepeat: 'admin.mockserver'
    }
  })

  console.log(`Added admin user ${adminUser2.email} to database, tenant 1`)

  await Promise.all(
    nonSuperAdminUsers.map(async ({ firstName, lastName, roleId, email }) => {
      const user = await signup({
        body: {
          email,
          firstName,
          lastName,
          password: 'admin.mockserver',
          passwordRepeat: 'admin.mockserver',
          roleId
        }
      })
      return user
    })
  )

  return true
}
module.exports = async () => {
  try {
    await createUsers()
    console.log('seeding complete')
  } catch (e) {
    console.log('Something wrong during seeding process: ', e)
  }
}
