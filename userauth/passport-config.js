const localStrategy = require("passport-local").Strategy
const bcrypt = require("bcrypt")
const User = require("./model")

function initialize(passport) {
    // Authenticate Users
    const authUsers = async (email, password, done) => {
        // Get user by email
        const user = await User.findOne({email: email});
        if(user == null){
            return done(null, false, {message: "No user found with that email"})
        }
        try {
            if(await bcrypt.compare(password, user.password)){
                return done(null, user)
            } else {
                return done(null, false, {message: "Password Incorrect"})
            }
        } catch (e) {
            console.log(e)
            return done(e)
        }
    }

    passport.use(new localStrategy({usernameField: 'email'}, authUsers))
    passport.serializeUser(function(user, done) {
        done(null, user);
      });
      
    passport.deserializeUser(function(user, done) {
        done(null, user);
    });
}

module.exports = initialize

