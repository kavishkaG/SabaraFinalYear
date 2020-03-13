var mysql = require('mysql');
require('dotenv').config()


function createDbConnection() {

var con = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  connectTimeout: 120000
});

 con.connect(function (err) {
    if (!err){
        console.log("Database Connection Created");
    }
    else{
        throw err;
    }
});

return con;

}

module.exports = createDbConnection;