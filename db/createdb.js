const mysql = require(`mysql-await`)
const fs = require('fs')

const db_shema = require(`./schema`)

const schema = db_shema.schema

let creds = {
    host: process.env.DANK_DB_HOST,
    user: process.env.DANK_DB_USER,
    password: process.env.DANK_DB_PASS
}

async function connectdb(creds){
    try{
        //create a connection object
        let conn = mysql.createConnection(creds)
        
        return conn

    } catch(e){
        console.log(e)
        console.log("Error connecting to database")
        throw new Error("DBConnectionError")
    }   
}

async function send_sql(conn, sql_code){
    try{
        console.log(sql_code)
        let result = await conn.awaitQuery(sql_code)
        return result

    } catch(error){
        console.log(error)
        throw new Error("DBSendError")
    }
}


async function main(){
    try{
        let conn = await connectdb(creds)
        console.log("Connected to database")

        //create databases
        const data_bases = schema.data_bases

        for(let i = 0; i < data_bases.length; i++){
            let sql_code = `CREATE DATABASE IF NOT EXISTS ${data_bases[i].name}`
            await send_sql(conn, sql_code);

            //select created database
            sql_code = `USE ${data_bases[i].name}`
            await send_sql(conn, sql_code);

            //create tables
            const tables = data_bases[i].tables
            for(let j = 0; j < tables.length; j++){
                const columns = tables[j].columns
                let colum_names = []
                let colum_types = []

                for(let k = 0; k < columns.length; k++){
                    colum_names.push(columns[k].name)

                    if(columns[k].increment){
                        colum_types.push(`${columns[k].type} PRIMARY KEY AUTO_INCREMENT`)
                    } else {
                        colum_types.push(columns[k].type)
                    }
                }

                let colums_str = ""

                for(let k = 0; k < colum_names.length; k++){
                    colums_str += `${colum_names[k]} ${colum_types[k]}, `
                }

                colums_str = colums_str.slice(0, -2)

                sql_code = `CREATE TABLE IF NOT EXISTS ${tables[j].name} (${colums_str})`

                await send_sql(conn, sql_code)

                conn.end()

            }
        }

    } catch(error){
        console.log(error)
        process.exit(1)
    }
}

main()