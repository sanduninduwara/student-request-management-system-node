const express = require('express')
const mysql = require('mysql')

// Create connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'Z'
})

//Connect to MySql
db.connect(err =>{
    if(err){
        throw err
    }
    console.log("MySql connected")
})

const app = express()

//Create Database
app.get('/createdb', (req, res) => {
    let sql = 'CREATE DATABASE Z'
    db.query(sql,err => {
        if(err){
            throw err
        }
        res.send('Database Created')
    })
})

//Create Chat Table
app.get('/chat', (req, res) => {
    let sql = 'CREATE TABLE Chats(id int AUTO_INCREMENT, student VARCHAR(255), type VARCHAR(255), studentName VARCHAR(255), studentID VARCHAR(255), staff VARCHAR(255), subject VARCHAR(255), status VARCHAR(255),content TEXT, PRIMARY KEY(id))'
    db.query(sql,err => {
        if(err){
            throw err
        }
        res.send('Chat table Created')
    })    
})
//Create Student Table
app.get('/student',(req,res)=>{
    let sql = 'CREATE TABLE student(ID VARCHAR(255), Name VARCHAR(255), FirstName VARCHAR(255), Lastname VARCHAR(255),  Email VARCHAR(255), Username VARCHAR(255), Password VARCHAR(255),PRIMARY KEY(Username))'
    db.query(sql,err => {
        if(err){
            throw err
        }
        res.send('Student table Created')
    })  
})

//Create Staff Table
app.get('/staff',(req,res)=>{
    let sql = 'CREATE TABLE staff(ID VARCHAR(255), Name VARCHAR(255), FirstName VARCHAR(255), Lastname VARCHAR(255),  Email VARCHAR(255), Username VARCHAR(255), Password VARCHAR(255),PRIMARY KEY(Username))'
    db.query(sql,err => {
        if(err){
            throw err
        }
        res.send('Staff table Created')
    })  
})


//fixing a port
app.listen('3000', () =>{
    console.log("Server started on port 3000")
})