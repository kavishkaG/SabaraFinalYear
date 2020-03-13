var express = require('express');
var router = express.Router();
var excelSheetController = require('../controllers/excelSheet');

router.post('/postExcelSheet', (req, res) => {
    try {
        excelSheetController.postExcelSheet(req).then(result => {
            console.log(result.success);
            res.status(200).send({ success: result.success});
        }).catch(err => {
            console.log("ajchhc");
            console.log(err);
            res.status(500).send(err);
        }
        )
    } catch (error) {
        console.log("postExcelSheet route error ====> ", error)
    }
});

module.exports = router;