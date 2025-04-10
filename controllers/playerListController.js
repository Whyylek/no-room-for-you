const db = require('../db/db');

exports.getPlayers = async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM player');

        // Визначаємо поточного гравця (наприклад, останнього доданого)
        const currentUser = rows.length > 0 ? rows[rows.length - 1] : null;

        // Додаємо прапорець isUser для поточного гравця
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