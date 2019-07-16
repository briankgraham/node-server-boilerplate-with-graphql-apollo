const setupFixtures = require('./setupFixtures')

Promise.all([setupFixtures()])
  .then(() => {
    console.log('Setup Seed Data Complete')
    process.exit(0)
  })
  .catch(err => {
    console.error('Seeding failed: ', err.stack)
    process.exit(1)
  })
