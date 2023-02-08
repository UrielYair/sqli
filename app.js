const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const app = express();
const port = 3000;

app.use(express.json());

const db = new sqlite3.Database('./users.db', sqlite3.OPEN_READWRITE, (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Connected to the users database.');
});

// Example table creation
db.run(`CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL,
  password TEXT NOT NULL
)`, (err) => {
  if (err) {
    console.error(err.message);
  }
});

app.post('/login', (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  db.get(`SELECT * FROM users WHERE username = '${username}'`, (err, row) => {
    if (err) {
      return res.status(500).send({ message: 'Internal server error' });
    }

    if (!row) {
      return res.status(401).send({ message: 'Incorrect username or password' });
    }

    bcrypt.compare(password, row.password, (err, result) => {
      if (err) {
        return res.status(500).send({ message: 'Internal server error' });
      }

      if (!result) {
        return res.status(401).send({ message: 'Incorrect username or password' });
      }

      return res.send({ message: 'Login successful' });
    });
  });
});

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
