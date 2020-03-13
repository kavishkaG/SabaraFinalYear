var express = require('express');
var bodyParser = require('body-parser')
var app = express();
var mysql = require('mysql');
var cors = require('cors');
var upload = require('express-fileupload');
require('dotenv').config()

app.use(cors());
app.use(upload());
app.use(express.static(__dirname));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

var excelSheet = require('./routes/excelSheet');

app.use('/excelSheet', excelSheet);

app.listen(process.env.PORT, () => { console.log('server start at port ' + process.env.PORT) });