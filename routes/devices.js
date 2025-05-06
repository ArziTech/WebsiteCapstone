const express = require('express');
const router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    // TODO: get the devices from db
    res.render('index', { title: 'List of devices' });
});

/* register a new device. */
router.post('/', function(req, res, next) {
    // TODO: get the devices from db
    const { deviceName, deviceLastAddress } = req.body;

    res.render('index', { title: 'List of devices' });
});

module.exports = router;
