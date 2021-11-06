const express = require('express')
const { ApolloServer } = require('apollo-server-express')

require('dotenv').config()

// local modules
const db = require('./db')
const models = require('./models')
const typeDefs = require('./schema')
const resolvers = require('./resolvers')

//server start
const port = process.env.SERVER_PORT | 4000
const DB_HOST = process.env.DB_HOST

const app = express()
db.connect(DB_HOST)

// apollo server
const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: () => {
        return { models }
    },
})

// api
server.applyMiddleware({ app, path: '/api' })

// application start
app.listen({ port }, () => {
    console.log(
        `GraphQL Server running at http://localhost:${port}${server.graphqlPath}`
    )
})
