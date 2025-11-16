const express = require("express");
const router = express.Router();

//import controller dan middleware
const {
  getAllGasStations,
  getGasStationById,
  createGasStation,
  updateGasStation,
  deleteGasStation,
} = require("../controllers/gasStationController");
const { protect, isAdmin } = require("../middleware/authMiddleware");

// --- Rute Publik ---
router.get("/", getAllGasStations);
router.get("/:id", getGasStationById);

// --- Rute Admin (Terproteksi) ---
router.post("/", protect, isAdmin, createGasStation);
router.patch("/:id", protect, isAdmin, updateGasStation);
router.delete("/:id", protect, isAdmin, deleteGasStation);

module.exports = router;
