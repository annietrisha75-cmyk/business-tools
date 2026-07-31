const mongoose = require('mongoose');
const BroadcastSchema = new mongoose.Schema({
  title: { type: String, required: true },
  messageBody: { type: String, required: true },
  targetList: [String],
  status: { type: String, default: 'Sent' },
  sentAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Broadcast', BroadcastSchema);
