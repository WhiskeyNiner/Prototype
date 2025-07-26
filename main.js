// ===============================
//  Global UI & Map Logic
// ===============================

// ---- Map and Cluster Setup ----
const map = L.map('map', { maxZoom: 20, minZoom: 0 }).setView([36.0652, -119.0160], 11); // Porterville, CA

const lightTiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap contributors', subdomains: 'abcd', maxZoom: 20 });
const topoTiles = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenTopoMap contributors', maxZoom: 17 });
const darkTiles = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
    maxZoom: 20,
    subdomains: 'abcd'
});

let currentTileLayer = null;
let currentMapStyle = 'light';
let is3DActive = false;
let previousMapStyle = 'dark';

// Marker cluster setup
let markerCluster = L.markerClusterGroup({ disableClusteringAtZoom: 12 });
map.addLayer(markerCluster);

function addSampleMarker(lat, lng, html) {
    markerCluster.addLayer(L.marker([lat, lng]).bindPopup(html));
}
// sample
addSampleMarker(37.7749, -122.4194, 'W9ALB Repeater<br>146.940- PL 123.0');

// 3D toggle
document.getElementById('btn-3d').addEventListener('click', function () {
    toggle3D();
});


function setMapStyle(style) {
    if (currentTileLayer) map.removeLayer(currentTileLayer);
    currentMapStyle = style;
    if (style === 'light') currentTileLayer = lightTiles;
    else if (style === 'dark') currentTileLayer = darkTiles;
    else currentTileLayer = topoTiles;
    map.addLayer(currentTileLayer);
    if (!is3DActive) {
        document.getElementById('btn-map-toggle').classList.toggle('active');
    }
}

function setTheme(mode) {
    document.documentElement.setAttribute('data-bs-theme', mode);
    // No more theme-light/theme-dark buttons to toggle!
    // You can optionally update the theme button icon here if you wish
}

function toggle3D() {
    const btn3D = document.getElementById('btn-3d');
    const btnMapToggle = document.getElementById('btn-map-toggle');
    is3DActive = !is3DActive;
    if (is3DActive) {
        previousMapStyle = currentMapStyle;
        setMapStyle('topo');
        btn3D.classList.add('active');
        btnMapToggle.disabled = true; // << DISABLE
    } else {
        btn3D.classList.remove('active');
        btnMapToggle.disabled = false; // << RE-ENABLE
        setMapStyle(previousMapStyle);
    }
}

setMapStyle(currentMapStyle);

// Mobile toolbar spacing fix
function adjustToolbar() {
    const rightBlock = document.querySelector('.toolbar .d-flex.align-items-center.ms-auto');
    if (!rightBlock) return;
    if (window.innerWidth < 576) { rightBlock.classList.remove('ms-auto'); }
    else { if (!rightBlock.classList.contains('ms-auto')) rightBlock.classList.add('ms-auto'); }
}
window.addEventListener('resize', adjustToolbar);
adjustToolbar();

// Sidebar resize logic
const sidebar = document.getElementById('sidebar');
const toggleBtn = document.getElementById('toggleSidebar');
const dragHandle = document.getElementById('dragHandle');

toggleBtn.addEventListener('click', () => {
    const hidden = sidebar.classList.toggle('hidden');
    dragHandle.style.display = hidden ? 'none' : 'block';
    setTimeout(() => map.invalidateSize(), 10);
});

let isDraggingWidth = false;
dragHandle.addEventListener('mousedown', () => { isDraggingWidth = true; document.body.style.cursor = 'ew-resize'; });
window.addEventListener('mousemove', (e) => {
    if (!isDraggingWidth) return;
    const newWidth = window.innerWidth - e.clientX;
    if (newWidth > 150 && newWidth < window.innerWidth * 0.9) {
        sidebar.style.width = newWidth + 'px';
        map.invalidateSize();
    }
});
window.addEventListener('mouseup', () => { isDraggingWidth = false; document.body.style.cursor = 'default'; });

// City select -> flyTo
const cityCoords = {
    sf: [37.7749, -122.4194],
    sea: [47.6062, -122.3321],
    nyc: [40.7128, -74.0060],
    chi: [41.8781, -87.6298],
    den: [39.7392, -104.9903]
};
const citySelect = document.getElementById('citySelect');
citySelect.addEventListener('change', (e) => {
    const val = e.target.value; if (!val) return;
    const coords = cityCoords[val];
    if (coords) { map.flyTo(coords, 11); }
});

// Export button
document.getElementById('btn-export').addEventListener('click', () => {
    alert('Export to CHIRP clicked. (TODO: implement export)');
});

// Cluster zoom stop control
const clusterZoomInput = document.getElementById('clusterZoom');
clusterZoomInput.addEventListener('change', () => {
    const z = parseInt(clusterZoomInput.value, 10);
    if (!isNaN(z)) {
        markerCluster.options.disableClusteringAtZoom = z;
        markerCluster.refreshClusters();
    }
});

// Comm toggle buttons
['ping', 'rx', 'tx'].forEach(function (k) {
    const btn = document.getElementById('btn-' + k);
    if (btn) {
        btn.addEventListener('click', function () {
            btn.classList.toggle('active');
            btn.setAttribute('aria-pressed', btn.classList.contains('active'));
            alert(btn.textContent.trim());
        });
    }
});

// ========================
//  Login Modal Logic
// ========================
(function () {
    const loginModal = document.getElementById('loginModal');
    if (!loginModal) return;
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.onsubmit = function (e) {
            e.preventDefault();
            // TODO: Real authentication
            alert("Logging in (demo)");
            bootstrap.Modal.getInstance(loginModal).hide();
        };
    }

    // Modal nav: Create account
    const createAccountLink = document.getElementById('link-create-account');
    if (createAccountLink) {
        createAccountLink.onclick = function (e) {
            e.preventDefault();
            bootstrap.Modal.getInstance(loginModal).hide();
            loginModal.addEventListener('hidden.bs.modal', function showRegisterOnce() {
                var regModal = new bootstrap.Modal(document.getElementById('registerModal'));
                regModal.show();
                loginModal.removeEventListener('hidden.bs.modal', showRegisterOnce);
            });
        };
    }

    // Modal nav: Forgot password
    const forgotLink = document.getElementById('link-forgot');
    if (forgotLink) {
        forgotLink.onclick = function (e) {
            e.preventDefault();
            bootstrap.Modal.getInstance(loginModal).hide();
            loginModal.addEventListener('hidden.bs.modal', function showForgotOnce() {
                var forgotModal = new bootstrap.Modal(document.getElementById('forgotModal'));
                forgotModal.show();
                loginModal.removeEventListener('hidden.bs.modal', showForgotOnce);
            });
        };
    }
})();

// ========================
//  Register Modal Logic
// ========================
(function () {
    const regModal = document.getElementById('registerModal');
    if (!regModal) return;
    const regForm = document.getElementById('registerForm');
    if (regForm) {
        regForm.onsubmit = function (e) {
            e.preventDefault();
            // TODO: Real registration logic
            alert("Registering (demo)");
            bootstrap.Modal.getInstance(regModal).hide();
        };
    }
})();

// =============================
//  Forgot Password Modal Logic
// =============================
(function () {
    const forgotModal = document.getElementById('forgotModal');
    if (!forgotModal) return;
    const forgotForm = document.getElementById('forgotForm');
    if (forgotForm) {
        forgotForm.onsubmit = function (e) {
            e.preventDefault();
            alert("Sending reset email (demo)");
            bootstrap.Modal.getInstance(forgotModal).hide();
        };
    }
})();

function calcFilterModalHeight() {
    const tabContent = document.querySelector('#filterModal .tab-content');
    if (!tabContent) return;
    let max = 0;
    const panes = tabContent.querySelectorAll('.tab-pane');
    panes.forEach(p => {
        const prevShow = p.classList.contains('show');
        const prevActive = p.classList.contains('active');
        p.classList.add('show', 'active');
        p.style.position = 'absolute';
        p.style.visibility = 'hidden';
        const h = p.offsetHeight;
        max = Math.max(max, h);
        p.style.position = '';
        p.style.visibility = '';
        if (!prevShow) p.classList.remove('show');
        if (!prevActive) p.classList.remove('active');
    });
    tabContent.style.minHeight = max + 'px';
}

document.getElementById('filterModal').addEventListener('shown.bs.modal', calcFilterModalHeight);
window.addEventListener('resize', calcFilterModalHeight);
document.querySelectorAll('#filterModal [data-bs-toggle="tab"]').forEach(btn => {
    btn.addEventListener('shown.bs.tab', calcFilterModalHeight);
});


// =======================
//  Theme Toggle Button
// =======================

// INITIAL STATE (set these to your defaults)
let isMapDark = (typeof currentMapStyle !== "undefined") ? (currentMapStyle === 'dark') : true;
let isDarkTheme = document.documentElement.getAttribute('data-bs-theme') === 'dark';

// --- UPDATE BUTTON ICONS ---
function updateMapButton() {
    const icon = document.querySelector('#btn-map-toggle i');
    if (!icon) return;
    icon.className = isMapDark ? 'bi bi-moon-stars' : 'bi bi-sun';
}
function updateThemeButton() {
    const icon = document.querySelector('#btn-theme-toggle i');
    if (!icon) return;
    icon.className = isDarkTheme ? 'bi bi-moon-stars' : 'bi bi-sun';
}

// --- CLICK LISTENERS ---
document.getElementById('btn-map-toggle').addEventListener('click', function () {
    isMapDark = !isMapDark;
    setMapStyle(isMapDark ? 'dark' : 'light');  // Your function
    updateMapButton();
});

document.getElementById('btn-theme-toggle').addEventListener('click', function () {
    isDarkTheme = !isDarkTheme;
    setTheme(isDarkTheme ? 'dark' : 'light');   // Your function
    updateThemeButton();
});

// --- INITIALIZE BUTTON ICONS ---
updateMapButton();
updateThemeButton();