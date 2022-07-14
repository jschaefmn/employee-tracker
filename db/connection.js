const mysql = require('mysql2');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Schaefb30!%',
  database: 'employees'
})

module.exports = db