#! /usr/bin/env node

const sqlite3 = require("sqlite3")
const log = require("./log.js")

const findMatches = function (userID) {
	let db = new sqlite3.Database("./cupiddb.sqlite", err => {
		if (err) log(err)
		db.serialize(() => {
			let answers
			db.get("SELECT * FROM USERS WHERE userID = ?", userID, (err, row) => {
				if (err) log(err)
				console.log(row)
				answers = row.answers.split(",")
				console.log(answers)
				answersRegex
			})
			db.parallelize(() => {
				db.get("SELECT * FROM users answers REGEXP ?", 3, )
			})
		})
	})
}

findMatches(21)
