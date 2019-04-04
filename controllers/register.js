
const handleRegister = (req, res, db, bcrypt) => {
  const {
    email,
    name,
    password
  } = req.body;
  const hash = bcrypt.hashSync(password);
  // transaction is the thing that makes whole request like one unit.
  // if where will be an error db will cancel whole request nor a part of it
  db.transaction(trx => {
    // trx is the object of knex which will work instead of db in this expression
    //we insert in login table decripted user email
    trx
      .insert({
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
}

module.exports = {
  handleRegister: handleRegister
}