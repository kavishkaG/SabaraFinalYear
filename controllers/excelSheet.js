var con = require('../config/config');
const mysql = require('mysql');
var excelToJson = require('convert-excel-to-json');

const promisifyConQuery = (sql) => {

    return new Promise((resolve, reject) => {

        const dbConnection = con();

        dbConnection.query(sql, function (err, result, fields) {

            if (err) {

                console.log("TCL: promisifyConQuery -> err", err)
                resolve(null);

            } else {

                console.log("sql query");
                resolve({ success: true, message: "successfully inserted!!", result: result });

            }
        })

    });

}

const getJsonAndInsert = (data, file, filename) => {
    return new Promise((resolve, reject) => {
        file.mv('D:/' + filename, async (err) => {
            if (err) {

                console.log(err)
                resolve({ success: false, message: "not successfully inserted!!" });

            } else {

                let result = excelToJson({
                    sourceFile: 'D:/' + filename,
                    header: { rows: 1 },
                    columnToKey: { A: 'time', B: 'CorrGrav', C: 'Drift error', D: 'new_corrgrav', E: 'Tide', F: 'mass grav corr', G: 'final Gravity', H: 'Final_corrected_grav' },
                    sheet: ['Sheet1']
                });


                for (var i = 0; i < result.Sheet1.length; i++) {

                    var corrected_grav = 0;

                    corrected_grav = result.Sheet1[i].new_corrgrav - ((0.0419 * 1.02) * result.Sheet1[i].Tide);

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

                    const sqlQuery = await promisifyConQuery(sql);

                    console.log(sqlQuery);

                    if (sqlQuery == null) {

                        console.log("sqlQuery -> err", err)

                    } else {

                        console.log("sql query");

                    }

                    console.log(result.Sheet1[i])
                    data.push(result.Sheet1[i].time);

                }

                resolve({ success: true, message: "successfully inserted!!" });

            }
        })
    });
}

exports.postExcelSheet = async (req) => {
    try {

        console.log(req.files.files);
        let file = req.files.files;

        let filename = req.files.files.name;
        console.log(filename);

        let data = [];

        const getJsonAndInsertRes = await getJsonAndInsert(data, file, filename);

        console.log(getJsonAndInsertRes);

        return (getJsonAndInsertRes);

    } catch (error) {

        console.log("postExcelSheet controller error =====> ", error);

    }
}

exports.getPredicatedGravity = async (req) => {
    try {

        console.log(req.files.files);
        let file = req.files.files;

        let filename = req.files.files.name;
        console.log(filename)

        let data = [];

    } catch (error) {

        console.log("getPredicatedGravity controller error =====> ", error);
        
    }
}