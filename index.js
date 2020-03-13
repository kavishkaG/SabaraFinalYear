var express = require('express');
var bodyParser = require('body-parser')
var app = express();
var mysql = require('mysql');
var cors = require('cors');
var upload = require('express-fileupload');
require('dotenv').config()
var con = require('./config/config');

app.use(cors());
app.use(upload());
app.use(express.static(__dirname));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
var excelToJson = require('convert-excel-to-json');

// var excelSheet = require('./routes/excelSheet');

// app.use('/excelSheet', excelSheet);

var excelSheet = require('./routes/excelSheet');

app.use('/excelSheet', excelSheet);

const promisifyConQuery = (sql) => {

    return new Promise((resolve, reject) => {

        const dbConnection = con();

        dbConnection.query(sql, function (err, result, fields) {

            if (err) {

                console.log(err)
                resolve({ success: false});

            } else {

                console.log("sql query");
                resolve({ success: true, message: "successfully inserted!!"});

            }
        })

    });

}

app.post('/excelSheet',(req,res)=>{
    console.log(req.files.files);
    let file = req.files.files;
    let filename = req.files.files.name;
    console.log(filename)
    let data = [];
    file.mv('D:/'+filename,(err)=>{
        if(err){
            console.log(err)
            res.send({msg:'dedede'});
        }else{
            let result = excelToJson({
                sourceFile : 'D:/'+filename,
                header : {rows:1},
                columnToKey :{A:'time',B:'CorrGrav',C:'Drift error',D:'new_corrgrav', E:'Tide', F:'mass grav corr', G:'final Gravity', H:'Final_corrected_grav'},
                sheet : ['Sheet1']
            });


            for(var i = 0; i < result.Sheet1.length; i++){

                var corrected_grav = 0;

                corrected_grav = result.Sheet1[i].new_corrgrav - ((0.0419*1.02)*result.Sheet1[i].Tide);

                console.log(corrected_grav);

                var sql = "INSERT INTO gravitydata (time, tide, gravity, corr_gravity) VALUES ('" +
                            result.Sheet1[i].time +
                            "','" +
                            result.Sheet1[i].Tide +
                            "','" +
                            result.Sheet1[i].new_corrgrav +
                            "','" +
                            corrected_grav +
                            "')";

                            const sqlQuery = promisifyConQuery(sql);

                            console.log(sqlQuery);

                            // await con().query(sql, function (err, result, feilds) {
                            //     if (!err) {
                            //         console.log("successfully inserted!");
                            //     }
                            //     else {
                            //         console.log(err);
                            //     }
                            // })

                console.log(result.Sheet1[i])
                data.push(result.Sheet1[i].time);
            }
            res.send(data);
        }
    })
})

app.listen(process.env.PORT, () => { console.log('server start at port ' + process.env.PORT) });