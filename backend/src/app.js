const express = require('express');
const gasStationRoutes = require('./routes/gasStationRoutes');
const sendResponse = require('./utils/response');

const app = express();
app.use(express.json());

app.use('/api/gas-stations', gasStationRoutes);

app.use((req, res) => {
  sendResponse(res, 404, false, 'Endpoint tidak ditemukan');
});

app.use((err, req, res, next) => {
  console.error('💥 Unhandled Error:', err);
  sendResponse(res, 500, false, 'Terjadi kesalahan internal server', null, err.message);
});

module.exports = app;
