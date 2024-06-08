// const { ApolloServer } = require("apollo-server-express");
// const express = require("express");
// const cors = require('cors');
// const { PubSub } = require("graphql-subscriptions");
// const { createServer } = require('http');
// const { makeExecutableSchema } = require('@graphql-tools/schema');
// const { execute, subscribe } = require('graphql');
// const { SubscriptionServer } = require('subscriptions-transport-ws');

// const messages = [];

// const typeDefs = `
//     type Message {
//         id: ID!
//         userId: String!
//         user: String!
//         content: String!
//     }
//     type Query {
//         messages: [Message!]
//     }
//     type Mutation {
//         postMessage(userId: String!, user: String!, content: String!): ID!
//     }
//     type Subscription {
//         messages: [Message!]
//     }
// `;

// const subscribers = [];
// const onMessagesUpdates = (fn) => subscribers.push(fn);

// const resolvers = {
//     Query: {
//         messages: () => {
//             return messages;
//         }
//     },
//     Mutation: {
//         postMessage:(parent, args)=>{
//             const id = messages.length;
//             messages.push({
//                 userId: args.userId,
//                 id,
//                 user: args.user,
//                 content: args.content
//             });
//             subscribers.forEach((fn)=> fn());
//             return id;
//         }
//     },
//     Subscription: {
//         messages:{
//             subscribe: (parent, args,{ pubSub })=>{  
//                 //pubSub => Event emites the message 
//                 const channel = Math.random().toString(36).slice(2,15);
//                 onMessagesUpdates(() => pubSub.publish(channel, {messages}));
//                 setTimeout(()=>{
//                     pubSub.publish(channel,{messages});
//                 }, 0);
//                 return pubSub.asyncIterator(channel);
//             }
//         }
//     }
// }
// const pubSub = new PubSub();
// const schema = makeExecutableSchema({ typeDefs, resolvers});

// const app = express();
// const corsOptions = {
//     origin: 'http://localhost:3000',
//     credentials: true
//   };
  
// app.use(cors(corsOptions));


// const server = new ApolloServer({schema, context:{ pubSub } });

// server.start().then(()=>{
// server.applyMiddleware({app, cors: false});

// const httpServer = createServer(app);
// SubscriptionServer.create(
//     { schema,execute,subscribe },
//     { server: httpServer, path: server.graphqlPath }
// );

// const PORT = process.env.PORT || 4000;
// httpServer.listen(PORT, ()=>{
//     console.log(`Server is running on the port ${PORT}${server.graphqlPath}`);
// });
// });
// // startServer().catch(err => console.error(err));


const { ApolloServer } = require("apollo-server-express");
const express = require("express");
const cors = require('cors');
const { PubSub } = require("graphql-subscriptions");
const { createServer } = require('http');
const { makeExecutableSchema } = require('@graphql-tools/schema');
const { execute, subscribe } = require('graphql');
const { SubscriptionServer } = require('subscriptions-transport-ws');

const messages = [];

const typeDefs = `
    type Message {
        id: ID!
        userId: String!
        user: String!
        content: String!
    }
    type Query {
        messages: [Message!]
    }
    type Mutation {
        postMessage(userId: String!, user: String!, content: String!): ID!
    }
    type Subscription {
        messages: [Message!]
    }
`;

// const subscribers = [];
// const onMessagesUpdates = (fn) => subscribers.push(fn);

const pubSub = new PubSub();

const resolvers = {
    Query: {
        messages: () => messages,
    },
    Mutation: {
        postMessage: (parent, args) => {
            const id = messages.length;
            const newMsg = {
                userId: args.userId,
                id,
                user: args.user,
                content: args.content
            };
            // subscriber.forEach((fn) => fn());
            messages.push(newMsg);
            pubSub.publish('Message_Added', {messages});
            return id;
        }
    },
    Subscription: {
        messages: {

            subscribe: () => pubSub.asyncIterator('Message_Added')
            // subscribe: (parent, args, { pubSub }) => {
                // const channel = Math.random().toString(36).slice(2, 15);
                // onMessagesUpdates(() => pubSub.publish(channel, { messages }));
                // setTimeout(() => pubSub.publish(channel, { messages }), 0);
                // return pubSub.asyncIterator(channel);
            },
        },
    }
// };

const schema = makeExecutableSchema({ typeDefs, resolvers });

const app = express();
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));

const startServer = async() => {
const server = new ApolloServer({
    schema,
    context:{ pubSub },
});

await server.start();
    server.applyMiddleware({ app, cors: false });

    const httpServer = createServer(app);
    SubscriptionServer.create(
        { schema, execute, subscribe },
        { server: httpServer, path: server.graphqlPath }
    );

    const PORT = process.env.PORT || 4000;
    httpServer.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}${server.graphqlPath}`);
    });
};

startServer().catch((err) =>  console.log(err));


// import { ApolloServer, gql } from "apollo-server-express";
// import { WebSocketServer } from 'ws';
// import { useServer } from 'graphql-ws/lib/use/ws';

// const app = express();
// const context = ({req}) => {
//     const {authorization} = req.headers

// if(authorization){
//     const {userId} = jwt.verify(authorization, process.env.jwt)
// }}
// const apolloServer = new ApolloServer({schema, context });

// apolloServer.applyMiddleware({ app });

// const server = app.listen(4000, ()=> {
//     const wsServer = new WebSocketServer({
//         server,
//         path: '/graphql',
//     });
//     useServer({schema}, wsServer);
// })

