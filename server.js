const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const Lead = require('./models/Lead');
const Broadcast = require('./models/Broadcast');
const VaultFile = require('./models/VaultFile');
const Message = require('./models/Message');

const app = express();
const server = http.createServer(app);

// Configure Socket.IO with high buffer limit for video/media injection payloads
const io = new Server(server, {
  cors: { origin: "*" },
  maxHttpBufferSize: 1e8 
});

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Database Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("MongoDB Atlas Connected Successfully"))
.catch(err => console.error("Database Connection Failure:", err));

// --- REAL-TIME SOCKET.IO HANDLER ---
io.on('connection', (socket) => {
  console.log(`Client Connected: ${socket.id}`);

  // WebRTC Video/Ghost Stream signaling
  socket.on('video-signal', (data) => {
    socket.to(data.target).emit('video-signal', data.signal);
  });

  // Real-time Chat Messaging & Persistence
  socket.on('chat-message', async (data) => {
    try {
      const newMsg = new Message(data);
      await newMsg.save();
      io.emit('chat-message', data);
    } catch (err) {
      console.error("Message save error:", err);
    }
  });

  socket.on('disconnect', () => {
    console.log(`Client Disconnected: ${socket.id}`);
  });
});

// --- API ROUTES ---

// 1. Health Check
app.get('/api/status', (req, res) => {
  res.status(200).json({ status: "Online", platform: "All-in-One Automated Ecosystem Active" });
});

// 2. Tool 1: Landing Page Leads
app.post('/api/leads', async (req, res) => {
  try {
    const newLead = new Lead(req.body);
    await newLead.save();
    res.status(201).json({ success: true, message: "Lead captured successfully!" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. Tool 2: Broadcasts
app.post('/api/broadcasts', async (req, res) => {
  try {
    const newBroadcast = new Broadcast(req.body);
    await newBroadcast.save();
    res.status(201).json({ success: true, message: "Broadcast dispatched successfully!" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. Tool 3: Secure Vault Link Generation
app.post('/api/vault/generate', async (req, res) => {
  try {
    const uniqueKey = Math.random().toString(36).substring(2) + Date.now().toString(36);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 Hours Expiry
    
    const newFile = new VaultFile({
      fileName: req.body.fileName,
      fileUrl: req.body.fileUrl,
      uniqueKey,
      expiresAt
    });
    
    await newFile.save();
    res.status(201).json({ 
      success: true, 
      downloadLink: `${req.protocol}://${req.get('host')}/api/vault/download/${uniqueKey}` 
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 5. Tool 3 Handler: Encrypted Download Protection & Redirection
app.get('/api/vault/download/:key', async (req, res) => {
  try {
    const fileRecord = await VaultFile.findOne({ uniqueKey: req.params.key });
    
    if (!fileRecord) return res.status(404).send("Invalid or expired download link.");
    if (new Date() > fileRecord.expiresAt) return res.status(403).send("This secure link has expired.");
    if (fileRecord.downloadCount >= fileRecord.maxDownloads) return res.status(403).send("Download limit exceeded.");

    fileRecord.downloadCount += 1;
    await fileRecord.save();

    return res.redirect(fileRecord.fileUrl);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`All-in-One server running smoothly on port ${PORT}`));
