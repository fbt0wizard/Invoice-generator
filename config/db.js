const mysql = require("mysql2");
require("dotenv").config();
const config = require('config')

const connectDB = mysql.createConnection({
  host: config.get('host'),
  user: config.get('username'),
  password: config.get('password'),
  database: config.get('db_name'),
});

// connectDB.connect((err) => {
//   if (err) throw err;
//   console.log("Database is connected successfully !");
// });

module.exports = connectDB;
