var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var multer = require('multer');
const morgan = require('morgan');
var upload = multer(); 
var session = require('express-session');
var cookieParser = require('cookie-parser');

app.set('view engine', 'ejs');
app.set('views','./views');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); 
app.use(morgan("dev"))
app.use(express.static('public'))
app.use(upload.array());
app.use(cookieParser());
app.use(session({secret: "Your secret key"}));

// Connects to the database.
let database = require('./public/Scripts/database.js')
let helper = require('./public/Scripts/helper.js')
database.setDatabase("Z")
database.connect()


app.get('/home', function(req,res){
  res.render('home')
})
app.get('/signupStudent', function(req,res){
  res.render('signupStudent',{message:""})
})
app.get('/signupStaff', function(req,res){
  res.render('signupStaff',{message:""})
})
app.get('/loginStudent', function(req,res){
  res.render('loginStudent',{message:""})
})
app.get('/loginStaff', function(req,res){
  res.render('loginStaff',{message:""})
})
app.get('/logoutStudent', function(req, res){
  req.session.destroy(function(){
     console.log("user logged out.")
  });
  res.redirect('/loginStudent');
});
app.get('/logoutStaff', function(req, res){
  req.session.destroy(function(){
     console.log("user logged out.")
  });
  res.redirect('/loginStaff');
});

//Checks for authentication.
function checkSignIn(req, res, next){
  if(req.session.user){
     next();     //If session exists, proceed to page
  } else {
     var err = new Error("Not logged in!");
     console.log(req.session.user);
     next(err);  //Error, trying to access unauthorized page!
  }
}

//Creates a new student account according to request.
app.post('/signupStudent',(req,res)=>{
      if(helper.check(req.body.password,req.body.password2)){
        let a = async ()=>{
          let user = await database.get1("student","Username",req.body.username)
          if(user.length>0)
            res.render('signupStudent',{message:"Same username is existing"});
          else{
            let newUser = {ID: req.body.id,Name:req.body.firstname+" "+ req.body.lastname, FirstName: req.body.firstname,LastName: req.body.lastname, Email: req.body.email,Username: req.body.username, Password: req.body.password};
            req.session.user = newUser;
            database.insert("student",newUser)
            console.log("New Student added")
            res.redirect('/dashboardStudent?username='+req.body.username);
          }  
        }    
        a();
      }else
        res.render('signupStudent',{message:"Password confim is wrong"});
})


const StaffSecretCode="1"

//Creates a new staff account according to request.
app.post('/signupStaff',(req,res)=>{
  if(StaffSecretCode===req.body.code){
    if(helper.check(req.body.password,req.body.password2)){
      let a = async ()=>{
        let user = await database.get1("staff","Username",req.body.username)
        if(user.length>0)
          res.render('signupStaff',{message:"Same username is existing"});
        else{
          let newUser = {ID: req.body.id,Name:req.body.firstname+" "+ req.body.lastname, FirstName: req.body.firstname,LastName: req.body.lastname, Email: req.body.email,Username: req.body.username, Password: req.body.password};
          req.session.user = newUser;
          database.insert("staff",newUser)
          console.log("New Staff added")
          res.redirect('/dashboardStaff?username='+req.body.username);
        }  
      }    
      a();
    }else
      res.render('signupStaff',{message:"Password confim is wrong"});
  }
})

//Logs in a student. 
app.post('/loginStudent', function(req, res){
  let a = async ()=>{
    let user = await database.get1("student","Username",req.body.username)
    if(user.length==0){
      res.render('loginStudent', {message: "Invalid Username.Try Again."});           
    }else{
      if(user[0].Password===req.body.password){
        req.session.user = user;  
        res.redirect('/dashboardStudent?username='+req.body.username);
      }else{
        res.render('loginStudent', {message: "Invalid Password.Try Again."});           
      }
    }
  }
  a();  
});

//Logs in a staff. 
app.post('/loginStaff', function(req, res){
  let a = async ()=>{
    let user = await database.get1("staff","Username",req.body.username)
    if(user.length==0){
      res.render('loginStaff', {message: "Invalid Username.Try Again."});           
    }else{
      if(user[0].Password===req.body.password){
        req.session.user = user;  
        res.redirect('/dashboardStaff?username='+req.body.username);
      }else{
        res.render('loginStaff', {message: "Invalid Password.Try Again."});           
      }
    }
  }
  a();  
});


//Handles get request for Student Dashboard.
app.get('/dashboardStudent',(req,res)=>{
  res.render('dashboardStudent',{username:req.query.username})    
})

//Handles get request for Staff Dashboard.
app.get('/dashboardStaff',(req,res)=>{
  res.render('dashboardStaff',{username:req.query.username})    
})

//Handles get request for createChat.
app.get('/createChat',(req,res)=>{
  res.render('createChat',{username:req.query.username})
})

//Creates a new chat according to data in post request.
app.post('/createChat',(req,res)=>{
  let staffusername = req.body.staffusername
  let studentid = req.body.studentid
  let type = req.body.type
  let subject = req.body.subject
  let studentname = req.body.studentname
  let content = separateCodeStudent+req.body.content
  let studentusername = req.query.username
  let list = {student:studentusername,staff:staffusername,content:content,studentID:studentid,studentName:studentname,subject:subject,status:"Pending",type:type}
  database.insert("chats",list)
  res.render('createChat',{username:req.query.username})
})

//Handles get request for student chat menu and sends chat data which taken from database as response.
app.get('/chatStudent',(req,res)=>{
  let username = req.query.username
  let a = async()=>{
    let chatList = await database.get1("chats","student",username)
    //console.log(chatList)
    res.render('chatStudent',{username:username,chatList:chatList})
  }
  a();
})

//Handles get request for staff chat menu and sends chat data which taken from database as response.
app.get('/chatStaff',(req,res)=>{
  let username = req.query.username
  let id = req.query.id
  let stat = req.query.stat
  if(stat==='approve'){
    database.update1("chats","status","Approved","id",id)
  }else if(stat==='decline'){
    database.update1("chats","status","Declined","id",id)
  }
  let a = async()=>{
    let chatList = await database.get1("chats","staff",username)
    //console.log(chatList)
    res.render('chatStaff',{username:username,chatList:chatList})
  }
  a();
})

//Sends sorted chat data according to request.
app.post('/chatStaff',(req,res)=>{
  let username = req.query.username
  let name = req.body.name
  let index = req.body.index
  let status = req.body.status
  let type = req.body.type
  let namelist = ["staff"]
  let valuelist = [username]
  if(!(name==="Any")){
    namelist.push("studentName")
    valuelist.push(name)
  }if(!(index==="Any")){
    namelist.push("studentID")
    valuelist.push(index)
  }if(!(status==="Any")){
    console.log(status)
    namelist.push("status")
    valuelist.push(status)
  }if(!(type==="Any")){
    namelist.push("type")
    valuelist.push(type)
  }
  let b = async()=>{
    let chatList2 = await database.geti("chats",namelist,valuelist)
    res.render('chatStaff',{username:username,chatList:chatList2})
  }
  b();
})

//Handles get request when student clicks reply on one of chats. Directs him to selected chat.
app.get('/replyStudent',(req,res)=>{
  let id = req.query.id
  let a = async()=>{
    let chatList = await database.get1("chats","id",id)
    chatList[0].content = chatList[0].content.split(separateCode)
    //console.log(chatList[0].content)
    res.render('replyStudent',{id:id,chat:chatList[0]})
  }
  a();  
})

//Handles get request when staff clicks reply on one of chats. Directs him to selected chat.
//Also can capprove or decline chat requests.
app.get('/replyStaff',(req,res)=>{
  let id = req.query.id
  let stat = req.query.stat
  //console.log(stat,id)
  if(stat==='approve'){
    database.update1("chats","status","Approved","id",id)
  }else if(stat==='decline'){
    database.update1("chats","status","Declined","id",id)
  }
  let a = async()=>{
    let chatList = await database.get1("chats","id",id)
    chatList[0].content = chatList[0].content.split(separateCode)
    //console.log(chatList[0].content)
    res.render('replyStaff',{id:id,chat:chatList[0]})
  }
  a();  
})

//Separate codes used to separate messages in the chats.
const separateCode = "s;n#*^n!"
const separateCodeStudent = "s;n#*^n!Students;n#*^n!"
const separateCodeStaff = "s;n#*^n!Staffs;n#*^n!"

//Adds reply from student to database.
app.post('/replyStudent',(req,res)=>{
  let id = req.query.id
  let replyData = separateCodeStudent+req.body.replyData
  //console.log(replyData)
  let a = async()=>{
    let chatList = await database.get1("chats","id",id)
    chatList[0].content +=replyData
    let uploadData = chatList[0].content
    chatList[0].content = chatList[0].content.split(separateCode)
    database.update1("chats","content",uploadData,"id",id)
    res.render('replyStudent',{id:id,chat:chatList[0]})
  }
  a(); 
})

//Adds reply from staff to database.
app.post('/replyStaff',(req,res)=>{
  let id = req.query.id
  let replyData = separateCodeStaff+req.body.replyData
  //console.log(replyData)
  let a = async()=>{
    let chatList = await database.get1("chats","id",id)
    chatList[0].content +=replyData
    let uploadData = chatList[0].content
    chatList[0].content = chatList[0].content.split(separateCode)
    database.update1("chats","content",uploadData,"id",id)
    res.render('replyStaff',{id:id,chat:chatList[0]})
  }
  a(); 
})



// Turn on that server!
app.listen(3000, () => {
  console.log('App listening on port 3000');
});