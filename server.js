const { ApolloServer, AuthenticationError } = require('apollo-server-express');
const express = require('express');
const config = require('./config');
const jwt = require('jsonwebtoken');

const { resolvers } = require('./src/resolvers');
const { typeDefs } = require('./src/typeDefs');

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

  const PORT = process.env.PORT || 8080;

  app.listen({ port: PORT }, () =>
    console.log(`🚀 Server ready at http://localhost:${PORT}${server.graphqlPath}`)
  );
});

exports.module = {app};