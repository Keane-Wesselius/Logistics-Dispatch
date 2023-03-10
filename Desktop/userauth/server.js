if(process.env.NODE_ENV !== "production"){
    require("dotenv").config()
}

// Importing Libraries
const express = require("express")
const app = express()
const bcrypt = require("bcrypt")
const passport = require("passport")
const initializePassport = require("./passport-config")
const flash = require("express-flash")
const session = require("express-session")
const methodOverride = require("method-override")
const mongoose = require("mongoose")
const User = require("./model")

mongoose.connect("mongodb+srv://cwulogisticdispatch:cargocommanders123@cluster0.mxfax5h.mongodb.net/?retryWrites=true&w=majority");

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

db.once("open", function() {
    console.log("MongoDB database connection established successfully");
  });

initializePassport(
    passport
)

app.use(express.urlencoded({extended: false}))
app.use(flash())
app.use(session({
    // NEED TO CREATE LOCAL FILE CALLED ".env" WITH VARIABLE CALLED SESSION_SECRET
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride("_method"))

app.post("/login", checkNotAuthenticated, passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true
}))

// Configuring the register post functionality
app.post("/register", checkNotAuthenticated, async (req, res) => {
    try{
        // Push user data to users array
        const hashedPassword = await bcrypt.hash(req.body.password, 10) // encrypts password

        // Push user data to database
        const newUser = new User({
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword,
            type: req.body.type
        });
        await newUser.save();

        // Print user data sent to database
        const firstUser = await User.findOne({});
        console.log(firstUser);
        
        res.redirect("/login") // redirect to login page
    } catch (e) {
        res.redirect("/register") // redirect to register on error
    }
})

// Render front end
app.get('/',checkAuthenticated, (req, res) => {
    res.render("index.ejs", {name: req.user.name, type: req.user.type})
})

app.get('/login', checkNotAuthenticated, (req, res) => {
    res.render("login.ejs")
})

app.get('/register', checkNotAuthenticated, (req, res) => {
    res.render("register.ejs")
})

app.get('/dashboard', checkNotAuthenticated, (req, res) => {
    res.render("dashboard.ejs")
})

app.get('/scheduling', checkNotAuthenticated, (req, res) => {
    res.render("scheduling.ejs")
})

app.delete("/logout", (req, res) => {
    req.logout(req.user, err => {
        if (err) return next(err)
        res.redirect("/")
    })
})

// Check if user is signed in
function checkAuthenticated(req, res, next){
    if(req.isAuthenticated()){
        return next()
    }
    res.redirect('/login')
}
function checkNotAuthenticated(req, res, next){
    if(req.isAuthenticated()){
        return res.redirect("/scheduling")
    }
    next()
}

// Listen on port 3000
app.listen(3000)