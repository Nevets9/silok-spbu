const { PrismaClient } = require("@prisma/client");
const sendResponse = require("../utils/response");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const prisma = new PrismaClient();

// Fungsi untuk mendaftarkan user
exports.register = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return sendResponse(
        res,
        400,
        false,
        "Email, password, dan role tidak boleh kosong"
      );
    }

    // Cek jika email sudah terdaftar
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return sendResponse(res, 409, false, "Email sudah terdaftar");
    } // Hash password

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role, // 'admin' atau 'user'
      },
    });

    // Hapus password dari response
    delete user.password;
    sendResponse(res, 201, true, "User berhasil dibuat", user);
  } catch (err) {
    console.error("❌ Error saat register:", err);
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

// Fungsi Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendResponse(
        res,
        400,
        false,
        "Email dan password tidak boleh kosong"
      );
    }

    // 1. Cari user
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return sendResponse(res, 401, false, "Email atau password salah");
    }

    // 2. Cek password
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return sendResponse(res, 401, false, "Email atau password salah");
    }

    // 3. Cek role (opsional, tapi bagus jika login admin terpisah)
    if (user.role !== "admin") {
      return sendResponse(res, 403, false, "Akses ditolak. Hanya untuk admin.");
    }

    // 4. Buat Token JWT
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    /* Simpan di HttpOnly Cookie (Lebih Aman)*/
    res.cookie("token", token, {
      httpOnly: true, // Mencegah XSS
      secure: process.env.NODE_ENV === "production", // Hanya HTTPS di produksi
      maxAge: 24 * 60 * 60 * 1000, // 1 hari
    });
    sendResponse(res, 200, true, "Login berhasil");
  } catch (err) {
    console.error("❌ Error saat login:", err);
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

exports.logout = (req, res) => {
  try {
    // Mengirim cookie 'token' dengan isi kosong dan waktu kedaluwarsa di masa lalu
    res.cookie("token", "", {
      httpOnly: true,
      expires: new Date(0), // Set kedaluwarsa ke masa lalu
      secure: process.env.NODE_ENV === "production",
    });
    sendResponse(res, 200, true, "Logout berhasil");
  } catch (err) {
    console.error("❌ Error saat logout:", err);
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

exports.getMe = async (req, res) => {
  // req.user sudah dilampirkan oleh middleware 'protect'
  if (!req.user) {
    return sendResponse(res, 404, false, "User tidak ditemukan");
  }
  sendResponse(res, 200, true, "Data user diambil", req.user);
};
