#! /usr/bin/env node

const path = require("path")
const express = require("express")
const ejs = require("ejs")
const sqlite3 = require("sqlite3")
const fs = require("fs")

const log = function (msg) {
	console.log(`${(new Date).toISOString().replace(/[TZ]/g, " ").substring(11, 23)}: ${msg}`)
	fs.appendFile("./cupid.log", `${(new Date).toISOString()}: ${msg}\n`, (err) => {
		if (err) {console.log("Logging error!")}
	})
}

const getMatches = function (userId) {
	let db = new sqlite3.Database("./cupiddb.sqlite", err => {if (err) {log(err)}})
	
}

const app = express()

app.use("/static", express.static("static"))
app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.engine("html", ejs.renderFile)

app.use(function (req, res, next) {
	log(`${req.method} request for ${req.url} from ${req.ip}`)
	next()
})

app.get("/", function (req, res) {
	res.render(path.join(__dirname, "pages/index.html"))
})

app.get("/form", function (req, res) {
	res.render(path.join(__dirname, "pages/form.html"), {wrongs: {}, rights: {}})
})

app.post("/submit", async function (req, res) {
	// make object containing info and answers
	rights = {answers: []}
	for (i of Object.keys(req.body)) {
		if (i.startsWith("question")) {
			rights.answers[i.slice(-1) - 1] = parseInt(req.body[i])
		} else {
			rights[i] = req.body[i]
		}
	}
	// async seems broken, try ugly callbacks
	let db = await new sqlite3.Database("./cupiddb.sqlite", err => {
		if (err) {log(err)}
		console.log("connected to db")
	})
	console.log("should be connected to db now")
	// validate
	let wrongs = {}
	if (!(rights.phoneNumber.match(/^[0-9]+$/))) {
		wrongs.phoneNumber = "Invalid phone number!"
	}
	if (["male", "female", "nonbinary"].indexOf(rights.gender) < 0) {
		wrongs.gender = "Invalid gender!"
	}
	await db.get("SELECT * FROM users WHERE email = ?", rights.email, (err, row) => {
		console.log(row)
		if (row) {
			wrongs.email = "Email already in use!"
			console.log("email bad")
		}
	})
	console.log(wrongs)
	// send back form or submitted page
	if (Object.keys(wrongs).length === 0) {
		log(`SQLing ${rights.firstName} ${rights.lastName}`)
		res.render(path.join(__dirname, "pages/submit.html"), {rightsStr: JSON.stringify(rights, null, 4)})
		db.run(`
			INSERT INTO users (firstName, lastName, email, phoneNumber, gender, comment, answers)
			VALUES ($firstName, $lastName, $email, $phoneNumber, $gender, $comment, $answers)`,
			{
				$firstName: rights.firstName,
				$lastName: rights.lastName,
				$email: rights.email,
				$phoneNumber: rights.phoneNumber,
				$gender: rights.gender,
				$comment: rights.comment,
				$answers: rights.answers
			}
		)
	} else {
 		res.render(path.join(__dirname, "pages/form.html"), {wrongs: wrongs, rights: rights})
 	}
 	db.close(err => {
		if (err) {log(err)}
		console.log("closed db connection")
	})
})

app.use(function (req, res) {
	res.status(404)
	res.render(path.join(__dirname, "pages/404.html"))
})

app.listen(80, () => {
	log(`Cupid is alive.`)
})
