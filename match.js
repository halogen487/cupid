const mysql = require(`mysql-await`);
const db_functions = require("./db_functions.js")

/*function match (conn) {
	try {
		let table = await db_functions.send_sql(conn, `SELECT * FROM cupid_data`)
		for (i of table) {
			let matchScores = {}
			for (j of table) {
				if (i.id != j.id) {
					let score = 0
					for (k of j.answers) {
						// if only 11 answers
						let qNo
						if (k < 2) {
							qNo = k + 20
						} else {
							qNo = k + 10
						}
						// endif
						let answerScore = questions[qNo].answer_score
						score += answerScore[i.answers[k]][j.answers[k]]
					}
					matchScores[j.id] = score
				}
			}
			await db_functions.sendsql(conn, `UPDATE cupid_data SET matches = ${matchScores} WHERE id = ${i.id}`)
		}
	} catch (e) {
		console.log(e)
	}
}*/

function match (conn) {
	try {
		db_functions.send_sql(conn, "UPDATE cupid_data SET match = ${}")
		let table = await db_functions.send_sql(conn, `SELECT * FROM cupid_data`)
		
	} catch (e) {
		console.log(e)
	}
}
