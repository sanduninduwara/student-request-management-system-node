const mysql = require('mysql')

let db ;
//Sets databse.
function setDatabase(name){
    db = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: name
      })
}

//Connects to database.
function connect(){
    db.connect(err =>{
        if(err){
            throw err
        }
        console.log("MySql connected")
    })    
}
//function to implements a sql returns void.
function queryVoid(sql){
    db.query(sql,err => {
        if(err){
            throw err
        }
    })
}

//function to implements a sql returns value.
function queryReturn(sql){
    return new Promise((resolve)=>{
        db.query(sql, (err,results)=>{
            if(err){
                throw err
            }
            resolve(JSON.parse(JSON.stringify(results)));
        })          
    })
}

//function to implements a sql accepts values.
function queryAccept(sql,list){
    db.query(sql, list, err =>{
        if(err){
            throw err
        }
    })    
}

//function to add a data to given table
function insert(tableName,list){
    queryAccept('INSERT INTO '+tableName+' SET ?',list)
}

//function to get 1 data row from table
function get1(tableName,name,value){
    return new Promise((resolve)=>{
        let a = async()=>{
            let aa = await queryReturn('SELECT * from '+tableName+' WHERE '+name+' = '+`'${value}'`)
            resolve(aa)
        }
        a();
    })
}

//function to get data according to given values for names.
function geti(tableName,names,values){
    let sql = 'SELECT * from '+tableName+' WHERE '
    for(let i=0;i<names.length;i++){
        sql+=names[i]+' = '+`'${values[i]}'`
        if(!(i===names.length-1))
            sql+=' AND '
    }
    return new Promise((resolve)=>{
        let a = async()=>{
            let aa = await queryReturn(sql)
            resolve(aa)
        }
        a();
    })
}

//gets All elements in given table.
function getAll(tableName){
    return new Promise((resolve,r)=>{
        let a = async()=>{
            let aa = await queryReturn('SELECT * from '+tableName)
            resolve(aa)
        }
        a();
    })
}

//Updates a 1 rown in table.
function update1(tableName,column,newValue,id,idValue){
    let sql = `UPDATE ${tableName} SET ${column} = '${newValue}' WHERE ${id} = ${idValue}`
    queryVoid(sql)
}

//deletes a 1 rown in table.
function delete1(tableName,name,value){
    let sql = `DELETE FROM ${tableName} WHERE ${name} = '${value}'`
    return queryReturn(sql)
}



module.exports={setDatabase,connect,insert,get1,getAll,update1,delete1,geti}


/*
app.get('/createdb', (req, res) => {
    let sql = 'CREATE DATABASE node'
    db.query(sql,err => {
        if(err){
            throw err
        }
        res.send('Database Created')
    })
})

//Create Table
app.get('/createemployee', (req, res) => {
    //These below are the colums of our table
    //let sql = 'CREATE TABLE employee(id int AUTO_INCREMENT, name VARCHAR(255), designation VARCHAR(255), PRIMARY KEY(id))'
    //let sql = 'CREATE TABLE Chats(id int AUTO_INCREMENT, student VARCHAR(255), type VARCHAR(255), studentName VARCHAR(255), studentID VARCHAR(255), staff VARCHAR(255), subject VARCHAR(255), status VARCHAR(255),content TEXT, PRIMARY KEY(id))'
    db.query(sql,err => {
        if(err){
            throw err
        }
        res.send('Employee table Created')
    })    
})
*/