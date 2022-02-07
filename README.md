# cupid
Cupid is a website containing a quiz. Answers get saved in a database and on Valentine's day, an advanced blockchain algorithm determines who'd make the best couples.

This project is a **joke**, please do not take it seriously. We made this last minute just for fun.


- [Trello](https://trello.com/invite/b/cXxR1x4s/4da56287093b657b20f617dff884614c/todo)


##  Server setup

NodeJS version managment (optional):

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
nvm install
nvm use
``` 

Install dependencies:

```bash
npm install
```

Add the following to the **top** of `~/.bashrc`:

```bash
export CUPID_DB_NAME="<db name>"
export CUPID_DB_USER="<db user>"
export CUPID_DB_PASS="<db password>"
export CUPID_DB_HOST="<db host>"
```

Don't forget to `source ~/.bashrc` to make the changes take effect.

Create the database:

```bash
# the db will be created according to db/schema.js
node db/createdb.js
```

To update the database, either update manually or by deleting the table (or db if nessesary), update the db/schema.js and run `node db/createdb.js`
