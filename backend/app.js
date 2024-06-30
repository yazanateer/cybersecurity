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




//the function to check if the passowrd consists of the configurations rules 
// function valid_passowrd(pass) {
//   if(pass.length < config.password.min_password_length 
//     || !(/[A-Z]/.test(pass)) ||  //upeer letters
//     !(/[a-z]/.test(pass)) ||  //lower letters
//     !(/\d/.test(pass)) || // have a number
//     !(new RegExp(`[${config.password.special}]`).test(pass))
//   ) return false;
//   return true;
// }


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
  // if (!new RegExp(`[${config.password.special}]`).test(pass)) {
  //   console.log('Password lacks special character');
  //   return false;
  // }
  
  const special_chars = [...config.password.special];
  const regexPattern = new RegExp(`[${special_chars}]`);
  if(!regexPattern.test(pass)){
    console.log('Password lacks special characters');
    return false;
  }


  return true;
}


app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});