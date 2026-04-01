import { useState, useEffect } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';

const socket = io('YOUR_BACKEND_URL');

function App() {
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [users, setUsers] = useState([]);
  const [chatUser, setChatUser] = useState(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    socket.on('receiveMessage', (data) => {
      setMessages(prev => [...prev, data]);
    });
  }, []);

  const login = async () => {
    const res = await axios.post('YOUR_BACKEND_URL/login', { username, password });
    setUser(res.data);
  };

  const search = async (name) => {
    const res = await axios.get(`YOUR_BACKEND_URL/users/${name}`);
    setUsers(res.data);
  };

  const sendMessage = () => {
    socket.emit('sendMessage', {
      from: user.username,
      to: chatUser.username,
      text: message
    });
    setMessage('');
  };

  if (!user) {
    return (
      <div>
        <h1>Жулин Хвостик</h1>
        <input placeholder="username" onChange={e=>setUsername(e.target.value)} />
        <input placeholder="password" type="password" onChange={e=>setPassword(e.target.value)} />
        <button onClick={login}>Войти</button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex' }}>
      <div>
        <input placeholder="Поиск" onChange={e=>search(e.target.value)} />
        {users.map(u => (
          <div key={u._id} onClick={()=>setChatUser(u)}>
            {u.username}
          </div>
        ))}
      </div>

      <div>
        <h2>{chatUser?.username}</h2>
        {messages.map((m,i)=> (
          <div key={i}>{m.from}: {m.text}</div>
        ))}
        <input value={message} onChange={e=>setMessage(e.target.value)} />
        <button onClick={sendMessage}>Отправить</button>
      </div>
    </div>
  );
}

export default App;


// ================= DEPLOY =================
// 1. Backend → https://render.com
// 2. Frontend → https://vercel.com
// 3. DB → https://mongodb.com/atlas

// ================= IMPORTANT =================
// Replace:
// YOUR_MONGODB_URI
// YOUR_BACKEND_URL

// ================= NEXT STEPS =================
// - Add JWT auth
// - Add file upload (Cloudinary)
// - Add WebRTC calls
