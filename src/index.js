// eslint-disable-next-line global-require
require('dotenv').config()
const http = require('http')
const path = require('path')
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const bodyParser = require('body-parser')
const compression = require('compression')
const socketIo = require('socket.io')
const { makeExecutableSchema } = require('graphql-tools')
const { fileLoader, mergeTypes, mergeResolvers } = require('merge-graphql-schemas')
const { ApolloServer } = require('apollo-server-express')

const db = require('./db/models/')
// Top level middleware that will run before any route specific middleware
const middleware = require('./middleware')
const api = require('./api/v1')

const typeDefs = mergeTypes(fileLoader(path.join(__dirname, './db/graphql/schemas')))
const resolvers = mergeResolvers(fileLoader(path.join(__dirname, './db/graphql/resolvers')))

const schemas = makeExecutableSchema({ typeDefs, resolvers })

const apolloServer = new ApolloServer({
  schema: schemas,
  resolvers,
  context: async ({ req }) => ({ req, db })
})

const app = express()
app.server = http.createServer(app)

// Connect Socket.io to server, pass it to routes below.
const io = socketIo(app.server)

const HEALTH_CHECK_URL = '/api/health'

app.use(helmet())
// logger
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'))
} else {
  app.use(
    morgan('combined', {
      skip: (req, res) => req.url === HEALTH_CHECK_URL && res.statusCode === 200
    })
  )
}

app.use(compression())

const origin = ['enterurprodurlhere']
if (process.env.NODE_ENV !== 'production') origin.push(process.env.MOCK_WEBCLIENT_HOST || 'http://localhost:8080')

// 3rd party middleware
app.use(cors({ origin, credentials: true }))

app.use(bodyParser.json({ limit: process.env.BODY_PARSER_LIMIT || '300kb' }))
app.use(bodyParser.urlencoded({ extended: true }))

app.use(middleware({ db }))

const jsonErrorHandler = (err, req, res, next) => {
  if (!err) return next()
  let error
  try {
    error = JSON.parse(err.message)
  } catch (e) {
    error = err
  }

  // FIXME: This silences test logs and only sends logs in prod when something goes 'bad'
  if (process.env.NODE_ENV !== 'test' && (!error.status || error.status === 400 || error.status >= 500)) {
    console.log(`APP ERROR: ${error.message === 'TENANT NOT FOUND' ? 'Bad request' : err.stack}`)
  }

  return res.status(error.status || 400).send({
    error: {
      status: error.status || 400,
      message: error.message
    }
  })
}

apolloServer.applyMiddleware({ app, cors: { origin } })

const initApp = async () => {
  app.use('/', api({ db, io }))
  app.use(jsonErrorHandler)
  return app
}

const bindApp = async appToBind => {
  appToBind.server.listen(process.env.MOCK_SERVER_PORT, process.env.MOCK_SERVER_HOST, () => {
    console.log(`🚀 Server ready at http://localhost:3005`)
    console.log(`🚀 GraphQL Server ready at http://localhost:3005${apolloServer.graphqlPath}`)
  })
}

module.exports = {
  app,
  io,
  initApp,
  bindApp,
  jsonErrorHandler
}
