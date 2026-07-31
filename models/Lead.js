const mongoose = require('mongoose');
const LeadSchema = new mongoose.Schema({
  pageId: { type: String, required: true },
  visitorName: { type: String, required: true },
  visitorContact: { type: String, required: true },
  message: String,
  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Lead', LeadSchema);
