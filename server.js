const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');

const database = {
  users: [
    {
      id: '123',
      name: 'John',
      email: 'john@gmail.com',
      password: 'cookies',
      entries: 0,
      joined: new Date(),

    },
    {
      id: '125',
      name: 'Sally',
      email: 'sally@gmail.com',
      password: 'bananas',
      entries: 0,
      joined: new Date(),

    }
  ],
  login: [
    {
      id: '987',
      hash: '',
      email: 'john@gmail.com'
    }
  ]
}

app.use(bodyParser.json());
app.use(cors());

app.get('/', (req,res) => {
  res.json(database.users);
});

app.post('/signin', (req, res) => {
  if (req.body.password === database.users[0].password &&
    req.body.email === database.users[0].email){
    res.json(database.users[0]);
  } else {
    res.status(400).json('error loggin in');
  }
});

app.post('/register', (req, res) => {
  const { email, name, password } = req.body;
  const newUser = {
    id: '124',
    name: name,
    email: email,
    entries: 0,
    joined: new Date()
  }
  database.users.push(newUser);
  res.json(database.users[database.users.length -1]);

});

app.get('/profile/:id', (req, res) => {
  const { id } = req.params;
  let found = false;
  database.users.forEach(user => {
    if (user.id === id) {
      found = true;
      return res.json(user);
    }
  });
  if (!found) {
    res.status(400).json('no such user');
  }
});

app.put("/image", (req, res) => {
  const { id } = req.body;
  let found = false;
  database.users.forEach(user => {
    if (user.id === id) {
      found = true;
      user.entries += 1;
      return res.json(user.entries);
    }
  });
  if (!found) {
    res.status(400).json('no such user');
  }

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

app.listen(3000, console.log('server runs'));