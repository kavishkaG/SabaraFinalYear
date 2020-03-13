var con = require('../config/config');
var excelToJson = require('convert-excel-to-json');

const promisifyConQuery = (sql) => {

    return new Promise((resolve, reject) => {

        const dbConnection = con();

        dbConnection.query(sql, function (err, result, fields) {

            if (err) {

                console.log("TCL: promisifyConQuery -> err", err)
                resolve(null);

            } else {

                console.log("sql query promisifyConQuery");
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

                        console.log("sqlQuery corrected_grav-> err", err)

                    } else {

                        console.log("sql query corrected_grav");

                    }

                    console.log(result.Sheet1[i])
                    data.push(result.Sheet1[i].time);

                }

                resolve({ success: true, message: "successfully inserted!!" });

            }

        })

    });

}

const getPredicateGrav = (jsonData, gravData, timeData, file, filename) => {

    return new Promise((resolve, reject) => {

        file.mv('D:/' + filename, async (err) => {

            if (err) {

                console.log(err)
                resolve({ success: false, message: "not successfully" });

            } else {

                let result = excelToJson({
                    sourceFile: 'D:/' + filename,
                    header: { rows: 1 },
                    columnToKey: { A: 'time', B: 'CorrGrav', C: 'Drift error', D: 'new_corrgrav', E: 'Tide', F: 'mass grav corr', G: 'final Gravity', H: 'Final_corrected_grav' },
                    sheet: ['Sheet1']
                });


                for (var i = 0; i < result.Sheet1.length; i++) {

                    var predicated_grav = 0;
                    var data1 = {}

                    var checkvalues = "SELECT * from gravitydata WHERE time = '" + result.Sheet1[i].time + "'";
                    const sqlQuery = await promisifyConQuery(checkvalues);

                    // console.log("aaaaaaaaa",sqlQuery.result[0]);

                    if (sqlQuery == null) {

                        console.log("sqlQuery predicated_grav -> err", err)


                    } else {

                        console.log("sql query predicated_grav");

                        predicated_grav = sqlQuery.result[0].corr_gravity + ((0.0419 * 1.02) * result.Sheet1[i].Tide);

                        data1 = {
                            time: result.Sheet1[i].time,
                            Tide: result.Sheet1[i].Tide,
                            predicated_gravity: predicated_grav
                        }

                        jsonData.push(data1);
                        gravData.push(predicated_grav);
                        timeData.push(result.Sheet1[i].time);

                    }

                    console.log(jsonData[i]);
                    console.log("gravData " + i + " ==> " + gravData[i]);
                    console.log("timeData " + i + " ==> " + timeData[i]);

                }

                resolve({ success: true, jsonData: jsonData, gravData: gravData, timeData: timeData, message: "successfully" });

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

        let jsonData = [];
        let gravData = [];
        let timeData = [];

        const getPredicateGravRes = await getPredicateGrav(jsonData, gravData, timeData, file, filename);

        console.log(getPredicateGravRes);

        return (getPredicateGravRes);

    } catch (error) {

        console.log("getPredicatedGravity controller error =====> ", error);

    }
}