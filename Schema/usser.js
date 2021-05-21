const graphql = require('graphql');
const _ = require('lodash');
const { v4 } = require('uuid');
const pool = require('../config/db');
const { 
    GraphQLObjectType,
    GraphQLSchema,
    GraphQLString,
    GraphQLID,
    GraphQLList,
    GraphQLInt,
    GraphQLBoolean
} = graphql;

const UserType = new GraphQLObjectType({
    name:'user',
    fields: () => ({
        uid:{type:GraphQLID},
        user_name:{type:GraphQLString},
        password:{type:GraphQLString},
        created:{type:GraphQLString}
    })
});

const DefaultResponse = new GraphQLObjectType({
    name:'DefaultResponse',
    fields: () => ({
        status:{type:GraphQLBoolean},
        message:{type:GraphQLString}
    })
});

const RootQuery = new GraphQLObjectType({
    name:'RootQueryType',
    fields:{
        user:{
            type:DefaultResponse,
            args:{user_name:{type:GraphQLString},password:{type:GraphQLString}},
            async resolve(parent,args){
                try {
                    const { user_name,password } = args;
                    const sql = `SELECT uid FROM user WHERE user_name = ? AND password = ?`;
                    const bind = [user_name,password];

                    const result = await pool.query(sql,bind);
                    let message;
                    if(result.length === 0) message = 'either password or user name is wrong';
                    else message = result[0].uid;

                    return{
                        status:true,
                        message
                    }
                    
                } catch (error) {
                    console.log(error);
                    return{
                        status:false,
                        message:error.message
                    }
                }
            }
        }
    }
});

const Mutation = new GraphQLObjectType({
    name:'Mutation',
    fields:{
        addUser:{
            type:DefaultResponse,
            args:{
                user_name:{type:GraphQLString},
                password:{type:GraphQLString}
            },
            async resolve(parent,args){
                const uid = `user_${v4()}`;
                const date = new Date();
                const created = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
                // console.log(created);
                const {user_name,password} = args;
                
                const sql = `INSERT INTO user (uid, user_name, password, created) VALUES (?,?,?,?)`;
                const bind = [uid,user_name,password,created];
                let status,message;

                try {

                    await pool.query(sql,bind);
                    status=true;
                    message=uid;
                    
                } catch (error) {
                    console.log(error);
                    status = false;
                    message = error.message;
                }

                return {status,message}
                
            }
        }
    }
});

module.exports = new GraphQLSchema({
    query: RootQuery,
    mutation:Mutation
});