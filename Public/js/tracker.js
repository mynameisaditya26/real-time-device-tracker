// Tracker client: shows devices on Leaflet map and updates via Socket.io
const socket = io();


const map = L.map('map').setView([22.5726, 88.3639], 12);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
maxZoom: 19,
attribution: '© OpenStreetMap'
}).addTo(map);


const deviceMarkers = {}; // deviceId -> marker


function updateDeviceOnMap(device) {
const { deviceId, name, lat, lng, lastUpdated } = device;
if (deviceMarkers[deviceId]) {
deviceMarkers[deviceId].setLatLng([lat, lng]);
} else {
const marker = L.marker([lat, lng]).addTo(map)
.bindPopup(`<b>${name || deviceId}</b><br/>${new Date(lastUpdated).toLocaleString()}`);
deviceMarkers[deviceId] = marker;
}
// update list
refreshDeviceList();
}


async function loadDevices() {
const res = await fetch('/api/devices');
const devices = await res.json();
devices.forEach(d => updateDeviceOnMap(d));
}


function refreshDeviceList() {
const ul = document.getElementById('devices-list');
ul.innerHTML = '';
Object.keys(deviceMarkers).forEach(deviceId => {
const marker = deviceMarkers[deviceId];
const li = document.createElement('li');
const popup = marker.getPopup();
li.innerHTML = `<strong>${deviceId}</strong> - ${popup ? popup.getContent() : ''}`;
li.onclick = () => map.panTo(marker.getLatLng());
ul.appendChild(li);
});
}


socket.on('deviceUpdate', (device) => {
updateDeviceOnMap(device);
});


// initial load
loadDevices();