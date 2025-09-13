require('dotenv').config();
const express = require('express');
const http = require('http');
const path = require('path');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

const Device = require('./models/Device');

const app = express(); // <-- define app first
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server);

const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/live_tracker', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.error('❌ MongoDB connect error:', err));

// ----------------- ROUTES -----------------

// Register or upsert a device
app.post('/api/devices/register', async (req, res) => {
  try {
    const { deviceId, name } = req.body;
    if (!deviceId) return res.status(400).json({ error: 'deviceId required' });

    let device = await Device.findOne({ deviceId });
    if (!device) {
      device = new Device({ deviceId, name });
      await device.save();
    } else {
      device.name = name || device.name;
      await device.save();
    }

    res.json(device);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update device location
app.post('/api/devices/:deviceId/update', async (req, res) => {
  try {
    const deviceId = req.params.deviceId;
    const { lat, lng } = req.body;

    if (typeof lat !== 'number' || typeof lng !== 'number') {
      return res.status(400).json({ error: 'lat and lng must be numbers' });
    }

    const device = await Device.findOneAndUpdate(
      { deviceId },
      { lat, lng, lastUpdated: new Date() },
      { new: true, upsert: true }
    );

    // Emit update to all connected clients
    io.emit('deviceUpdate', {
      deviceId: device.deviceId,
      name: device.name,
      lat: device.lat,
      lng: device.lng,
      lastUpdated: device.lastUpdated,
    });

    res.json(device);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all devices
app.get('/api/devices', async (req, res) => {
  try {
    const devices = await Device.find({});
    res.json(devices);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ----------------- SOCKET.IO -----------------
io.on('connection', (socket) => {
  console.log('🔌 Socket connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('❌ Socket disconnected:', socket.id);
  });
});

// ----------------- START SERVER -----------------
server.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));

// http://localhost:3000/device.html?deviceId=device2&name=Truck1