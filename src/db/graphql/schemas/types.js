const { gql } = require('apollo-server-express')

const typesSchema = gql`
  scalar JSON
  scalar DateTime
`

module.exports = typesSchema
