const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");
const sendResponse = require("../utils/response");

const prisma = new PrismaClient();

exports.protect = async (req, res, next) => {
  let token; 
  
  // 1. Cek di Authorization Header (untuk Postman/Aplikasi Mobile)
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } 
  // 2. Cek di Cookie (untuk Browser Web)
  else if (req.cookies.token) {
    token = req.cookies.token;
  } 
  // 3. Jika tidak ada token sama sekali
  if (!token) {
    return sendResponse(res, 401, false, "Akses ditolak, tidak ada token");
  } 
  
  // 4. Jika token ditemukan (dari Header atau Cookie), verifikasi
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Cari user berdasarkan ID di token

    req.user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, role: true },
    });

    if (!req.user) {
      return sendResponse(
        res,
        401,
        false,
        "Token tidak valid, user tidak ditemukan"
      );
    } // Sukses, lanjut ke controller berikutnya (logout)

    next();
  } catch (err) {
    console.error("❌ Error verifikasi token:", err);
    return sendResponse(res, 401, false, "Token tidak valid atau kedaluwarsa");
  }
};

// Middleware isAdmin (tidak berubah)
exports.isAdmin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    return sendResponse(
      res,
      403,
      false,
      "Akses ditolak, rute ini hanya untuk admin"
    );
  }
};
