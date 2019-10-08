/*
 * CS 4241 Final Project - Server code
 * by Terry Hearst, Demi Karavoussianis, Kyle Reese, and Tom White
 */


// ####################
// ## INITIALIZE APP ##
// ####################

const express  = require("express")
const app      = express()
const session  = require("express-session")
const passport = require("passport")
const Local    = require("passport-local").Strategy
const pass     = require("pwd")

// Serve our compiled react program
app.use(express.static("dist"))

// Redirect to the default webpage
app.get("/", function(request, response)
{
	response.sendFile(__dirname + "/dist/index.html")
})


// ####################
// ## AUTHENTICATION ##
// ####################

/* TEMP STUFF */
let users = []
const findUser = function(username)
{
	return users.find({"username": username})
}
/* END TEMP STUFF */

passport.use(new Local(function(username, password, done)
{
	const user = findUser(username) // TODO use actual function
	
	if (user === undefined)
	{
		return done(null, false)
	}
	
	pass.hash(password, user.salt).then(function(result)
	{
		if (user.hash === result.hash)
		{
			done(null, user)
		}
		else
		{
			done(null, false)
		}
	})
}))

app.use(session({"secret": "top 5 bruh moments", "resave": false, "saveUninitialized": false}))
app.use(passport.initialize())
app.use(passport.session())

app.post(
	"/login",
	passport.authenticate("local"),
	function(req, res)
	{
		console.log(res)
		console.log("user:", req.user)
	}
)

app.post(
	"/signup",
	function(req, res)
	{
		console.log("new user:", req.body.username)
		
		// Make sure user does not already exist
		if (findUser(req.body.username) !== undefined)
		{
			res.status(403) // Forbidden
			res.send()
			return
		}
		
		pass.hash(req.body.password).then(function(result)
		{
			users.push({"username": req.body.username, "hash": result.hash, "salt": result.salt})
			res.json({"status": "success"})
		}
	}
)


// ############
// ## LISTEN ##
// ############

const listener = app.listen(process.env.PORT || 3000, function()
{
	console.log("Your app is listening on port " + listener.address().port)
})
