// === IMPOR FUNGSI API (BARU) ===
import {
  checkLoginStatus as apiCheckLoginStatus,
  login as apiLogin,
  logout as apiLogout,
  getAllStations,
  createStation,
  updateStation,
  deleteStation as apiDeleteStation,
} from "./apiService.js";

// === KONFIGURASI GLOBAL ===
let map;
let userLocation = null;
let userMarker = null;
let gasStationMarkers = []; 
let routingControl = null;
let gasStations = []; 
let isAdmin = false; 
let loginModalInstance; 
let stationModalInstance; 

// === FUNGSI INISIASI APLIKASI ===

// Panggil ini saat DOM selesai dimuat
document.addEventListener("DOMContentLoaded", initApp);

function initApp() {
  // Sembunyikan loading screen
  setTimeout(() => {
    document.getElementById("loading").classList.add("hidden");
  }, 500);

  // Inisialisasi Peta Leaflet
  initMap();

  // Pasang semua event listener (termasuk login/logout)
  setupEventListeners();

  // Ambil data SPBU dari API
  fetchGasStations();

  // Cek apakah user sudah login (via cookie)
  checkLoginStatus();

  // Inisialisasi instance Modal (agar bisa di-kontrol via JS)
  loginModalInstance = new bootstrap.Modal(
    document.getElementById("loginModal")
  );
  stationModalInstance = new bootstrap.Modal(
    document.getElementById("stationModal")
  );
}

function initMap() {
  const palembangCenter = [-2.976, 104.7458];
  map = L.map("map", {
    center: palembangCenter,
    zoom: 13,
  });

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap contributors",
    maxZoom: 19,
  }).addTo(map);

  map.on("click", (e) => {
    const clickedLocation = { lat: e.latlng.lat, lng: e.latlng.lng };
    findAndShowNearestGasStation(clickedLocation);
  });
}

// === FUNGSI OTENTIKASI & ADMIN ===

// Cek status login saat halaman dimuat
async function checkLoginStatus() {
  try {
    // Panggil fungsi yang diimpor
    await apiCheckLoginStatus();
    isAdmin = true;
    updateUIForAdmin();
  } catch (error) {
    isAdmin = false;
    updateUIForGuest();
  }
}

// Tampilkan UI untuk Admin
function updateUIForAdmin() {
  document.getElementById("loginBtnLi").style.display = "none";
  document.getElementById("logoutBtnLi").style.display = "block";
  document.getElementById("createBtn").style.display = "block";
  addGasStationMarkers(); // Refresh marker untuk memunculkan tombol edit/delete
}

// Tampilkan UI untuk Tamu
function updateUIForGuest() {
  document.getElementById("loginBtnLi").style.display = "block";
  document.getElementById("logoutBtnLi").style.display = "none";
  document.getElementById("createBtn").style.display = "none";
  addGasStationMarkers(); // Refresh marker untuk menyembunyikan tombol
}

// === PENGATURAN EVENT LISTENERS ===

function setupEventListeners() {
  // Tombol Lokasi Saya
  document.getElementById("myLocationBtn").addEventListener("click", () => {
    requestUserLocation();
  });

  // Tombol Refresh Peta
  document.getElementById("refreshBtn").addEventListener("click", () => {
    clearRoute();
    fetchGasStations(); // Ambil ulang data dari API
    updateLocationStatus("Memperbarui data pom bensin...", "loading");
  });

  // Tombol Tutup Info Panel
  document.getElementById("closeInfo").addEventListener("click", () => {
    clearRoute();
    resetInfoPanel();
  });

  // --- Event Listener Admin & Auth ---

  // Form Login
  document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;
    const errorDiv = document.getElementById("loginError");
    errorDiv.style.display = "none"; // Sembunyikan error lama

    try {
      // Panggil fungsi yang diimpor
      await apiLogin(email, password);

      isAdmin = true;
      updateUIForAdmin();
      loginModalInstance.hide(); // Tutup modal
      document.getElementById("loginForm").reset();
    } catch (err) {
      errorDiv.textContent = err.message; // Tampilkan pesan error dari API
      errorDiv.style.display = "block";
    }
  });

  // Tombol Logout
  document.getElementById("logoutBtn").addEventListener("click", async () => {
    try {
      // Panggil fungsi yang diimpor
      await apiLogout();
    } catch (error) {
      console.error("Logout error:", error.message);
    } finally {
      isAdmin = false;
      updateUIForGuest();
      resetInfoPanel();
      clearRoute();
    }
  });

  // Tombol "Tambah SPBU"
  document.getElementById("createBtn").addEventListener("click", () => {
    document.getElementById("stationForm").reset();
    document.getElementById("stationId").value = ""; // Kosongkan ID
    document.getElementById("stationModalTitle").textContent =
      "Tambah SPBU Baru";
    document.getElementById("stationError").style.display = "none";
    stationModalInstance.show();
  });

  // Form SPBU (untuk Create & Update)
  document
    .getElementById("stationForm")
    .addEventListener("submit", handleStationFormSubmit);
}

// === FUNGSI FETCH DATA & API (CRUD) ===

// Mengambil data SPBU dari Backend
async function fetchGasStations() {
  try {
    // Panggil fungsi yang diimpor
    const response = await getAllStations();
    gasStations = response.data; // Ambil array dari properti 'data'

    addGasStationMarkers(); // Gambar ulang marker
    updateLocationStatus(
      response.message || "Data SPBU berhasil dimuat",
      "success"
    );
  } catch (error) {
    console.error("Gagal fetch SPBU:", error);
    updateLocationStatus(error.message, "error");
  }
}

// Meng-handle submit form SPBU (Create atau Update)
async function handleStationFormSubmit(e) {
  e.preventDefault();
  const stationId = document.getElementById("stationId").value;
  const errorDiv = document.getElementById("stationError");
  errorDiv.style.display = "none";

  const stationData = {
    name: document.getElementById("stationNameInput").value,
    lat: parseFloat(document.getElementById("stationLat").value),
    lng: parseFloat(document.getElementById("stationLng").value),
    address: document.getElementById("stationAddress").value,
    mapsUrl: document.getElementById("stationMapsUrl").value,
    facilities: document
      .getElementById("stationFacilities")
      .value.split(",")
      .map((f) => f.trim())
      .filter((f) => f),
  };

  const isCreating = !stationId;

  try {
    // Panggil fungsi yang diimpor
    const response = isCreating
      ? await createStation(stationData)
      : await updateStation(stationId, stationData);

    stationModalInstance.hide();
    fetchGasStations(); // Ambil ulang data
    resetInfoPanel();
    alert(response.message || "Data berhasil disimpan");
  } catch (err) {
    errorDiv.textContent = err.message;
    errorDiv.style.display = "block";
  }
}

// Membuka modal Edit
async function showEditModal(id) {
  const station = gasStations.find((s) => s.id === id);
  if (!station) {
    alert("Data SPBU tidak ditemukan");
    return;
  }

  document.getElementById("stationForm").reset();
  document.getElementById("stationId").value = station.id;
  document.getElementById("stationNameInput").value = station.name;
  document.getElementById("stationLat").value = station.lat;
  document.getElementById("stationLng").value = station.lng;
  document.getElementById("stationAddress").value = station.address;
  document.getElementById("stationMapsUrl").value = station.mapsUrl;
  document.getElementById("stationFacilities").value = (
    station.facilities || []
  ).join(", ");

  document.getElementById("stationModalTitle").textContent = "Edit SPBU";
  document.getElementById("stationError").style.display = "none";
  stationModalInstance.show();
}

// Menghapus SPBU
async function deleteStation(id) {
  if (!confirm("Anda yakin ingin menghapus SPBU ini?")) {
    return;
  }

  try {
    // Panggil fungsi yang diimpor
    const response = await apiDeleteStation(id);

    alert(response.message || "SPBU berhasil dihapus");
    fetchGasStations(); // Ambil ulang data
    resetInfoPanel();
  } catch (err) {
    alert(err.message || "Gagal menghapus SPBU");
  }
}

// === FUNTUK FUNGSI showGasStationInfo, KITA PERLU BUAT FUNGSI ADMIN GLOBAL ===
// Ini agar HTML string bisa memanggilnya
window.showEditModal = showEditModal;
window.deleteStation = deleteStation;

// === FUNGSI MAP & MARKER ===

function addGasStationMarkers() {
  gasStationMarkers.forEach((marker) => map.removeLayer(marker));
  gasStationMarkers = [];

  const gasStationIcon = L.divIcon({
    className: "gas-station-marker",
    html: '<div style="background-color: #fbbf24; width: 30px; height: 30px; border-radius: 50%; border: 3px solid #dc2626; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 6px rgba(0,0,0,0.3);"><i class="fas fa-gas-pump" style="color: #dc2626; font-size: 14px;"></i></div>',
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });

  gasStations.forEach((station) => {
    const marker = L.marker([station.lat, station.lng], {
      icon: gasStationIcon,
    }).addTo(map);

    marker.on("click", () => {
      showGasStationInfo(station);
    });

    gasStationMarkers.push(marker);
  });
}

function showGasStationInfo(station) {
  const distance = userLocation
    ? calculateDistance(userLocation, { lat: station.lat, lng: station.lng })
    : null;

  document.getElementById("stationName").textContent = station.name;
  const infoContent = document.getElementById("infoContent");

  infoContent.innerHTML = `
    <div class="station-details d-grid gap-2">
        <div class="detail-item d-flex align-items-center gap-2 p-2 bg-light rounded">
            <i class="fas fa-map-marker-alt text-danger" style="width: 20px;"></i>
            <span><strong>Alamat:</strong> ${station.address}</span>
        </div>
        <div class="detail-item d-flex align-items-center gap-2 p-2 bg-light rounded">
            <i class="fas fa-gas-pump text-danger" style="width: 20px;"></i>
            <span><strong>Fasilitas:</strong> ${(station.facilities || []).join(
              ", "
            )}</span>
        </div>
        ${
          distance
            ? `
            <div class="detail-item d-flex align-items-center gap-2 p-2 bg-light rounded" id="route-distance-info">
                <i class="fas fa-route text-danger" style="width: 20px;"></i>
                <span><strong>Jarak (Lurus):</strong> ${distance.toFixed(
                  1
                )} km</span>
            </div>
        `
            : ""
        }
        <div class="detail-item d-flex align-items-center gap-2 p-2 bg-light rounded">
            <i class="fab fa-google text-danger" style="width: 20px;"></i>
            <span><a href="${
              station.mapsUrl
            }" target="_blank">Lihat di Google Maps</a></span>
        </div>
    </div>
    
    ${
      userLocation
        ? `
        <button class="btn btn-danger w-100 mt-3 d-flex align-items-center justify-content-center gap-2" onclick="showRoute(${station.lat}, ${station.lng}, '${station.name}')">
            <i class="fas fa-directions"></i> Tampilkan Rute
        </button>
    `
        : `
        <button class="btn btn-secondary w-100 mt-3" disabled>
            <i class="fas fa-location-slash"></i> Aktifkan lokasi untuk rute
        </button>
    `
    }

    ${
      isAdmin
        ? `
      <hr>
      <div class="admin-controls d-flex justify-content-center gap-2 mt-2">
          <button class="btn btn-warning" onclick="showEditModal(${station.id})">
              <i class="fas fa-edit"></i> Edit
          </button>
          <button class="btn btn-danger" onclick="deleteStation(${station.id})">
              <i class="fas fa-trash"></i> Hapus
          </button>
      </div>
    `
        : ""
    }
  `;
}

function resetInfoPanel() {
  document.getElementById("stationName").textContent = "Pilih Pom Bensin";
  document.getElementById("infoContent").innerHTML = `
    <p class="text-muted fst-italic text-center">
      Klik marker pom bensin di peta untuk melihat informasi detail
    </p>
  `;
}

// === FUNGSI NAVIGASI & LOKASI ===

function requestUserLocation() {
  updateLocationStatus("Mengakses lokasi Anda...", "loading");
  if (!navigator.geolocation) {
    return updateLocationStatus("Geolokasi tidak didukung", "error");
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      userLocation = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };
      addUserMarker();
      map.flyTo([userLocation.lat, userLocation.lng], 15);
      updateLocationStatus(
        "Lokasi ditemukan, mencari SPBU terdekat...",
        "success"
      );
      findNearestGasStationsAndShowRoute();
    },
    (error) => {
      updateLocationStatus(
        "Gagal mengakses lokasi. Izinkan di browser.",
        "error"
      );
    }
  );
}

function addUserMarker() {
  if (userMarker) map.removeLayer(userMarker);
  const userIcon = L.divIcon({
    className: "user-marker",
    html: '<div style="background-color: #dc2626; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
    iconSize: [20, 20],
  });
  userMarker = L.marker([userLocation.lat, userLocation.lng], {
    icon: userIcon,
  }).addTo(map);
  userMarker.bindPopup("<b>Lokasi Anda</b>").openPopup();
}

// Perlu dibuat global agar bisa dipanggil dari HTML
window.showRoute = function (lat, lng, stationName) {
  if (!userLocation) return;
  clearRoute();

  routingControl = L.Routing.control({
    waypoints: [
      L.latLng(userLocation.lat, userLocation.lng),
      L.latLng(lat, lng),
    ],
    routeWhileDragging: false,
    addWaypoints: false,
    createMarker: () => null,
    lineOptions: { styles: [{ color: "#dc2626", weight: 4, opacity: 0.8 }] },
    show: false,
  }).addTo(map);

  routingControl.on("routesfound", (e) => {
    const summary = e.routes[0].summary;
    const distance = (summary.totalDistance / 1000).toFixed(1);
    const time = Math.round(summary.totalTime / 60);
    updateLocationStatus(
      `Rute ke ${stationName}: ${distance} km (~${time} mnt)`,
      "success"
    );

    const distInfo = document.getElementById("route-distance-info");
    if (distInfo) {
      distInfo.innerHTML = `
        <i class="fas fa-route text-danger" style="width: 20px;"></i>
        <span><strong>Jarak (Rute):</strong> ${distance} km (~${time} mnt)</span>
      `;
    }
  });
};

function clearRoute() {
  if (routingControl) {
    map.removeControl(routingControl);
    routingControl = null;
    updateLocationStatus("Pilih SPBU untuk melihat rute", "success");
  }
}

function findNearestGasStationsAndShowRoute() {
  if (!userLocation) return;
  const nearest = findNearestGasStations();
  if (nearest) {
    showGasStationInfo(nearest);
    window.showRoute(nearest.lat, nearest.lng, nearest.name);
  }
}

function findAndShowNearestGasStation(clickedLocation) {
  const nearest = findNearestGasStations(clickedLocation);
  if (nearest) {
    showGasStationInfo(nearest);
    if (userLocation) {
      window.showRoute(nearest.lat, nearest.lng, nearest.name);
    }
  }
}

// === FUNGSI UTILITAS ===

function calculateDistance(pos1, pos2) {
  const R = 6371;
  const dLat = ((pos2.lat - pos1.lat) * Math.PI) / 180;
  const dLng = ((pos2.lng - pos1.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((pos1.lat * Math.PI) / 180) *
      Math.cos((pos2.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function findNearestGasStations(origin) {
  const searchOrigin = origin || userLocation;
  if (!searchOrigin || gasStations.length === 0) return null;

  return gasStations
    .map((station) => ({
      ...station,
      distance: calculateDistance(searchOrigin, {
        lat: station.lat,
        lng: station.lng,
      }),
    }))
    .sort((a, b) => a.distance - b.distance)[0];
}

function updateLocationStatus(message, type = "loading") {
  const statusElement = document.getElementById("locationStatus");
  const statusText = document.getElementById("statusText");
  statusElement.classList.remove(
    "alert-secondary",
    "alert-success",
    "alert-danger"
  );
  if (type === "success") statusElement.classList.add("alert-success");
  else if (type === "error") statusElement.classList.add("alert-danger");
  else statusElement.classList.add("alert-secondary");
  statusText.textContent = message;
}
