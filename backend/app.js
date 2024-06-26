const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const database = require('./config/db'); // Ensure this path is correct
const cors = require('cors');
const config = require('./config/config');

const app = express();
const port = 3001;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());



app.post('/register', async (req, res) => {
  const { username, email, password, re_pass } = req.body;
  if(password != re_pass) {
    return res.status(400).json({message: 'passwords doesnt match !'});
  }

 if(!valid_password(password)){
      return res.status(400).json({message: 'the passowrd is too weak ! '});
    }
  try {
    // check if username/email exists in the database before add them 
    const list_users = 'SELECT COUNT(*) AS count FROM users WHERE username = ? OR email = ?';

    database.query(list_users, [username, email], async (err, results) => {
      if (err) {
        console.error('Error in getting the list of users : ', err);
        return res.status(500).send('Server error');
      }

      const num_of_users = results[0].count;

      if (num_of_users > 0) {
        return res.status(400).send('this user already exists in the database');
      }


     //save the password to the databse with salt and HMAC
     const salt_pass = await bcrypt.genSalt(10); //10 is the num of round in salt
      const hashedPassword = await bcrypt.hash(password, salt_pass);



      // add the user into database
      const insertUserSql = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
      database.query(insertUserSql, [username, email, hashedPassword], (err, result) => {
        if (err) {
          console.error('Error insert user: ', err);
          return res.status(500).send('Server error');
        }
        res.status(200).send('User registered successfully');
      });
    });
  } catch (error) {
    console.error('Error registering user: ', error);
    res.status(500).send('Server error');
  }
});


app.get('/checkUsername', async(req,res) => {

  const username = req.query.username
  console.log('debug');
  const check_query = 'SELECT COUNT(*) AS count FROM users WHERE username = ?';
  database.query(check_query, [username], (err, result) => {
    if(err) {
      console.log('error while checking the username:', err);
      return res.status(500).send('Server error');
    }

    const users_count = result[0].count;
    if(users_count > 0) {
      res.status(200).send('username founded success, now change the password ');
    } else {
      res.status(404).send('username doesnt exist in the database');
    }
  });

});


app.post('/changePassword', async (req, res) => {
  const { username, currentPassword, newPassword } = req.body;

  try {
    // Check if the user exists
    const user_query = 'SELECT * FROM users WHERE username = ?';
    database.query(user_query, [username], async (err, results) => {
      if (err) {
        console.error('Error in getting the user: ', err);
        return res.status(500).send('Server error');
      }

      if (results.length === 0) {
        return res.status(404).json({ message: 'Username does not exist' });
      }


      const user = results[0];

      //check if the current password match the saved in the database 
      //const is_match_pass = await bcrypt.compare(currentPassword, user.password);
      console.log(currentPassword);
      console.log(user.password);
      // if (!is_match_pass) {
      //   return res.status(400).json({ message: 'Current password is incorrect' });
      // }

      //check if the new password match the configurations 
      if (!valid_password(newPassword)) {
        return res.status(400).json({ message: 'The new password is too weak' });
      }


      //update the new password in the database using salt and hmac
      const salt = await bcrypt.genSalt(10);
      const hadshed_password = await bcrypt.hash(newPassword, salt);
      const update_db = 'UPDATE users SET password = ? WHERE username = ?';
      database.query(update_db, [hadshed_password, username], (err,result) => {
        if(err){
          console.log('Error updating the password ', err);
          return res.status(500).send('server error');

      }
    res.status(200).json({message: 'password changed succdssfully in the database'});
    
     });


  });
  
  
}catch{
  console.error('Error changing password: ', error);
  res.status(500).send('Server error');
}
});













function valid_password(pass) {
  console.log('Password:', pass);
  console.log('Config:', config.password);

  if (pass.length < config.password.min_password_length) {
    console.log('Password is too short');
    return false;
  }
  if (!(/[A-Z]/.test(pass))) {
    console.log('Password lacks uppercase letter');
    return false;
  }
  if (!(/[a-z]/.test(pass))) {
    console.log('Password lacks lowercase letter');
    return false;
  }
  if (!(/\d/.test(pass))) {
    console.log('Password lacks number');
    return false;
  }
 
  const special_chars = [...config.password.special];
  if(!(hasSpecialCharacter(pass, special_chars))){
    console.log('Password lacks special characters');
    return false;
  }


  return true;
}


function hasSpecialCharacter(password, specialCharacters) {
  for (let char of password) {
      if (specialCharacters.includes(char)) {
          return true;
      }
  }
  return false;
}

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});