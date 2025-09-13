const mongoose = require('mongoose');


const DeviceSchema = new mongoose.Schema({
deviceId: { type: String, required: true, unique: true },
name: { type: String },
lat: { type: Number, default: 0 },
lng: { type: Number, default: 0 },
lastUpdated: { type: Date, default: Date.now }
});


module.exports = mongoose.model('Device', DeviceSchema);