//jshint esversion:6
require("dotenv").config();
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");

mongoose.connect("mongodb://localhost:27017/userDB");

const userSchema = new mongoose.Schema({
    name : String,
    password : String
});

userSchema.plugin(encrypt,{secret : process.env.SECRET , encryptedFields : ["password"]});

const userModel = mongoose.model("user", userSchema);

app.use(express.urlencoded({extended : true}));
app.use(express.static("public"));
app.set("view engine", "ejs");

app.route("/")
.get((req,res)=>{
    res.render("home");
});

app.route("/register")
.get((req,res)=>{
    res.render("register");
})
.post((req,res)=>{
    const registerName = req.body.username; 
    const registerPassword = req.body.password;
    const newUser = new userModel({
        name : registerName,
        password: registerPassword
    });

    newUser.save((err)=>{
        if(err){
            res.send(err);
        }else{
            res.render("secrets");
        }
    });
});

app.route("/login")
.get((req,res)=>{
    res.render("login");
})
.post((req,res)=>{
    const inputName = req.body.username;
    const inputPassword = req.body.password;
    userModel.findOne({name : inputName}, (err, foundUser)=>{
        if(!err){
            if(foundUser != null){
                if(foundUser.password === inputPassword){
                    res.render("secrets");
                }else{
                    res.send("Wrong Password");
                }
            }else{
                res.send("Username Not Found, Please Register First")
            }
        }else{
            res.send(err);
        }
    });
});

app.listen(3000 || process.env.PORT, (req,res)=>{
    console.log("success");
});