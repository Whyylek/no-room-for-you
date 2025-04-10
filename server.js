require('dotenv').config();
const express = require('express');
const app = express();
const db = require('./db/db')();
const path = require('path');
const cors = require('cors'); 

app.use(cors()); 
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
app.use('/api', roomRoutes)


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
app.listen(PORT, () => {
    console.log(`🚀 Сервер запущено на порту ${PORT}`);
});