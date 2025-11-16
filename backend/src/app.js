const express = require("express");
const cookieParser = require('cookie-parser');
const cors = require('cors');
const gasStationRoutes = require("./routes/gasStationRoutes");
const authRoutes = require("./routes/authRoutes");
const sendResponse = require("./utils/response");

const app = express();
app.use(express.json());
app.use(cookieParser());

// --- 2. GUNAKAN CORS SEBELUM RUTE ---
// Ini mengizinkan frontend di 8080 untuk mengirim 
// request DAN cookie ke backend
app.use(cors({
  origin: 'http://127.0.0.1:5500', // Alamat frontend Anda
  credentials: true 
}));

app.use("/api/gas-stations", gasStationRoutes);
app.use('/api/auth', authRoutes);

app.use((req, res) => {
  sendResponse(res, 404, false, "Endpoint tidak ditemukan");
});

app.use((err, req, res, next) => {
  console.error("💥 Unhandled Error:", err);
  sendResponse(
    res,
    500,
    false,
    "Terjadi kesalahan internal server",
    null,
    err.message
  );
});

module.exports = app;
