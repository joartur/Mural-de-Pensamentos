const express = require('express');
const router = express.Router();
const ToughtController = require('../Controllers/ToughtController');

router.get('/', ToughtController.showToughts);

module.exports = router;
