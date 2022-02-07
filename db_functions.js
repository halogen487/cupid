const mysql = require(`mysql-await`);

//function to connect to the mysql server
async function connectdb(dbhost, dbuser, pass, db_name){
    try{
        
        let creds = {
                host: dbhost,
                user: dbuser,
                password: pass,
                database: db_name
                }

    
        //create a connection object
        let conn = mysql.createConnection(creds)
        
        return conn 

    } catch(e){
        console.log(e)
        throw new Error("DBConnectionError")
    }   
}

async function send_sql(conn, sql_code){
    try{
        let result = await conn.awaitQuery(sql_code)
        return result

    } catch(e){
        console.log(e)
        throw new Error("DBSendError")
    }
}

// check if email already in db
async function email_in_table(conn, email, table_name){
    try{
        let sql_code = `SELECT * FROM ${table_name} WHERE email = ${conn.escape(email)}`
        let result = await send_sql(conn, sql_code)
        if(result.length > 0){
            return true
        } else {
            return false
        }

    } catch(e){
        console.log(e)
        throw new Error("DBEmailInTableError")
    }

}


module.exports = {connectdb, send_sql, email_in_table}
