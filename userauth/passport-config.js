const localStrategy = require("passport-local").Strategy
const bcrypt = require("bcrypt")


function initialize(passport, getUserByEmail, getUserById) {
    // Authenticate Users
    const authUsers = async (email, password, done) => {
        // Get user by email
        const user = getUserByEmail(email)
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
    passport.serializeUser((user, done) => done(null, user.id))
    passport.deserializeUser((id, done) => {
        return done(null, getUserById(id))
    })
}

module.exports = initialize

