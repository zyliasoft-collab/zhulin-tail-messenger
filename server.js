const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
const { Server } = require('socket.io');

const app = express();
app.use(cors());
app.use(express.json());

// ===== MongoDB =====
mongoose.connect("YOUR_MONGODB_URI")
.then(()=>console.log("DB connected"))
.catch(err=>console.log(err));

// ===== Models =====
const UserSchema = new mongoose.Schema({
  username: String,
  password: String
});

const MessageSchema = new mongoose.Schema({
  from: String,
  to: String,
  text: String,
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', UserSchema);
const Message = mongoose.model('Message', MessageSchema);

// ===== Auth =====
app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  const user = new User({ username, password });
  await user.save();
  res.json(user);
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username, password });
  res.json(user);
});

// ===== Search Users =====
app.get('/users/:name', async (req, res) => {
  const users = await User.find({ username: { $regex: req.params.name, $options: 'i' } });
  res.json(users);
});

// ===== Messages =====
app.get('/messages/:from/:to', async (req, res) => {
  const msgs = await Message.find({
    $or: [
      { from: req.params.from, to: req.params.to },
      { from: req.params.to, to: req.params.from }
    ]
  });
  res.json(msgs);
});

// ===== Server =====
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

io.on('connection', socket => {
  console.log('User connected');

  socket.on('sendMessage', async (data) => {
    const msg = new Message(data);
    await msg.save();
    io.emit('receiveMessage', data);
  });
});

server.listen(5000, () => console.log('Server running'));
