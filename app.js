const path = require("path")
const express = require("express")
const app = express()
const ejs = require("ejs")

app.use("/static", express.static("static"))

app.use(express.json())

app.use(express.urlencoded({extended: true}))

app.engine("html", ejs.renderFile)

app.use(function (req, res, next) {
	console.log(`${req.method} request for ${req.url} from ${req.ip}`)
	next()
})

app.get("/", function (req, res) {
	res.render(path.join(__dirname, "pages/index.html"))
})

app.get("/form", function (req, res) {
	res.render(path.join(__dirname, "pages/form.html"), {wrongs: {}, rights: {}})
})

app.post("/submit", function (req, res) {
	// make object containing info and answers
	rights = {answers: []}
	for (i of Object.keys(req.body)) {
		if (i.startsWith("question")) {
			rights.answers[i.slice(-1) - 1] = parseInt(req.body[i])
		} else {
			rights[i] = req.body[i]
		}
	}
	// validate
	wrongs = {}
	if (!(req.body.phoneNumber.match(/^[0-9]+$/))) {
		wrongs.phoneNumber = "invalid phone number"
	}
	if (["male", "female", "nonbinary"].indexOf(req.body.gender) < 0) {
		wrongs.gender = "invalid gender"
	}
	console.log(rights)
	console.log(wrongs)
	// send back form or submitted page
	if (Object.keys(wrongs).length === 0) {
		res.render(path.join(__dirname, "pages/submit.html"))
	} else {
 		res.render(path.join(__dirname, "pages/form.html"), {wrongs: wrongs, rights: rights})
 	}
})

app.use(function (req, res) {
	res.status(404)
	res.render(path.join(__dirname, "pages/404.html"))
})

app.listen(80, () => {
	console.log(`cupid is alive`)
})