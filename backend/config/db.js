const mysql = require('mysql');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root', 
  password: 'yazanateer', 
  database: 'mydb' 
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL: ', err);
    throw err;
  }
  console.log('MySQL connected...');
});

module.exports = db;
