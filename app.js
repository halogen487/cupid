const path = require("path")
const express = require("express"); const app = express()
const bodyParser = require("body-parser")
const validator = require("express-validator")
const port = 8080

app.use(bodyParser.urlencoded({ extended: true }))
app.use("/static", express.static("static"))
app.use((req, res, next) => {
	now = new Date()
	console.log(`${req.method} request for ${req.url} from ${req.ip}`)
	next()
})

app.get("/", (req, res) => {
	res.sendFile(path.join(__dirname, "public/index.html"))
})
app.get("/form", (req, res) => {
	res.sendFile(path.join(__dirname, "public/form.html"))
})
app.get("favicon.ico", (req, res) => {
	console.log(`favicon request from ${req.ip}`)
	res.send("no")
})

app.post("/submit", (req, res) => {
	console.log(`${req.body.firstName} ${req.body.lastName} did the form`)
	res.sendStatus("200")
})

app.listen(port, () => {
	console.log(`cupid is listening on port ${port}`)
})