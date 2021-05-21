require('dotenv').config()
const express = require('express')
const http = require('http')
const app = express()
const server = http.createServer(app)
const port = process.env.PORT || 3000;
const { graphqlHTTP } = require('express-graphql');
const TodoSchema = require('./Schema/todo');
const UserScheme = require('./Schema/usser')

app.get('/',(req,res) => {
    res.send('welcome to graphql todo app')
});

app.use('/todo', graphqlHTTP({
    schema:TodoSchema,
    graphiql:true
}));

app.use('/user',graphqlHTTP({
    schema:UserScheme,
    graphiql:true
}));

server.listen(port , () => {
    console.log(`server up and running at port ${port}`);
});