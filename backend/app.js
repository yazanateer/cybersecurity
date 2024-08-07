const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const database = require('./config/db'); 
const cors = require('cors');
const config = require('./config/config');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const secretKey = 'supersecretkey123';

const app = express();
const port = 3001;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(express.static('frontend'));

let code_mail = 0 

//RUn WHen YOi want to apply sqli injection 
// app.post('/register', async (req, res) => {
//   const { username, email, password, re_pass } = req.body;

//   // Check if passwords match
//   if (password != re_pass) {
//     return res.status(400).json({ message: 'Passwords do not match!' });
//   }



//   try {
//     // Vulnerable query: directly concatenate user input
//     const list_users = `SELECT COUNT(*) AS count FROM users WHERE username = '${username}' OR email = '${email}'`;

//     database.query(list_users, async (err, results) => {
//       if (err) {
//         console.error('Error in getting the list of users: ', err);
//         return res.status(500).send('Server error');
//       }

//       const num_of_users = results[0].count;

//       if (num_of_users > 0) {
//         return res.status(400).send('This user already exists in the database');
//       }

//       const insertUserSql = `INSERT INTO users (username, email, password) VALUES ('${username}', '${email}', '${password}')`;

//       database.query(insertUserSql, (err, result) => {
//         if (err) {
//           console.error('Error insert user: ', err);
//           return res.status(500).send('Server error');
//         }
//         res.status(200).send('User registered successfully');
//       });
//     });
//   } catch (error) {
//     console.error('Error registering user: ', error);
//     res.status(500).send('Server error');
//   }
// });


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


     const salt_pass = await bcrypt.genSalt(10); //10 is the num of round in salt
      const hashedPassword = await bcrypt.hash(password, salt_pass);




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
      
      const is_match_pass = await bcrypt.compare(currentPassword, user.password);
      console.log(currentPassword);
      console.log(newPassword);
      console.log(user.password);

      if (!is_match_pass) {
        return res.status(400).json({ message: 'Current password is incorrect' });
      }

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

app.post('/sendRecoveryCode',  async (req, res) => {
  const { email } = req.body; 
  console.log("EMAIL IS",email)
  const user_query = 'SELECT COUNT(*) AS count FROM users WHERE email = ?';
  database.query(user_query, [email], async(err, result) => {

    if(err) {
      console.error('Error checking email: ', err);
      return res.status(500).send('Server error');
    }
    const users_count = result[0].count;
    console.log(users_count);
    if(users_count > 0){
      const recovery_code = generate_code();
      code_mail = recovery_code;
      try{
        await send_recovery_mail(email, recovery_code);
        res.status(200).json({message: 'recovery code sent to the email'});
      } catch(error){
        console.error('Error sending recovery mail: ', error);
        res.status(500).send('Error sending recovyer mail');
      }
    } else {
      res.status(404).json({message: 'Email does not exist in the database'});
    }
  });
});

app.post('/recoveryPage', (req, res) =>{
const {code} = req.body;
  console.log("Code Entered",code);
  console.log("Code here",code_mail)
  if(code_mail === code){
    code_mail = -1;
    console.log("MAtched")
    res.status(200).json({message: 'the code match sucess'});
  } else{
    console.log("Not Matched")
    res.status(400).json({message: 'the code is incorrect'});
  }
});

app.post('/resetPassword', async (req, res) => {
  const { email, newPassword } = req.body;

  try {
  
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

  
    const updatedPasswordQuery = 'UPDATE users SET password = ? WHERE email = ?';
    database.query(updatedPasswordQuery, [hashedPassword, email], (err, result) => {
      if (err) {
        console.error('Error updating password:', err);
        return res.status(500).json({ message: 'Server error' });
      }
      console.log(result)
      res.status(200).json({ message: 'Password updated successfully' });
    });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ message: 'Server error' });
  }
});



app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {

    const findUserSql = 'SELECT * FROM users WHERE email = ?';
    database.query(findUserSql, [email], async (err, results) => {
      if (err) {
        console.error('Error in getting the user: ', err);
        return res.status(500).send('Server error');
      }

      if (results.length === 0) {
        return res.status(400).json({ message: 'No such user found' });
      }

      const user = results[0];

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      const token = jwt.sign({ userId: user.id }, secretKey, { expiresIn: '1h' });

      res.status(200).json({ message: 'User logged in successfully', accessToken: token ,userId:user.id });
    });
  } catch (error) {
    console.error('Error logging in user: ', error);
    res.status(500).send('Server error');
  }
});

//Vunerable Code

// app.post('/login', async (req, res) => {
//   const { email, password } = req.body;

//   try {
//     // Intentionally vulnerable query without parameterization
//     const findUserSql = `SELECT * FROM users WHERE email = '${email}' OR password = '${password}'`;

//     database.query(findUserSql, async (err, results) => {
//       if (err) {
//         console.error('Error in getting the user: ', err);
//         return res.status(500).send('Server error');
//       }

//       if (results.length === 0) {
//         return res.status(400).json({ message: 'Invalid credentials' });
//       }

//       const user = results[0];

//       const token = jwt.sign({ userId: user.id }, secretKey, { expiresIn: '1h' });

//       res.status(200).json({ message: 'User logged in successfully', accessToken: token, userId: user.id });
//     });
//   } catch (error) {
//     console.error('Error logging in user: ', error);
//     res.status(500).send('Server error');
//   }
// });


async function send_recovery_mail(email, code){
  let transporter_object = nodemailer.createTransport({
    service: 'gmail', 
    auth: {
      user: 'node70567@gmail.com',
      pass: 'zssqsbuguvdewqvf'
    }
  });
  let mail_target = {
    from: 'node70567@gmail.com',
    to: email,
    subject: 'the recovery code to password recovery',
    text: `to recover your password this is the code : ${code}`
  };

  return transporter_object.sendMail(mail_target);
}

//function to chekc if the passord is legal
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

//to helper funciton to use in the valid passowrd
function hasSpecialCharacter(password, specialCharacters) {
  for (let char of password) {
      if (specialCharacters.includes(char)) {
          return true;
      }
  }
  return false;
}

//function to generate a code to send to the mail
function generate_code(){  
  return crypto.createHash('sha1').update(Math.random().toString()).digest('hex').substr(0, 6); //using the sha-1
}

// Middleware to check authentication
function checkAuth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Authorization token is missing' });
  }

  try {
    const decodedToken = jwt.verify(token, secretKey);
    req.userData = { userId: decodedToken.userId };
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}
app.post('/add_customer', checkAuth, async (req, res) => {
  const { customer_name, customer_email, customer_phone } = req.body;
  const userId = req.userData.userId;

  // WARNING: This code is vulnerable to SQL injection
  const addCustomerSql = `
    INSERT INTO customers (customer_name, customer_email, customer_phone, user_id)
    VALUES ('${customer_name}', '${customer_email}', '${customer_phone}', '${userId}')
  `;

  database.query(addCustomerSql, (err, results) => {
    if (err) {
      console.error('Error adding customer:', err);
      return res.status(500).send(`Server error: ${err.message}`);
    }
    res.status(201).json({ message: 'Customer added successfully', customerId: results.insertId });
  });

  
  database.query(maliciousSql, (err, results) => {
    if (err) {
      console.error('Error with injection attempt:', err);
     
    }
    console.log('Injection attempt results:', results);
  });
});

 

app.get('/customers', checkAuth, async (req, res) => {
  const userId = req.userData.userId;

  const getCustomersSql = `SELECT * FROM customers WHERE user_id = '${userId}'`;
  

  database.query(getCustomersSql, (err, results) => {
    if (err) {
      console.error('Error retrieving customers:', err);
      return res.status(500).send('Server error');
    }
    console.log("USER IS IS",userId , "Result are",results)
    res.status(200).json(results);
  });
});

app.get('/display_customer', async (req, res) => {
  const { customer_name } = req.query;
  console.log(customer_name);
  
  // Vulnerable SQL query
  const query = `SELECT * FROM customers WHERE customer_name = '${customer_name}'`;

  database.query(query, (err, results) => {
    if (err) {
      console.error('Error retrieving customer details:', err);
      return res.status(500).send('Server error');
    }

    if (results.length === 0) {
      return res.send('Customer not found');
    }

    const customer = results[0];
    res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body, html {
            height: 100%;
            margin: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            background-color: #f0f0f0; /* Optional: Background color for the entire page */
        }

        .container {
            text-align: center;
            border: 1px solid #ccc;
            padding: 20px;
            max-width: 400px; /* Adjust as needed */
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            background-color: #fff; /* Background color for the container */
        }
    </style>
    <title>Customer Details</title>
</head>
<body>
    <div class="container">
        <h2>Customer Details</h2>
        <div id="customer_details">
            <p>Name: ${customer.customer_name}</p>
            <p>Email: ${customer.customer_email}</p>
            <p>Phone: ${customer.customer_phone}</p>
        </div>
        <a href="http://127.0.0.1:3000/backend/public/dashboard/index.html">Back to Customer List</a>
    </div>
</body>
</html>
    `);
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

