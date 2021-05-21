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

const TaskType = new GraphQLObjectType({
    name:'task',
    fields: () => ({
        id:{type:GraphQLID},
        user_id:{type:GraphQLID},
        title:{type:GraphQLString},
        description:{type:GraphQLString},
        priority:{type:GraphQLInt},
        start:{type:GraphQLString},
        end:{type:GraphQLString},
        finish:{type:GraphQLBoolean}
    }),

});

const RootQuery = new GraphQLObjectType({
    name:'RootQueryType',
    fields:{
        task:{
            type:new GraphQLList(TaskType),
            args:{uid : { type:GraphQLID } },
            async resolve(parent,args){
                try {
                    const { uid } = args;
                    const sql = `SELECT * FROM todo WHERE uid = ?`;
                    const result = await pool.query(sql,[uid]);
                    return result;
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

const DefaultResponse = new GraphQLObjectType({
    name:'DefaultResponse',
    fields: () => ({
        status:{type:GraphQLBoolean},
        message:{type:GraphQLString}
    })
});

const Mutation = new GraphQLObjectType({
    name:'Mutation',
    fields:{
        addTask:{
            type:DefaultResponse,
            args:{
                title:{type:GraphQLString},
                description:{type:GraphQLString},
                user_id:{type:GraphQLID},
                start:{type:GraphQLString},
                end:{type:GraphQLString},
                priority:{type:GraphQLInt},
                finish:{type:GraphQLBoolean}
            },
            async resolve(parent,args){
                const id = `task_${v4()}`;
                const {title,description,user_id,start,end,priority,finish} = args;
                const bind = [id,user_id,title,description,priority,start,end,finish];
                const sql = `INSERT INTO todo (id, uid, title, description, priority, start, end, finish) VALUES (?,?,?,?,?,?,?,?)`;

                try {
                    await pool.query(sql,bind);
                    return{
                        status:true,
                        message:id
                    }
                    
                } catch (error) {
                    console.log(error.message);
                    return{
                        status:false,
                        message:error.message
                    }
                }
                
            }
        },
        updateTask:{
            type:DefaultResponse,
            args:{
                task_id:{type:GraphQLID},
                title:{type:GraphQLString},
                description:{type:GraphQLString},
                end:{type:GraphQLString},
                priority:{type:GraphQLInt},
                finish:{type:GraphQLBoolean}
            },
            async resolve(parent,args){
                try {
                    const {task_id,title,description,end,priority,finish} = args;
                    const sql = `UPDATE todo SET title = COALESCE(?,title),description = COALESCE(?,description),end = COALESCE(?,end),priority = COALESCE(?,priority), finish = COALESCE(?,finish) where id = ?`;
                    const bind = [title,description,end,priority,finish,task_id];

                    await pool.query(sql,bind);

                    return{
                        status:true,
                        message:'upated'
                    }
                    
                } catch (error) {
                    console.log(error);
                    return{
                        status:false,
                        message:error.message
                    }
                }
            }
        },
        deleteTask:{
            type:DefaultResponse,
            args:{task_id:{type:GraphQLID}},
            async resolve(parent,args){
                try {
                    const sql = `DELETE FROM todo WHERE id=?`;
                    await pool.query(sql,[args.task_id]);
                    return{
                        status:true,
                        message:"deleted"
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

module.exports = new GraphQLSchema({
    query: RootQuery,
    mutation:Mutation
});