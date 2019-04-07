const handleRegister = (req, res, db, bcrypt) => {
  const {
    email,
    name,
    password
  } = req.body;
  if (!email || !name || !password) {
    return res.status(400).json('incorrect form submission');
  }
  const hash = bcrypt.hashSync(password);
  // transaction is the thing that makes whole request like one unit.
  // if where will be an error db will cancel whole request nor a part of it
  db.transaction(trx => {
      trx.insert({
          hash: hash,
          email: email
        })
        .into('login')
        // 71 - 79 ==> all this code id for input encripted password and user email in login table
        // ufter that we also put that email in users table
        .returning('email')
        .then(loginEmail => {
          return trx('users')
            .returning('*')
            .insert({
              email: loginEmail[0],
              name: name,
              joined: new Date()
            })
            .then(user => {
              res.json(user[0]);
            })
        })
        .then(trx.commit) // commit is something like 'save button'
        .catch(trx.rollback) // if something goes wrong whole transaction will be rollback
    })
    .catch(err => res.status(400).json('unable to register'))
}

module.exports = {
  handleRegister: handleRegister
};