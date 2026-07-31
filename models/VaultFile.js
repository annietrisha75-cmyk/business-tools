const mongoose = require('mongoose');
const VaultFileSchema = new mongoose.Schema({
  fileName: { type: String, required: true },
  fileUrl: { type: String, required: true },
  uniqueKey: { type: String, required: true, unique: true },
  downloadCount: { type: Number, default: 0 },
  maxDownloads: { type: Number, default: 1 },
  expiresAt: { type: Date, required: true }
});
module.exports = mongoose.model('VaultFile', VaultFileSchema);
