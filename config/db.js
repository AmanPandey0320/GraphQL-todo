const mysql = require('mysql');
const util = require('util');

let pool = mysql.createPool({
    host:process.env.DB_HOST,
    port:process.env.DB_PORT,
    user:process.env.DB_USER,
    database:process.env.DB_NAME,
    password:process.env.DB_PAss
});

pool.getConnection((err,conn) => {
    if(err){
        console.log(err);
    }else{
        console.log('MySQL connected');
    }

    if(conn){
        conn.release();
    }else{
        console.log('connection not released');
    }

    return;
});

pool.query = util.promisify(pool.query);

module.exports = pool;