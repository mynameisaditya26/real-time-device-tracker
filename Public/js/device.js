// Simple device simulator: registers and sends updates to server
(function(){
const params = new URLSearchParams(window.location.search);
const deviceId = params.get('deviceId') || 'device-' + Math.floor(Math.random()*1000);
const name = params.get('name') || deviceId;
document.getElementById('info').textContent = `Device ID: ${deviceId} — Name: ${name}`;


async function register() {
await fetch('/api/devices/register', {
method: 'POST',
headers: {'Content-Type':'application/json'},
body: JSON.stringify({ deviceId, name })
});
}


async function sendUpdate(lat, lng) {
await fetch(`/api/devices/${encodeURIComponent(deviceId)}/update`, {
method: 'POST',
headers: {'Content-Type':'application/json'},
body: JSON.stringify({ lat: Number(lat), lng: Number(lng) })
});
}


document.getElementById('send').addEventListener('click', async () => {
const lat = document.getElementById('lat').value;
const lng = document.getElementById('lng').value;
await sendUpdate(lat, lng);
});


// register on load
register();


// optional: send periodic updates to simulate movement
// setInterval(async () => {
// const lat = Number(document.getElementById('lat').value) + (Math.random()-0.5)*0.001;
// const lng = Number(document.getElementById('lng').value) + (Math.random()-0.5)*0.001;
// document.getElementById('lat').value = lat.toFixed(6);
// document.getElementById('lng').value = lng.toFixed(6);
// await sendUpdate(lat, lng);
// }, 3000);
})();