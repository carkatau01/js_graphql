const express = require('express')
const helmet = require('helmet')
const cors = require('cors')
const depthLimit = require('graphql-depth-limit')
const { createComplexityLimitRule } = require('graphql-validation-complexity')

const { ApolloServer } = require('apollo-server-express')

const jwt = require('jsonwebtoken')

const getUser = (token) => {
    if (token) {
        try {
            return jwt.verify(token, process.env.JWT_SECRET)
        } catch (err) {
            new Error('Session Invalid')
        }
    }
}

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
app.use(helmet())
app.use(cors())

db.connect(DB_HOST)

let apolloServer = null
async function startServer() {
    // apollo server
    apolloServer = new ApolloServer({
        typeDefs,
        resolvers,
        validationRules: [depthLimit(5), createComplexityLimitRule(1000)],
        context: ({ req }) => {
            const token = req.headers.authorization
            const user = getUser(token)

            return { models, user }
        },
    })

    // api
    await apolloServer.start()
    apolloServer.applyMiddleware({ app, path: '/api' })
}

startServer()

// application start
app.listen({ port }, () => {
    console.log(`GraphQL Server running at http://localhost:${port}/api`)
})
