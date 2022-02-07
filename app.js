#! /usr/bin/env node

const path = require("path")
const express = require("express")
const ejs = require("ejs")
const sqlite3 = require("sqlite3")
const log = require("./log.js")
const questions = require("./questions.json")
const config = require("./config/config")
const db_functions = require("./db_functions")



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
	res.render(path.join(__dirname, "pages/index.html"))
})

app.get("/form", function (req, res) {
	res.render(path.join(__dirname, "pages/form.html"), {questions: questions, wrongs: {}, rights: {}, gender_list: config.gender_list})
})

app.post("/submit", async function (req, res) {
	try {

		let rights = {}
		rights.qa = {}

		let wrongs = {}

		// seperate questions from general info
		for (key of Object.keys(req.body)) {
			if (key.includes("question")) {
				rights.qa[key] = req.body[key]
			} else {
				rights[key] = req.body[key]
			}
		}

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
			wrongs.email = "This email has alkready done the survey"
		}

		// return back if there are any errors
		if (Object.keys(wrongs).length > 0) {
			res.render(path.join(__dirname, "pages/form.html"), {questions: questions, wrongs: wrongs, rights: rights.qa, gender_list: config.gender_list})

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

		}

	} catch (err) {
		log(err)
		res.status(500)
		res.send("Internal server error")
	} finally {
		//always close that db connection
		conn.awaitEnd()
	}
})

app.use(function (req, res) {
	res.status(404)
	res.render(path.join(__dirname, "pages/404.html"))
})

app.listen(8000, () => {
	log(`Cupid is alive.`)
})
