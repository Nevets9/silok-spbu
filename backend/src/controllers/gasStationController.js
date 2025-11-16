const { PrismaClient } = require("@prisma/client");
const sendResponse = require("../utils/response");

const prisma = new PrismaClient();

exports.getAllGasStations = async (req, res) => {
  try {
    const stations = await prisma.gasStation.findMany();

    if (!stations || stations.length === 0) {
      return sendResponse(res, 404, false, "Tidak ada data SPBU ditemukan");
    }

    sendResponse(res, 200, true, "Data SPBU berhasil diambil", stations);
  } catch (err) {
    console.error("❌ Error mengambil data SPBU:", err);
    sendResponse(
      res,
      500,
      false,
      "Terjadi kesalahan server",
      null,
      err.message
    );
  }
};

// GET BY ID
exports.getGasStationById = async (req, res) => {
  try {
    const { id } = req.params;
    const stationId = parseInt(id);

    // Validasi ID
    if (isNaN(stationId)) {
      return sendResponse(res, 400, false, "ID tidak valid");
    }

    const station = await prisma.gasStation.findUnique({
      where: { id: stationId },
    });

    if (!station) {
      return sendResponse(res, 404, false, "SPBU tidak ditemukan");
    }

    sendResponse(res, 200, true, "Data SPBU berhasil diambil", station);
  } catch (err) {
    console.error("❌ Error mengambil data SPBU by ID:", err);
    sendResponse(
      res,
      500,
      false,
      "Terjadi kesalahan server",
      null,
      err.message
    );
  }
};

// CREATE
exports.createGasStation = async (req, res) => {
  try {
    const { name, lat, lng, address, brand, facilities, mapsUrl } = req.body;
    const parsedLat = parseFloat(lat);
    const parsedLng = parseFloat(lng); // Validasi input lebih ketat

    if (!name || !name.trim() || !address || !address.trim()) {
      return sendResponse(
        res,
        400,
        false,
        "Nama dan Alamat tidak boleh kosong"
      );
    }
    if (isNaN(parsedLat) || isNaN(parsedLng)) {
      return sendResponse(
        res,
        400,
        false,
        "Latitude (lat) dan Longitude (lng) harus berupa angka"
      );
    }

    const newStation = await prisma.gasStation.create({
      data: {
        name,
        lat: parsedLat,
        lng: parsedLng,
        address,
        brand: brand || "Pertamina",
        facilities: facilities || [],
        mapsUrl: mapsUrl || "",
      },
    });
    sendResponse(res, 201, true, "SPBU baru berhasil ditambahkan", newStation);
  } catch (err) {
    // Error jika ada unique constraint (misal: nama tidak boleh sama)
    if (err.code === "P2002") {
      return sendResponse(
        res,
        409,
        false,
        "Data dengan nama tersebut sudah ada"
      );
    }
    console.error("❌ Error membuat data SPBU:", err);
    sendResponse(
      res,
      500,
      false,
      "Terjadi kesalahan server",
      null,
      err.message
    );
  }
};

// UPDATE
exports.updateGasStation = async (req, res) => {
  try {
    const { id } = req.params;
    const stationId = parseInt(id);

    if (isNaN(stationId)) {
      return sendResponse(res, 400, false, "ID tidak valid");
    }

    const { name, lat, lng, address, brand, facilities, mapsUrl } = req.body;
    const parsedLat = lat ? parseFloat(lat) : undefined;
    const parsedLng = lng ? parseFloat(lng) : undefined;

    // Cek jika lat/lng diisi tapi bukan angka
    if ((lat && isNaN(parsedLat)) || (lng && isNaN(parsedLng))) {
      return sendResponse(
        res,
        400,
        false,
        "Jika diisi, lat/lng harus berupa angka"
      );
    }

    const updatedStation = await prisma.gasStation.update({
      where: { id: stationId },
      data: {
        name: name ? name.trim() : undefined,
        lat: parsedLat,
        lng: parsedLng,
        address: address ? address.trim() : undefined,
        brand,
        facilities,
        mapsUrl,
      },
    });
    sendResponse(
      res,
      200,
      true,
      "Data SPBU berhasil diperbarui",
      updatedStation
    );
  } catch (err) {
    if (err.code === "P2025") {
      // Error "Not Found" dari Prisma
      return sendResponse(res, 404, false, "SPBU tidak ditemukan");
    }
    if (err.code === "P2002") {
      return sendResponse(
        res,
        409,
        false,
        "Data dengan nama tersebut sudah ada"
      );
    }
    console.error("❌ Error memperbarui data SPBU:", err);
    sendResponse(
      res,
      500,
      false,
      "Terjadi kesalahan server",
      null,
      err.message
    );
  }
};

// DELETE
exports.deleteGasStation = async (req, res) => {
  try {
    const { id } = req.params;
    const stationId = parseInt(id);

    if (isNaN(stationId)) {
      return sendResponse(res, 400, false, "ID tidak valid");
    }

    await prisma.gasStation.delete({
      where: { id: stationId },
    });
    sendResponse(res, 200, true, "Data SPBU berhasil dihapus");
  } catch (err) {
    if (err.code === "P2025") {
      return sendResponse(res, 404, false, "SPBU tidak ditemukan");
    }
    console.error("❌ Error menghapus data SPBU:", err);
    sendResponse(
      res,
      500,
      false,
      "Terjadi kesalahan server",
      null,
      err.message
    );
  }
};
