require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const path = require('path');
const { Server } = require('socket.io');
const db = require('./db/db');


const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
  }
});
const roomTimers = {};
io.on('connection', (socket) => {
  console.log('🟢 Socket підключено:', socket.id);
 
  socket.on('testConnection', function(data) {
    console.log('Отримано тестове повідомлення:', data);
    
 
    if (data.room_code) {
        io.to(data.room_code).emit('testResponse', { 
            success: true, 
            message: 'Сервер отримав ваше повідомлення', 
            originalData: data 
        });
    }
});


socket.on('joinGameRoom', function(data) {
    if (data.room_code) {
        socket.join(data.room_code);
        console.log(`Гравець приєднався до кімнати: ${data.room_code}`);
        
   
        socket.emit('roomJoined', { 
            success: true, 
            room_code: data.room_code 
        });
    }
});

socket.on('kickPlayer', async ({ room_code, playerId }) => {
  console.log(`❌ Хост вигнав гравця з ID ${playerId} з кімнати ${room_code}`);
  
 
  io.to(room_code).emit('playerKicked', { playerId });

 
});

socket.on('revealAttribute', async ({ playerId, attributeId, roomCode, playerNickname, attributeValue }) => {
  console.log(`👀 Гравець ${playerId} (${playerNickname}) відкрив характеристику: ${attributeId} у кімнаті ${roomCode}`);
  const pool = db();
  
  switch(attributeId){
      case 'profession': attributeId = 'job'; break;
      case 'skills': attributeId = 'hobby'; break;
      case 'flaws': attributeId = 'vada'; break;
      case 'backpack': attributeId = 'items'; break;
  }
  
  await pool.execute(`UPDATE player_to_show SET ${attributeId} = ? WHERE player_id = ?`, [attributeValue, playerId]);
  
  const [allPlayersCards] = await pool.execute(`
      SELECT 
          player.nickname, 
          p.player_id, 
          p.age, 
          p.gender, 
          p.color, 
          p.job, 
          p.hobby, 
          p.health, 
          p.vada, 
          p.items 
      FROM player_to_show AS p 
      JOIN player ON p.player_id = player.player_id 
      JOIN room ON player.room_id = room.room_id 
      WHERE room_code = ?
  `, [roomCode]);
 
  io.to(roomCode).emit('updateAttributeVisibility', { 
      players: allPlayersCards 
  });
});
  socket.on('changeStory', ({ room_code, story_id }) => {
    console.log(`📚 Хост змінив історію: ${story_id} в кімнаті ${room_code}`);
    socket.to(room_code).emit('updateStory', { story_id });
  });

  socket.on('chooseStory', ({ room_code, story_id }) => {
    console.log(`✅ Хост обрав історію: ${story_id} в кімнаті ${room_code}`);
    socket.to(room_code).emit('storyChosen');
  });


  socket.on('startGame', ({ room_code }) => {
  console.log(`🎮 Гра почалася в кімнаті: ${room_code}`);
  io.to(room_code).emit('redirectPlayers'); 
  });
  socket.on('joinRoom', async ({ room_code, player_id }) => {
    if (!room_code || !player_id) return;
    const pool = db();

    let [rows] = await pool.execute(
      'SELECT player_id, nickname, color FROM player JOIN room ON player.room_id = room.room_id WHERE room_code = ?',
      [room_code]
    );

    const position = rows.length;
    const isHost = position === 1;

    socket.join(room_code);

    console.log(`📦 Гравець ${player_id} зайшов у кімнату ${room_code} як позиція ${position}`);

    socket.emit('roomJoined', {
      position,
      isHost,
      playersInRoom: rows.map(p => ({ playerId: p.player_id, nickname: p.nickname, color: p.color }))
    });

    sendRoomUpdate(room_code, rows);


    socket.on('colorChange', async ({ color, playerId }) => {
      await pool.execute('UPDATE player SET color = ? WHERE player_id = ?', [color, playerId]);
      [rows] = await pool.execute(
        'SELECT player_id, nickname, color FROM player JOIN room ON player.room_id = room.room_id WHERE room_code = ?',
        [room_code]
      );
      sendRoomUpdate(room_code, rows);
    });

  
    socket.on('checkPlayerCount', async ({ room_code }) => {
      const [players] = await pool.execute(
        'SELECT COUNT(*) AS count FROM player JOIN room ON player.room_id = room.room_id WHERE room_code = ?',
        [room_code]
      );
      const playerCount = players[0].count;
      socket.emit('playerCountResponse', { playerCount });
    });
   
    socket.on('disconnect', async () => {
     
      [rows] = await pool.execute(
        'SELECT player_id, nickname, color FROM player JOIN room ON player.room_id = room.room_id WHERE room_code = ? EXCEPT (SELECT player_id, nickname, color FROM player WHERE player_id = ?)',
        [room_code, player_id]
      );
      sendRoomUpdate(room_code, rows);
    });
  });
    socket.on('startTimer', async ({ room_code }) => {
      if (!roomTimers[room_code]) {
          roomTimers[room_code] = 60;
      }

      console.log(`⏳ Таймер запущено для кімнати: ${room_code}`);

      const intervalId = setInterval(async () => {
          if (roomTimers[room_code] > 0) {
              roomTimers[room_code]--;
              io.to(room_code).emit('updateTimer', { timeLeft: roomTimers[room_code] });
          } else {
              clearInterval(intervalId);
              io.to(room_code).emit('timerFinished'); 
          }
      }, 1000);

      io.to(room_code).emit('updateTimer', { timeLeft: roomTimers[room_code] });
  

  socket.on('stopTimer', ({ room_code }) => {
      if (roomTimers[room_code]) {
          clearInterval(roomTimers[room_code]); 
          delete roomTimers[room_code]; 
          io.to(room_code).emit('timerStopped'); 
      }
  });
  });
});


function sendRoomUpdate(room_code, rows) {
  const usedColors = rows.filter(p => p.color).map(p => p.color);
  console.log(usedColors); 
  io.to(room_code).emit('roomUpdate', {
    players: rows.map(p => ({ playerId: p.player_id, nickname: p.nickname, color: p.color })),
    usedColors 
  });
}

app.use(cors({
  origin: [
    'https://no-room-for-you-f8419decc423.herokuapp.com',
    'http://localhost:3000' 
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'] 
}));


app.options('*', cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));


const nicknameRoutes = require('./routes/nicknameRoutes');
const playerRoutes = require('./routes/playerRoutes');
const storyRoutes = require('./routes/storyRoutes');
const playerListRoutes = require('./routes/playerListRoutes');
const roomRoutes = require('./routes/roomRoutes');

app.use('/api', nicknameRoutes);
app.use('/api', playerRoutes);
app.use('/api', storyRoutes);
app.use('/api', playerListRoutes);
app.use('/api', roomRoutes);


app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.get('/second-page', (req, res) => res.sendFile(path.join(__dirname, 'public', 'second-page.html')));
app.get('/players', (req, res) => res.sendFile(path.join(__dirname, 'public', 'third-page.html')));
app.get('/story', (req, res) => res.sendFile(path.join(__dirname, 'public', 'fourth-page.html')));
app.get('/fifth-page', (req, res) => res.sendFile(path.join(__dirname, 'public', 'fifth-page.html')));


app.use((err, req, res, next) => {
  console.error('❌ Помилка сервера:', err.stack);
  res.status(500).json({ error: 'Помилка сервера' });
});


const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Сервер запущено на порту ${PORT}`);
});

