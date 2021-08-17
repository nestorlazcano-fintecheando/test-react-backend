const { ApolloError, ValidationError, AuthenticationError } = require('apollo-server-express');
const admin = require("firebase-admin");
const config = require('../config');
const serviceAccount = require('../service-account.json');
const jwt = require('jsonwebtoken');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const resolvers = {
  Users: {
    async shoppingList(user) {
        try {
          const shoppingList = await admin.firestore()
            .collection('shopping-list').where('userId', '==', user.id).get();

            console.log( JSON.stringify(user) )
          
          return shoppingList.docs.map( item => ({ id: item.id, ...item.data()}) );
        } catch (error) {
          throw new ApolloError(error)
        }
    }
  },
  ShoppingList: {
    async user(shoppingList) {
      try {
        const user = await admin.firestore().doc('users/'+shoppingList.userId).get();
        
        return ({ id: user.id, ...user.data()});
      } catch (error) {
        throw new ApolloError(error)
      }
    }
  },
  Query: {
    async shoppingLists() {
      try {
        const shoppingList = await admin.firestore()
            .collection('shopping-list').orderBy('index', 'asc').get();
          
          return shoppingList.docs.map( item => ({ id: item.id, ...item.data()}) );
      } catch (error) {
        throw new ApolloError(error)
      }
    },
    async shoppingList(_, args, context) {
        try {
            if (!context.user) throw new AuthenticationError();
    
            const shoppingList = await admin.firestore()
              .doc('shopping-list/'+args.id).get();
            
            console.log(args.id, shoppingList)
            
            return ({ id: shoppingList.id, ...shoppingList.data()}) || new ValidationError();
        } catch (error) {
            throw new ApolloError(error);
        }
    },
    async user(_, args, context) {
      try {
        if (!context.user) throw new AuthenticationError();

        const user = await admin.firestore()
          .doc('users/'+context.user.id).get();
        
        return ({ id: user.id, ...user.data()}) || new ValidationError('User ID not Found');
      } catch (error) {
        throw new ApolloError(error);
      }
    }
  },
  Mutation: {
    async createShoppingList(parent, args, context) {
      try {
        if (!context.user) throw new AuthenticationError();

        let index = 1;
         const elements = await admin.firestore()
                .collection('shopping-list')
                .orderBy('index', 'desc')
                .where("userId", '==', context.user.id)
                .limit(1)
                .get();

        const arrayElements = elements.docs.map( item => item.data() );

        if (arrayElements.length) {
            index = arrayElements[0].index + 1;
        }

        delete args.shoppingList['id'];

        const shoppingList = await admin.firestore()
          .collection('shopping-list').add({...args.shoppingList, index, userId: context.user.id});
        console.log( shoppingList.id )
        return ({ id: shoppingList.id, ...args.shoppingList })
      } catch (error) {
        throw new ApolloError(error)
      }
    },
    async deleteShoppingList(_, args, context) {
        try {
        if (!context.user) throw new AuthenticationError();

          const result = await admin.firestore()
            .collection('shopping-list')
            .doc(args.id)
            .delete();
            
            console.log(result);

          return ({ success: true, text: 'Successful operation' })
        } catch (error) {
          throw new ApolloError(error)
        }
    },
    async updateShoppingList(_, args, context) {
        try {
        if (!context.user) throw new AuthenticationError();

            for (const item of args.shoppingList) {
                const id = item['id'];
                delete item['id'];
                admin.firestore()
                    .collection('shopping-list')
                    .doc(id)
                    .update(item);
            }
 
          return ({ success: true, text: 'Successful operation' })
        } catch (error) {
          throw new ApolloError(error)
        }
    },
    async updateUser(_, args, context) {
        try {
        if (!context.user) throw new AuthenticationError();

          const result = await admin.firestore()
            .collection('users')
            .doc(context.user.id)
            .update(args.user);
 
          return ({ success: true, text: 'Successful operation' })
        } catch (error) {
          throw new ApolloError(error)
        }
    },
    async login(parent, args, context) {
        console.log(args);

        try {

            const { username, password } = args.login;

            const user = await admin.firestore()
                .collection('users')
                .limit(1)
                .where("username", '==', username.trim())
                .where("password", '==', password.trim())
                .get();

            const users = user.docs;
            let userData;

            if (users.length) {
                userData = ({ id: users[0].id, ...users[0].data() });
            } else {
                throw new ValidationError('User not found');
            }

            if(userData) {

                const token = jwt.sign({ id: userData.id, username: userData.username }, config.key);

                const response = {
                    token,
                    user:  userData
                };
    
                return response;
            } else {
                throw new ValidationError('User ID not Found');
            }
            
          } catch (error) {
            throw new ApolloError(error);
          }
    }
  }
};

module.exports = {resolvers};
