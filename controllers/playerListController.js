const db = require('../db/db');

exports.getPlayers = async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM player');


        const currentUser = rows.length > 0 ? rows[rows.length - 1] : null;


        const playersData = rows.map(player => ({
            ...player,
            isUser: player.player_id === currentUser?.player_id
        }));

        res.status(200).json(playersData);
    } catch (error) {
        console.error('Помилка при отриманні гравців:', error);
        res.status(500).json({ error: 'Помилка сервера' });
    }
};