const path = require("path")
const express = require("express"); const app = express()
const ejs = require("ejs")

app.use("/static", express.static("static"))
app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(function (req, res, next) {
	console.log(`${req.method} request for ${req.url} from ${req.ip}`)
	next()
})

app.get("/", function (req, res) {
	res.sendFile(path.join(__dirname, "pages/index.html"))
})
app.get("/form", function (req, res) {
	res.sendFile(path.join(__dirname, "pages/form.html"))
})
app.post("/submit", function (req, res) {
	console.log(req.body)
	wrongs = {}
	if (!(req.body.phoneNumber.match(/^[0-9]+$/))) {
		wrongs.phoneNumber = "invalid phone number"
	}
	if (["male", "female", "nonbinary"].indexOf(req.body.gender) < 0) {
		wrongs.gender = "invalid gender"
	}
	// if any question isn't 1-4
	// for () {}
 	res.json(req.body)
})
// 	body("firstName").isEmail().withMessage("not an email!"),
// 	(req, res) => {
// 		const errors = validationResult(req).array()
// 		console.log(errors)
// 		if (errors) {
// 			console.log(`sending back ${req.body.firstName} ${req.body.lastName}`)
// 		} else {
// 			console.log(`${req.body.firstName} ${req.body.lastName} correctly did the form`)
// 		}
// 		res.send(req.body)
// 	}
// )

app.listen(80, () => {
	console.log(`cupid is alive`)
})