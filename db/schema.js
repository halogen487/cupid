const schema = {
    "data_bases":[
        {
            "name": `${process.env.CUPID_DB_NAME}`,
            "tables": [
                {
                    "name": "cupid_data",
                    "columns": [
                        {"name": "id", "type": "int", "increment": true},
                        {"name": "name", "type": "text", "increment": false},
                        {"name": "surname", "type": "text", "increment": false},
                        {"name": "email", "type": "text", "increment": false},
                        {"name": "gender", "type": "text", "increment": false},
                        {"name": "orientation", "type": "text", "increment": false},
                        {"name": "comment", "type": "text", "increment": false},
                        {"name": "answers", "type": "text", "increment": false},

                    ]
                }
            ]
        }
    ]
}

module.exports = {schema}