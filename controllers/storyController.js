const db = require('../db/db'); // Імпортуємо пул підключень

exports.getStory = async (req, res) => {
    const { storyId } = req.params;
   

    try {
        console.log('➡️ Спроба підключення до бази даних...'); // Логування
        const pool = db();
        const [rows] = await pool.execute(
            'SELECT story_id AS id, story, story_name AS storyName FROM story WHERE story_id = ?',
            [storyId]
        );

        console.log('✅ Результат запиту:', rows); // Логування

        if (rows.length > 0) {
            return res.status(200).json(rows[0]); // Повертаємо першу знайдену історію
        } else {
            return res.status(404).json({ error: 'Історію не знайдено.' });
        }
    } catch (error) {
        console.error('❌ Помилка при отриманні історії:', error);
        return res.status(500).json({ error: 'Помилка сервера.' });
    }
};
exports.updateRoomStory = async (req, res) => {
    const { room_code, story_id } = req.body;
    if (!room_code || !story_id) {
        return res.status(400).json({ error: 'Код кімнати та ID історії є обов\'язковими полями!' });
    }

    try {
        console.log('Отримані дані:', { room_code, story_id }); // Логування
        const pool = db();
        const [result] = await pool.execute(
            'UPDATE room SET story_id = ? WHERE room_code = ?',
            [story_id, room_code]
        );

        if (result.affectedRows > 0) {
            return res.status(200).json({ message: 'Історію успішно оновлено!' });
        } else {
            return res.status(404).json({ error: 'Кімнату не знайдено.' });
        }
    } catch (error) {
        console.error('Помилка при оновленні історії:', error);
        return res.status(500).json({ error: 'Помилка сервера.' });
    }
};