// File: apiService.js

/**
 * Fungsi helper untuk menangani respons fetch.
 */
async function handleResponse(response) {
  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || "Terjadi kesalahan pada server");
  }
  return data;
}

// --- Fungsi Auth ---
export async function checkLoginStatus() {
  return fetch("http://127.0.0.1:3000/api/auth/me", {
    // <-- UBAH INI
    credentials: "include",
  }).then(handleResponse);
}

export async function login(email, password) {
  return fetch("http://127.0.0.1:3000/api/auth/login", {
    // <-- UBAH INI
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
    credentials: "include",
  }).then(handleResponse);
}

export async function logout() {
  return fetch("http://127.0.0.1:3000/api/auth/logout", {
    // <-- UBAH INI
    method: "POST",
    credentials: "include",
  }).then(handleResponse);
}

// --- Fungsi Gas Station (CRUD) ---
export async function getAllStations() {
  return fetch("http://127.0.0.1:3000/api/gas-stations").then(handleResponse); // <-- UBAH INI
}

export async function createStation(stationData) {
  return fetch("http://127.0.0.1:3000/api/gas-stations", {
    // <-- UBAH INI
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(stationData),
    credentials: "include",
  }).then(handleResponse);
}

export async function updateStation(id, stationData) {
  return fetch(`http://127.0.0.1:3000/api/gas-stations/${id}`, {
    // <-- UBAH INI
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(stationData),
    credentials: "include",
  }).then(handleResponse);
}

export async function deleteStation(id) {
  return fetch(`http://127.0.0.1:3000/api/gas-stations/${id}`, {
    // <-- UBAH INI
    method: "DELETE",
    credentials: "include",
  }).then(handleResponse);
}
