#! /usr/bin/env node

const fs = require("fs")

const log = function (msg) {
	console.log(`${(new Date).toISOString().replace(/[TZ]/g, " ").substring(11, 23)}: ${msg}`)
	fs.appendFile("./cupid.log", `${(new Date).toISOString()}: ${msg}\n`, (err) => {
		if (err) console.log("Logging error!")
	})
}

module.exports = log
