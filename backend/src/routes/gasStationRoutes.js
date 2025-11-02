const express = require('express');
const router = express.Router();
const { getAllGasStations } = require('../controllers/gasStationController');

router.get('/', getAllGasStations);

module.exports = router;
