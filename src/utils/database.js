require("dotenv").config();
const mysql = require('mysql2');

// create a new MySQL connection
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306
}).promise(); // enable promise support

// Test connection
const testConnection = async () => {
  try {
    await connection.query("SELECT 1"); // Query just to test connection
    console.log('Connected to MySQL database!');
  } catch (error) {
    console.error('Error connecting to MySQL database:', error);
  }
};

testConnection();

// close the MySQL connection when the app terminates
process.on('SIGINT', async () => {
  console.log('Closing MySQL connection...');
  await connection.end();
  process.exit();
});

// export the connection
module.exports = connection;
