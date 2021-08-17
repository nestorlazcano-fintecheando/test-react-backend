const { ApolloServer, AuthenticationError } = require('apollo-server-express');
const express = require('express');
const config = require('../config');
const jwt = require('jsonwebtoken');

const { resolvers } = require('./resolvers');
const { typeDefs } = require('./typeDefs');

const app = express();

app.set('key', config.key);

const server = new ApolloServer({ 
  typeDefs, 
  resolvers,
  context: ({ req }) => {
   
    try {
      const token = (req.headers.authorization || '').split(' ')[1];

      const user = jwt.decode(token, app.get('key'));

      return ({ user });

    } catch (error) {
      throw new AuthenticationError('JWT is not present or is malformed');
    }
  
  }
});

server.start().then( () => {
  server.applyMiddleware({ app });

  app.listen({ port: 4000 }, () =>
    console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`)
  );
});

exports.module = {app};