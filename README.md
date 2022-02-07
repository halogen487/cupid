# cupid
Simple website full of filler text. There's a form you can fill in and it saves it in a SQLite database.

# Disclamer
This project is a <b>joke</b> and is not inteded to be taken seriously.
We do not intend to offend anyone and made this last minute just for fun.


- [Trello](https://trello.com/invite/b/cXxR1x4s/4da56287093b657b20f617dff884614c/todo)


##  Server setup

### Nodejs version managment (optional)
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
```
```bash
nvm install
nvm use
``` 


### Install dependencies
```bash
npm install
```

### Add the following to the <b>top</b> of `~/.bashrc`
```bash
export CUPID_DB_NAME="<db name>"
export CUPID_DB_USER="<db user>"
export CUPID_DB_PASS="<db password>"
export CUPID_DB_HOST="<db host>"
```
Don't forget to `source ~/.bashrc` to make the changes take effect.


### Creating the database
```bash
# the db will be created according to db/schema.js
node db/createdb.js
```

### Updating database
Either update manually or by deleting the table (or db if nessesary), update the db/schema.js and run `node db/createdb.js`
