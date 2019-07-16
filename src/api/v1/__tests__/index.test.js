const request = require('supertest')
const { app } = require('../../../../src')
const api = require('../index')

const { teardownDb } = require('../../../lib/testHelpers/testUtils')

app.use('/', api({}))

afterAll(async () => {
  await teardownDb()
})

describe('Test the root path', () => {
  test('It should have a valid index response', async () => {
    const response = await request(app).get('/api/v1')
    expect(response.statusCode).toBe(200)
    expect(response.body.protocolVersion).toBe(1)
  })
})
