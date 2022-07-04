const { createServer } = require('@graphql-yoga/node')
const mongoose = require("mongoose")
const cors = require("cors")

mongoose.connect("mongodb://localhost/test5");

const Todo = mongoose.model("Todo", {
    text: String,
    complete: Boolean
});

// Provide your schema
const server = createServer({
  schema: {
    typeDefs: `
      type Query {
        hello(name: String): String!
        todos: [Todo]
      }
      type Todo{
          id: ID!
          text: String!
          complete: Boolean!
      }
      type Mutation {
          createTodo(text:String!): Todo
          updateTodo(id:ID!, complete: Boolean!): Boolean
          removeItem(id:ID!): Boolean
      }
    `,
    resolvers: {
      Query: {
        hello: (_, {name}) => `Hello ${name || 'World'}`,
        todos: () => Todo.find()
      },
      Mutation: {
          createTodo: async (_, {text}) => {
              const todo = new Todo({text, complete:false});
              await todo.save();
              return todo; 
          },
          updateTodo: async (_, {id, complete}) => {
              await Todo.findByIdAndUpdate(id, {complete});
              return true; 
          },
          removeItem: async(_, {id}) => {
              await Todo.findByIdAndRemove(id);
              return true;
          }
      }
    },
  },
})

const corsOptions = {
  origin: "http://localhost:3000",
  credentials: true
};

const options = {
  cors: corsOptions
};

// Start the server and explore http://localhost:4000/graphql
mongoose.connection.once("open", function() {
    server.start(options)
});
