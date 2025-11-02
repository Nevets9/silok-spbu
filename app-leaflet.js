// Global variables for Leaflet map
let map;
let userLocation = null;
let userMarker = null;
let gasStationMarkers = [];
let routingControl = null;
let currentRouteInfo = null; // Store current route information
let persistentStatus = null; // Store persistent status message

// Gas stations data for Palembang area
const gasStations = [
  {
    id: 1,
    name: "SPBU Pertamina Demang Lebar Daun",
    lat: -2.976,
    lng: 104.7458,
    address: "Jl. Demang Lebar Daun, Talang Kelapa, Palembang",
    brand: "Pertamina",
    facilities: ["ATM", "Minimarket", "Toilet", "Musholla"],
  },
  {
    id: 2,
    name: "SPBU Pertamina Sudirman",
    lat: -2.9889,
    lng: 104.7563,
    address: "Jl. Jend. Sudirman, Kemas Rindo, Palembang",
    brand: "Pertamina",
    facilities: ["ATM", "Minimarket", "Toilet", "Car Wash"],
  },
  {
    id: 3,
    name: "SPBU Pertamina Srijaya",
    lat: -2.9442,
    lng: 104.7292,
    address: "Jl. Srijaya, Bukit Lama, Palembang",
    brand: "Pertamina",
    facilities: ["Minimarket", "Toilet", "Musholla"],
  },
  {
    id: 4,
    name: "SPBU Pertamina Veteran",
    lat: -2.9667,
    lng: 104.7417,
    address: "Jl. Veteran, Kemuning, Palembang",
    brand: "Pertamina",
    facilities: ["ATM", "Minimarket", "Toilet", "Car Wash", "Musholla"],
  },
  {
    id: 5,
    name: "SPBU Pertamina Angkatan 45",
    lat: -2.9778,
    lng: 104.7611,
    address: "Jl. Angkatan 45, Lorok Pakjo, Palembang",
    brand: "Pertamina",
    facilities: ["ATM", "Minimarket", "Toilet"],
  },
  {
    id: 6,
    name: "SPBU Pertamina Kenten",
    lat: -2.9389,
    lng: 104.7556,
    address: "Jl. Kol. H. Burlian, Kenten, Palembang",
    brand: "Pertamina",
    facilities: ["ATM", "Minimarket", "Toilet", "Musholla", "Car Wash"],
  },
  {
    id: 7,
    name: "SPBU Pertamina Pakjo",
    lat: -2.9833,
    lng: 104.7639,
    address: "Jl. Pakjo, Lorok Pakjo, Palembang",
    brand: "Pertamina",
    facilities: ["Minimarket", "Toilet", "ATM"],
  },
  {
    id: 8,
    name: "SPBU Pertamina Plaju",
    lat: -2.9944,
    lng: 104.775,
    address: "Jl. Mayor Ruslan, Plaju Darat, Palembang",
    brand: "Pertamina",
    facilities: ["ATM", "Minimarket", "Toilet", "Musholla"],
  },
  {
    id: 9,
    name: "SPBU Pertamina Sekip Jaya",
    lat: -2.9556,
    lng: 104.7333,
    address: "Jl. Sekip Jaya, Kemuning, Palembang",
    brand: "Pertamina",
    facilities: ["Minimarket", "Toilet", "Car Wash"],
  },
  {
    id: 10,
    name: "SPBU Pertamina Radial",
    lat: -2.9722,
    lng: 104.75,
    address: "Jl. Radial, 15 Ulu, Palembang",
    brand: "Pertamina",
    facilities: ["ATM", "Minimarket", "Toilet", "Musholla", "Car Wash"],
  },
  {
    id: 11,
    name: "SPBU Pertamina Indralaya",
    lat: -3.2241,
    lng: 104.6483,
    address: "Jl. Lintas Timur Sumatera, Indralaya, Ogan Ilir",
    brand: "Pertamina",
    facilities: ["ATM", "Minimarket", "Toilet", "Musholla"],
  },
  {
    id: 12,
    name: "SPBU Pertamina Tanjung Raja",
    lat: -3.3647,
    lng: 104.6125,
    address: "Jl. Raya Lintas Timur, Tanjung Raja, Ogan Ilir",
    brand: "Pertamina",
    facilities: ["Minimarket", "Toilet", "Musholla"],
  },
  {
    id: 13,
    name: "SPBU Pertamina Pemulutan",
    lat: -3.092,
    lng: 104.669,
    address: "Jl. Palembang – Indralaya, Pemulutan, Ogan Ilir",
    brand: "Pertamina",
    facilities: ["ATM", "Toilet", "Musholla", "Car Wash"],
  },
  {
    id: 14,
    name: "SPBU Pertamina Muara Penimbung",
    lat: -3.155,
    lng: 104.682,
    address: "Jl. Raya Muara Penimbung, Ogan Ilir",
    brand: "Pertamina",
    facilities: ["Toilet", "Musholla"],
  },
  {
    id: 15,
    name: "SPBU Pertamina Sungai Pinang",
    lat: -3.285,
    lng: 104.72,
    address: "Jl. Raya Sungai Pinang, Ogan Ilir",
    brand: "Pertamina",
    facilities: ["ATM", "Minimarket", "Toilet"],
  },
];

// Initialize the application
function initApp() {
  // Hide loading screen after a short delay
  setTimeout(() => {
    document.getElementById("loading").classList.add("hidden");
  }, 1000);

  // Set up event listeners
  setupEventListeners();

  // Try to request user location on startup, but don't force it
  setTimeout(() => {
    // Check if geolocation is available and page is secure
    if (
      navigator.geolocation &&
      (location.protocol === "https:" ||
        location.hostname === "localhost" ||
        location.hostname === "127.0.0.1")
    ) {
      requestUserLocation();
    } else {
      updateLocationStatus(
        "Klik tombol lokasi atau klik di peta untuk mencari pom bensin",
        "success"
      );
    }
  }, 1500);
}

// Initialize Leaflet Map
function initMap() {
  // Default center on Palembang
  const palembangCenter = [-2.976, 104.7458];

  // Create map with enhanced interaction options
  map = L.map("map", {
    center: palembangCenter,
    zoom: 13,
    zoomControl: true,
    dragging: true,
    touchZoom: true,
    doubleClickZoom: true,
    scrollWheelZoom: true,
    boxZoom: true,
    keyboard: true,
    zoomAnimation: true,
    zoomAnimationThreshold: 4,
    fadeAnimation: true,
    markerZoomAnimation: true,
    inertia: true,
    inertiaDeceleration: 3000,
    inertiaMaxSpeed: Infinity,
    easeLinearity: 0.2,
    worldCopyJump: false,
    maxBoundsViscosity: 0.0,
  });

  // Add OpenStreetMap tiles with better performance
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap contributors",
    maxZoom: 19,
    minZoom: 10,
    updateWhenIdle: false,
    updateWhenZooming: false,
    keepBuffer: 2,
  }).addTo(map);

  // Add enhanced map event listeners
  map.on("click", (e) => {
    const clickedLocation = {
      lat: e.latlng.lat,
      lng: e.latlng.lng,
    };
    findAndShowNearestGasStation(clickedLocation);
  });

  // Add drag event handlers - keep persistent status
  map.on("dragstart", () => {
    if (!persistentStatus) {
      updateLocationStatus("Menggeser peta...", "loading");
    }
  });

  map.on("dragend", () => {
    if (persistentStatus) {
      updateLocationStatus(persistentStatus.message, persistentStatus.type);
    } else {
      updateLocationStatus(
        "Klik di peta untuk mencari pom bensin terdekat",
        "success"
      );
    }
  });

  // Add zoom event handlers - keep persistent status
  map.on("zoomstart", () => {
    if (!persistentStatus) {
      updateLocationStatus("Memperbesar/memperkecil peta...", "loading");
    }
  });

  map.on("zoomend", () => {
    if (persistentStatus) {
      updateLocationStatus(persistentStatus.message, persistentStatus.type);
    } else {
      const zoomLevel = map.getZoom();
      if (zoomLevel < 12) {
        updateLocationStatus(
          "Perbesar peta untuk melihat detail pom bensin",
          "loading"
        );
      } else {
        updateLocationStatus(
          "Klik di peta untuk mencari pom bensin terdekat",
          "success"
        );
      }
    }
  });

  // Add move event for boundary checking - preserve persistent status
  map.on("moveend", () => {
    if (persistentStatus) {
      updateLocationStatus(persistentStatus.message, persistentStatus.type);
    } else {
      // Check if user moved far from original location
      const center = map.getCenter();
      const palembangBounds = L.latLngBounds(
        [-3.1, 104.5], // Southwest
        [-2.8, 104.9] // Northeast
      );

      if (!palembangBounds.contains(center)) {
        updateLocationStatus("Anda berada di luar area Palembang", "error");
      }
    }
  });

  // Add gas station markers
  addGasStationMarkers();

  // Initialize the app
  initApp();
}

// Set up event listeners
function setupEventListeners() {
  // My location button with smooth animation
  document.getElementById("myLocationBtn").addEventListener("click", () => {
    if (userLocation) {
      map.flyTo([userLocation.lat, userLocation.lng], 15, {
        animate: true,
        duration: 1.5,
      });
      updateLocationStatus("Menuju ke lokasi Anda...", "loading");
      setTimeout(() => {
        updateLocationStatus("Lokasi Anda saat ini", "success");
      }, 1500);
    } else {
      requestUserLocation();
    }
  });

  // Refresh button with enhanced feedback
  document.getElementById("refreshBtn").addEventListener("click", () => {
    clearRoute();
    addGasStationMarkers();
    updateLocationStatus("Memperbarui data pom bensin...", "loading");

    // Add visual feedback
    const refreshBtn = document.getElementById("refreshBtn");
    refreshBtn.style.transform = "rotate(360deg)";
    refreshBtn.style.transition = "transform 0.5s ease";

    setTimeout(() => {
      updateLocationStatus("Data pom bensin berhasil diperbarui", "success");
      refreshBtn.style.transform = "rotate(0deg)";
    }, 1000);
  });

  // Close info panel button
  document.getElementById("closeInfo").addEventListener("click", () => {
    clearRoute();
    resetInfoPanel();
  });

  // Add keyboard shortcuts for map navigation
  document.addEventListener("keydown", (e) => {
    if (
      e.target.tagName.toLowerCase() !== "input" &&
      e.target.tagName.toLowerCase() !== "textarea"
    ) {
      switch (e.key) {
        case "+":
        case "=":
          map.zoomIn();
          break;
        case "-":
          map.zoomOut();
          break;
        case "r":
        case "R":
          if (userLocation) {
            map.flyTo([userLocation.lat, userLocation.lng], 14, {
              animate: true,
              duration: 1,
            });
          }
          break;
        case "Escape":
          clearRoute();
          resetInfoPanel();
          break;
      }
    }
  });
}

// Request user location
function requestUserLocation() {
  updateLocationStatus("Mengakses lokasi Anda...", "loading");

  // Check if geolocation is supported
  if (!navigator.geolocation) {
    updateLocationStatus("Geolokasi tidak didukung oleh browser ini", "error");
    showLocationHelp();
    return;
  }

  // Check if page is served over HTTPS or localhost
  const isSecure =
    location.protocol === "https:" ||
    location.hostname === "localhost" ||
    location.hostname === "127.0.0.1";

  if (!isSecure) {
    updateLocationStatus("Geolokasi memerlukan HTTPS atau localhost", "error");
    showLocationHelp();
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      userLocation = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };

      console.log("Location found:", userLocation);

      // Add user marker with popup
      addUserMarker();

      // Center map on user location with smooth animation
      map.flyTo([userLocation.lat, userLocation.lng], 15, {
        animate: true,
        duration: 2,
      });

      updateLocationStatus(
        "Lokasi berhasil ditemukan, mencari pom bensin terdekat...",
        "success"
      );

      // Show welcome message
      setTimeout(() => {
        updateLocationStatus(
          "Menampilkan rute ke pom bensin terdekat...",
          "loading"
        );
      }, 1000);

      // Find nearest gas stations and automatically show route
      findNearestGasStationsAndShowRoute();
    },
    (error) => {
      console.error("Geolocation error:", error);
      let errorMessage = "Gagal mengakses lokasi";
      let helpNeeded = true;

      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMessage =
            "Akses lokasi ditolak. Klik ikon lokasi di browser untuk mengizinkan.";
          break;
        case error.POSITION_UNAVAILABLE:
          errorMessage = "Informasi lokasi tidak tersedia. Pastikan GPS aktif.";
          break;
        case error.TIMEOUT:
          errorMessage = "Waktu permintaan lokasi habis. Coba lagi.";
          break;
        default:
          errorMessage = "Error tidak dikenal: " + error.message;
      }

      updateLocationStatus(errorMessage, "error");
      if (helpNeeded) {
        showLocationHelp();
      }
    },
    {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 60000,
    }
  );
}

// Show location help instructions
function showLocationHelp() {
  const infoContent = document.getElementById("infoContent");
  infoContent.innerHTML = `
        <div class="location-help">
            <h4 style="color: #dc2626; margin-bottom: 1rem;">
                <i class="fas fa-exclamation-triangle"></i> Bantuan Akses Lokasi
            </h4>
            <div class="help-steps">
                <p><strong>1. Izinkan Akses Lokasi:</strong></p>
                <ul style="margin-left: 1rem; margin-bottom: 1rem;">
                    <li>Klik ikon 🔒 atau 🌐 di address bar browser</li>
                    <li>Pilih "Allow" atau "Izinkan" untuk Location</li>
                    <li>Refresh halaman setelah mengizinkan</li>
                </ul>
                
                <p><strong>2. Pastikan GPS Aktif:</strong></p>
                <ul style="margin-left: 1rem; margin-bottom: 1rem;">
                    <li>Aktifkan Location Services di perangkat</li>
                    <li>Pastikan browser memiliki akses lokasi</li>
                </ul>
                
                <p><strong>3. Alternatif:</strong></p>
                <ul style="margin-left: 1rem;">
                    <li>Klik di peta untuk mencari pom bensin terdekat</li>
                    <li>Gunakan tombol refresh untuk coba lagi</li>
                </ul>
            </div>
            <button class="route-btn" onclick="requestUserLocation()" style="margin-top: 1rem;">
                <i class="fas fa-redo"></i> Coba Akses Lokasi Lagi
            </button>
        </div>
    `;

  document.getElementById("stationName").textContent = "Bantuan Akses Lokasi";
}

// Add user location marker
function addUserMarker() {
  if (userMarker) {
    map.removeLayer(userMarker);
  }

  // Create custom user icon
  const userIcon = L.divIcon({
    className: "user-marker",
    html: '<div style="background-color: #dc2626; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });

  userMarker = L.marker([userLocation.lat, userLocation.lng], {
    icon: userIcon,
  }).addTo(map);

  userMarker
    .bindPopup(
      `
        <div style="text-align: center; font-weight: bold; color: #dc2626;">
            📍 Lokasi Anda<br>
            <small style="color: #666;">Mencari pom bensin terdekat...</small>
        </div>
    `
    )
    .openPopup();
}

// Add gas station markers
function addGasStationMarkers() {
  // Clear existing markers
  gasStationMarkers.forEach((marker) => map.removeLayer(marker));
  gasStationMarkers = [];

  // Create custom gas station icon
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

    marker.bindPopup(`<strong>${station.name}</strong><br>${station.address}`);

    marker.on("click", () => {
      showGasStationInfo(station);
    });

    gasStationMarkers.push(marker);
  });
}

// Show gas station information
function showGasStationInfo(station) {
  const distance = userLocation
    ? calculateDistance(userLocation, { lat: station.lat, lng: station.lng })
    : null;
  const travelTime = distance ? calculateTravelTime(distance) : null;

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
                <span><strong>Brand:</strong> ${station.brand}</span>
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
            ${
              travelTime
                ? `
                <div class="detail-item d-flex align-items-center gap-2 p-2 bg-light rounded" id="route-time-info">
                    <i class="fas fa-clock text-danger" style="width: 20px;"></i>
                    <span><strong>Estimasi Waktu:</strong> ~${travelTime} menit</span>
                </div>
            `
                : ""
            }
            <div class="detail-item d-flex align-items-center gap-2 p-2 bg-light rounded">
                <i class="fas fa-cogs text-danger" style="width: 20px;"></i>
                <span><strong>Fasilitas:</strong> ${station.facilities.join(
                  ", "
                )}</span>
            </div>
        </div>
        ${
          userLocation
            ? `
            <button class="btn btn-danger w-100 mt-3 d-flex align-items-center justify-content-center gap-2" onclick="showRoute(${station.lat}, ${station.lng}, '${station.name}')">
                <i class="fas fa-directions"></i>
                Tampilkan Rute
            </button>
        `
            : `
            <button class="btn btn-secondary w-100 mt-3 d-flex align-items-center justify-content-center gap-2" disabled>
                <i class="fas fa-location-slash"></i>
                Lokasi diperlukan untuk rute
            </button>
        `
        }
    `;

  // Add animation
  document.getElementById("infoPanel").classList.add("slide-up");
}

// Show route to gas station
function showRoute(lat, lng, stationName, origin = null) {
  const routeOrigin = origin || userLocation;

  if (!routeOrigin) {
    alert("Lokasi diperlukan untuk menampilkan rute");
    return;
  }

  // Clear existing route
  clearRoute();

  // Create routing control
  routingControl = L.Routing.control({
    waypoints: [L.latLng(routeOrigin.lat, routeOrigin.lng), L.latLng(lat, lng)],
    routeWhileDragging: false,
    addWaypoints: false,
    createMarker: function () {
      return null;
    }, // Don't create default markers
    lineOptions: {
      styles: [{ color: "#dc2626", weight: 4, opacity: 0.8 }],
    },
    show: false, // Hide the instruction panel
    collapsible: true,
  }).addTo(map);

  // Update route button
  const routeBtn = document.querySelector(".route-btn");
  if (routeBtn) {
    routeBtn.innerHTML = `
            <i class="fas fa-eye-slash"></i>
            Sembunyikan Rute
        `;
    routeBtn.onclick = () => clearRoute();
  }

  // Get route info and make it persistent
  routingControl.on("routesfound", function (e) {
    const routes = e.routes;
    const summary = routes[0].summary;
    const distance = (summary.totalDistance / 1000).toFixed(1);
    const time = Math.round(summary.totalTime / 60);

    const routeMessage = `Rute ke ${stationName}: ${distance} km, ${time} menit`;

    updateLocationStatus(routeMessage, "success");

    // Dapatkan elemen panel info berdasarkan ID yang tadi dibuat
    const distanceElement = document.getElementById("route-distance-info");
    const timeElement = document.getElementById("route-time-info");

    // Update panel info dengan data rute yang akurat
    if (distanceElement) {
      distanceElement.innerHTML = `
                <i class="fas fa-route"></i>
                <span><strong>Jarak (Rute):</strong> ${distance} km</span>
            `;
    }
    if (timeElement) {
      timeElement.innerHTML = `
                <i class="fas fa-clock"></i>
                <span><strong>Waktu Tempuh:</strong> ~${time} menit</span>
            `;
    }
  });
}

// Clear route
function clearRoute() {
  if (routingControl) {
    map.removeControl(routingControl);
    routingControl = null;
  }

  // Clear persistent status and route info
  currentRouteInfo = null;
  persistentStatus = null;

  // Reset route button if exists
  const routeBtn = document.querySelector(".btn-danger, .btn-secondary"); // Cari tombol bootstrap
  if (routeBtn && !routeBtn.disabled) {
    const stationName = document.getElementById("stationName").textContent;
    const station = gasStations.find((s) => s.name === stationName);
    if (station) {
      routeBtn.innerHTML = `
                <i class="fas fa-directions"></i>
                Tampilkan Rute
            `;
      routeBtn.onclick = () =>
        showRoute(station.lat, station.lng, station.name);
    }
  }

  // Reset status to default
  updateLocationStatus(
    "Klik di peta untuk mencari pom bensin terdekat",
    "success"
  );
}

// Reset info panel
function resetInfoPanel() {
  // Clear persistent status when resetting panel
  currentRouteInfo = null;
  persistentStatus = null;

  document.getElementById("stationName").textContent = "Pilih Pom Bensin";
  document.getElementById("infoContent").innerHTML = `
        <p class="info-instruction">Klik marker pom bensin di peta untuk melihat informasi detail</p>
    `;
}

// Find nearest gas stations
function findNearestGasStations() {
  if (!userLocation) return;

  const nearestStations = gasStations
    .map((station) => ({
      ...station,
      distance: calculateDistance(userLocation, {
        lat: station.lat,
        lng: station.lng,
      }),
    }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 5);

  // Update status with nearest station
  const nearest = nearestStations[0];
  updateLocationStatus(
    `Pom bensin terdekat: ${nearest.name} (${nearest.distance.toFixed(1)} km)`,
    "success"
  );
}

// Find nearest gas stations and automatically show route
function findNearestGasStationsAndShowRoute() {
  if (!userLocation) return;

  const nearestStations = gasStations
    .map((station) => ({
      ...station,
      distance: calculateDistance(userLocation, {
        lat: station.lat,
        lng: station.lng,
      }),
    }))
    .sort((a, b) => a.distance - b.distance);

  const nearest = nearestStations[0];

  // Show info for nearest station
  showGasStationInfo(nearest);

  // Automatically show route to nearest station after a short delay
  setTimeout(() => {
    showRoute(nearest.lat, nearest.lng, nearest.name);

    // Set persistent status for auto-route
    const autoRouteMessage = `Rute otomatis ke ${
      nearest.name
    } (${nearest.distance.toFixed(1)} km)`;
    persistentStatus = {
      message: autoRouteMessage,
      type: "success",
    };

    updateLocationStatus(autoRouteMessage, "success");
  }, 2500); // Wait for map animation to complete
}

// Find and show nearest gas station from clicked location
function findAndShowNearestGasStation(clickedLocation) {
  const nearestStations = gasStations
    .map((station) => ({
      ...station,
      distance: calculateDistance(clickedLocation, {
        lat: station.lat,
        lng: station.lng,
      }),
    }))
    .sort((a, b) => a.distance - b.distance);

  const nearest = nearestStations[0];

  // Show info for nearest station
  showGasStationInfo(nearest);

  // Automatically show route to nearest station
  showRoute(nearest.lat, nearest.lng, nearest.name, clickedLocation);

  // Set persistent status to "loading" while route is being calculated
  const loadingMessage = `Mencari rute ke ${nearest.name}...`;
  persistentStatus = {
    message: loadingMessage,
    type: "loading",
  };
  updateLocationStatus(loadingMessage, "loading");

  // Update status
  updateLocationStatus(clickRouteMessage, "success");
}

// Calculate distance between two points (Haversine formula)
function calculateDistance(pos1, pos2) {
  const R = 6371; // Earth's radius in kilometers
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

// Calculate estimated travel time
function calculateTravelTime(distance) {
  // Assume average speed of 30 km/h in city traffic
  const avgSpeed = 30;
  const timeInHours = distance / avgSpeed;
  const timeInMinutes = Math.round(timeInHours * 60);
  return Math.max(timeInMinutes, 1); // Minimum 1 minute
}

// Update location status
function updateLocationStatus(message, type = "loading") {
  const statusElement = document.getElementById("locationStatus");
  const statusText = document.getElementById("statusText");

  // Hapus kelas status Bootstrap yang lama
  statusElement.classList.remove(
    "alert-secondary",
    "alert-success",
    "alert-danger"
  );

  // Tambah kelas status Bootstrap yang baru
  if (type === "success") {
    statusElement.classList.add("alert-success");
  } else if (type === "error") {
    statusElement.classList.add("alert-danger");
  } else {
    // Default atau 'loading'
    statusElement.classList.add("alert-secondary");
  }

  statusText.textContent = message;

  // Add fade-in animation
  statusElement.classList.add("fade-in");
  setTimeout(() => {
    statusElement.classList.remove("fade-in");
  }, 500);
}

// Initialize when DOM is loaded
console.log("SiLok - Sistem Informasi Lokasi Pom Bensin Palembang");
console.log("Menggunakan OpenStreetMap dengan Leaflet...");
