const { gql } = require('apollo-server-express')

const userSchema = gql`
  type Query {
    getUserWithAuth(email: String!, password: String!): User
    getUserAuthVerification(id: Int): LoggedIn
    getUser(id: Int): User
    getUsers(page: Int, limit: Int, sortBy: String, sortDirection: String): Users
  }

  type Mutation {
    updateUser(id: Int, settings: JSON!): User
  }

  type LoggedIn {
    isLoggedIn: Boolean!
  }

  type Users {
    list: [User]
    count: Int!
  }

  type User {
    id: Int
    email: String!
    lookupId: String!
    fullName: String
    firstName: String
    lastName: String
    externalId: String
    settings: JSON!
  }
`

module.exports = userSchema
