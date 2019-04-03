const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt-nodejs");
const cors = require("cors");
const knex = require("knex");

const db = knex({
  client: "pg",
  connection: {
    host: "127.0.0.1",
    user: "Pavel",
    password: "",
    database: "smart-brain"
  }
});

app.use(bodyParser.json());
app.use(cors());

app.get("/", (req, res) => {
  res.json(database.users);
});

app.post("/signin", (req, res) => {
  db.select("email", "hash")
    .from("login")
    .where("email", "=", req.body.email)
    .then(data => {
      const isValid = bcrypt.compareSync(req.body.password, data[0].hash);
      if (isValid) {
        return db
          .select("*")
          .from("users")
          .where("email", "=", req.body.email)
          .then(user => res.json(user[0]))
          .catch(err => res.status(400).json("unable to get user"));
      } else {
        res.status(400).json("user not found");
      }
    })
    .catch(err => res.status(400).json("wrong credentials"));
});

app.post("/register", (req, res) => {
  const { email, name, password } = req.body;
  const hash = bcrypt.hashSync(password);
  // transaction is the thing that makes whole request like one unit.
  // if where will be an error db will cancel whole request nor a part of it
  db.transaction(trx => {
    // trx is the object of knex which will work instead of db in this expression
    //we insert in login table decripted user email
    trx.insert({
        //hash is our password
        hash: hash,
        email: email
      })
      .into("login")
      // 71 - 79 ==> all this code id for input encripted password and user email in login table
      // ufter that we also put that email in users table
      .returning("email")
      .then(loginEmail => {
        return (
          trx("users")
            .returning("*")
            .insert({
              name: name,
              email: loginEmail[0],
              joined: new Date()
            })
            .then(user => res.json(user[0]))
            // commit is something like 'save button'
            .then(trx.commit)
            // if something goes wrong whole transaction will be rollback
            .catch(trx.rollback)
        );
      });
  }).catch(err => res.status(400).json("unable to join"));
});

app.get("/profile/:id", (req, res) => {
  const { id } = req.params;
  db.select("*")
    .from("users")
    .where({ id })
    .then(user => {
      if (user.length) {
        res.json(user[0]);
      } else {
        res.status(400).json("no such user");
      }
    })
    .catch(err => res.status(400).json("error getting user"));
});

app.put("/image", (req, res) => {
  const { id } = req.body;
  db("users")
    .where("id", "=", id)
    .increment("entries", 1)
    .returning("entries")
    .then(entries => res.json(entries[0]))
    .catch(err => res.status(400).json("unable to get entries"));
});

// bcrypt.hash("bacon", null, null, function (err, hash) {
//   // Store hash in your password DB.
// });

// // Load hash from your password DB.
// bcrypt.compare("bacon", hash, function (err, res) {
//   // res == true
// });
// bcrypt.compare("veggies", hash, function (err, res) {
//   // res = false
// });

app.listen(3000, console.log("server runs"));
