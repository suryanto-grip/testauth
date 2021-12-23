//jshint esversion:6
require("dotenv").config();
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMonggose = require("passport-local-mongoose");

app.use(express.urlencoded({extended : true}));
app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(session({
    secret : "noName",
    resave  : false,
    saveUninitialized : false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/userDB");

const userSchema = new mongoose.Schema({
    name : String,
    password : String
});
userSchema.plugin(passportLocalMonggose);
const userModel = new mongoose.model("user", userSchema);

passport.use(userModel.createStrategy());
passport.serializeUser(userModel.serializeUser());
passport.deserializeUser(userModel.deserializeUser());

app.get("/secrets", (req,res)=>{
    if(req.isAuthenticated()){
        res.render("secrets");
    }else{
        res.redirect("/");
    }
});

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
    userModel.register({username : registerName}, registerPassword, (err, user)=>{
        if (!err){
            passport.authenticate("local")(req,res, ()=>{
                res.redirect("/secrets");
            });
        }else{
            console.log(err);
            res.render("register");
        }
    });
    
    // bycript.hash(registerPassword, salt, (err, hash)=>{
    //     const newUser = new userModel({
    //         name : registerName,
    //         password: hash
    //     });
    //     newUser.save((err)=>{
    //         if(err){
    //             res.send(err);
    //         }else{
    //             res.render("secrets");
    //         }
    //     });
    // });   
});

app.route("/login")
.get((req,res)=>{
    res.render("login");
})
.post((req,res)=>{
    const inputName = req.body.username;
    let inputPassword = req.body.password;

    const user = new userModel({
        username : inputName,
        password : inputPassword
    });

    req.login(user, (err)=>{
        if (!err){
            passport.authenticate("local")(req,res, ()=>{
                res.redirect("/secrets");
            });
        }else{
            res.redirect("/login");
        }
    });
    // userModel.findOne({name : inputName}, (err, foundUser)=>{
    //     if(!err){
    //         if(foundUser){
    //             bycript.compare(inputPassword, foundUser.password, (err, result)=>{
    //                 if (result = true){
    //                     res.render("secrets");
    //                 }
    //             });
    //         }else{
    //             res.send("Username Not Found, Please Register First")
    //         }
    //     }else{
    //         res.send(err);
    //     }
    // });
});

app.get("/logout", (req,res)=>{
    req.logout();
    res.redirect("/");
});
app.listen(3000 || process.env.PORT, (req,res)=>{
    console.log("success");
});