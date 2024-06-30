const mysql = require('mysql');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root', // Your MySQL user
  password: 'yazanateer', // Your MySQL password
  database: 'mydb' // Your MySQL database
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL: ', err);
    throw err;
  }
  console.log('MySQL connected...');
});

module.exports = db;
