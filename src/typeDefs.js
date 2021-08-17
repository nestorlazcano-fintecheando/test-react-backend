const { gql } = require('apollo-server-express');

const typeDefs = gql`

    type BasicUsers {
        id: ID!
        name: String!
        username: String!
        email: String!
        country: String!
        city: String!
        phone: String!
        photo: String!
        address: String!
    }
    
    type Users {
        id: ID!
        name: String!
        username: String!
        email: String!
        country: String!
        city: String!
        phone: String!
        photo: String!
        shoppingList: [ ShoppingList ]
    }

    type ShoppingList {
        id: ID!
        product: String!
        amount: Int!
        index: Int!
        userId: String!
        user: Users
    }

    type LoginResponse {
        token: String!
        user: BasicUsers
    }

    type Response {
        success: Boolean!
        text: String!
    }

    input LoginInput {
        username: String!
        password: String!
    }

    input InputUsers {
        name: String
        email: String!
        address: String!
        country: String!
        city: String!
        phone: String!
        photo: String!
    }

    input ShoppingListInput {
        id: String
        product: String!
        amount: Int!
        index: Int
        userId: String
    }

    type Query {
        shoppingList(id: String!): ShoppingList
        shoppingLists: [ ShoppingList ]
        user: Users
    }

    type Mutation {
        createShoppingList(shoppingList: ShoppingListInput): ShoppingList,
        updateShoppingList(shoppingList: [ShoppingListInput!]!): Response,
        deleteShoppingList(id: String!): Response,
        updateUser(user: InputUsers!): Response,
        login(login: LoginInput!): LoginResponse
    }

`;

module.exports = {typeDefs};