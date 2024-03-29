#! /usr/bin/env node

const path = require("path")
const express = require("express")
const ejs = require("ejs")
const sqlite3 = require("sqlite3")
const log = require("./log.js")
const questions = require("./config/questions.json")
const config = require("./config/config")
const db_functions = require("./db_functions")

console.log("envvar db:", process.env.CUPID_DB_NAME)

const app = express()

app.use("/static", express.static("static"))
app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.engine("html", ejs.renderFile)

const emailRegexp = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;


app.use(function (req, res, next) {
	log(`${req.method} request for ${req.url} from ${req.ip}`)
	next()
})

app.get("/", function (req, res) {
	console.log(loverCount)
	res.render(path.join(__dirname, "pages/index.html"), {loverCount: loverCount})
})

app.get("/quiz", function (req, res) {
	let template_data = {}
	template_data.deadline = config.event_deadline
	res.render(path.join(__dirname, "pages/quiz.html"), {questions: questions, wrongs: {}, rights: {}, gender_list: config.gender_list, template_data: template_data})
})

app.post("/submit", async function (req, res) {

		let rights = {}
		rights.qa = []

		let wrongs = {}
		let template_data = {}

		//check if the current date is before deadline
		let today = new Date()
		let deadline = new Date(config.event_deadline)

		template_data.deadline = deadline

		console.log(today, deadline)

		if (today > deadline) {
			log("Submit attmpted after deadline")
			wrongs.past_deadline = true
			res.render(path.join(__dirname, "pages/quiz.html"), {questions: questions,
																wrongs: wrongs, 
																rights: rights, 
																gender_list: 
																config.gender_list, template_data: template_data})
			return

		}


	try {

		// seperate questions from general info
		for (key of Object.keys(req.body)) {
			if (key.includes("question")) {
				let qNo = key.slice(8) // dumb bitch
				rights.qa[qNo] = req.body[key]
			} else {
				rights[key] = req.body[key]
			}
		}
		console.log(rights)

		// check if gender entered does not match expected
		if (config.gender_list.indexOf(rights.gender) < 0){
			wrongs.gender = "Invalid gender selection"

		}

		//check if email is in correct format
		if (!emailRegexp.test(rights.email)){
			wrongs.email = "Not a valid email. We need a valid email so we can send your results to you."
		}


		// check if this email have already done the survey
		var conn = await db_functions.connectdb(process.env.CUPID_DB_HOST,
											   process.env.CUPID_DB_USER, 
											   process.env.CUPID_DB_PASS, 
											   process.env.CUPID_DB_NAME)

		await conn.awaitBeginTransaction()

		entry_exists = await db_functions.email_in_table(conn, rights.email, "cupid_data")

		if (entry_exists){
			wrongs.email = "This email has already done the survey"
		}

		// return back if there are any errors
		if (Object.keys(wrongs).length > 0) {
			res.render(path.join(__dirname, "pages/quiz.html"), {questions: questions, wrongs: wrongs, rights: rights, gender_list: config.gender_list, template_data: template_data})
		} else {
			// generate sql query
			let sql_code = (`INSERT INTO cupid_data `
						+	`(name, surname, email, gender, comment, answers) `
						+   `VALUES (${conn.escape(rights.firstName)}, 
									 ${conn.escape(rights.lastName)}, 
									 ${conn.escape(rights.email)}, 
									 ${conn.escape(rights.gender)}, 
									 ${conn.escape(rights.comment)}, 
									 ${conn.escape(JSON.stringify(rights.qa))})`
									 )

			// send sql to db
			await db_functions.send_sql(conn, sql_code)

			//save all db changes
			await conn.awaitCommit()

			res.status(200)
			res.render(path.join(__dirname, "pages/submit.html"), {rightsStr: JSON.stringify(rights, null, 4)})
			log(`New lover ${rights.firstName} ${rights.lastName}`)

		}

	} catch (err) {
		log(err)
		res.status(500)
		res.render(path.join(__dirname, "pages/error.html"), {errCode: 500, errDesc: "Internal Server Error", errMsg: "The server tried to send you that page but broke."})
	} finally {
		//always close that db connection
		conn.awaitEnd()
	}
})

app.get("/test", async function (req, res) {
	let conn = await db_functions.connectdb(process.env.CUPID_DB_HOST,
											process.env.CUPID_DB_USER,
											process.env.CUPID_DB_PASS,
											process.env.CUPID_DB_NAME)
	let table = await db_functions.match(conn)
	res.render(path.join(__dirname, "pages/submit.html"), {rightsStr: JSON.stringify(table, null, 2)})
})

app.get("/results", async function (req, res) {
  let conn = await db_functions.connectdb(process.env.CUPID_DB_HOST,
											process.env.CUPID_DB_USER,
											process.env.CUPID_DB_PASS,
											process.env.CUPID_DB_NAME)
	let table = await db_functions.send_sql(conn, `SELECT a.name AS Name, b.name AS "Match" FROM cupid_data a INNER JOIN cupid_data b ON a.matchId = b.id ORDER BY name ASC;`)
	console.log(table)
	console.log(table[0].Name)
	res.render(path.join(__dirname, "pages/results.html"), {table: table})
})

app.use(function (req, res) {
	res.status(404)
	res.render(path.join(__dirname, "pages/error.html"), {errCode: 404, errDesc: "Page Not Found", errMsg: "That page does not exist."})
})

var loverCount = 0

let setLoverCount = async () => {
	let conn = await db_functions.connectdb(process.env.CUPID_DB_HOST,
											process.env.CUPID_DB_USER,
											process.env.CUPID_DB_PASS,
											process.env.CUPID_DB_NAME)
	await conn.awaitBeginTransaction()
	loverCount = await db_functions.getLoverCount(conn, "cupid_data")
}
setLoverCount()
setInterval(setLoverCount, 100000)

app.listen(process.env.PORT ||8000, () => {
	log(`Cupid is alive.`)
})
