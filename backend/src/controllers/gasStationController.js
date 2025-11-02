const { PrismaClient } = require('@prisma/client');
const sendResponse = require('../utils/response');

const prisma = new PrismaClient();

exports.getAllGasStations = async (req, res) => {
  try {
    const stations = await prisma.gasStation.findMany();

    if (!stations || stations.length === 0) {
      return sendResponse(res, 404, false, 'Tidak ada data SPBU ditemukan');
    }

    sendResponse(res, 200, true, 'Data SPBU berhasil diambil', stations);
  } catch (err) {
    console.error('❌ Error mengambil data SPBU:', err);
    sendResponse(res, 500, false, 'Terjadi kesalahan server', null, err.message);
  }
};
