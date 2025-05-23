const express = require('express');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const path = require('path');

// MongoDB connection
mongoose.connect('mongodb://localhost/miningBots', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Define schemas
const BotSchema = new mongoose.Schema({
  botId: String,
  wallet: Object,
  stats: Object,
  status: String,
  lastActive: Date,
  proxy: Object
});

const Bot = mongoose.model('Bot', BotSchema);

// Express setup
const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Socket.io setup
const server = app.listen(3000, () => {
  console.log('Dashboard running on port 3000');
});

const io = socketIo(server);

// API Endpoints
app.get('/api/bots', async (req, res) => {
  const bots = await Bot.find();
  res.json(bots);
});

app.post('/api/bots/create', async (req, res) => {
  const { proxy } = req.body;
  const botId = await botManager.createBotInstance(proxy);
  res.json({ success: true, botId });
});

// Socket.io events
io.on('connection', (socket) => {
  console.log('Client connected');
  
  // Send real-time updates
  setInterval(() => {
    const bots = Array.from(botManager.bots.values());
    socket.emit('bot-update', bots);
  }, 5000);
});