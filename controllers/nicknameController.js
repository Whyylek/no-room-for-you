const db = require('../db/db');

exports.saveNickname = async (req, res) => {
    const { nickname } = req.body;

    if (!nickname) {
        console.error('❌ Нікнейм не передано.');
        return res.status(400).json({ error: 'Ім\'я не може бути порожнім!' });
    }

    try {
        const pool = db();
        const [result] = await pool.execute(
            'INSERT INTO player (nickname) VALUES (?)',
            [nickname]
        );

        if (result.affectedRows > 0) {
            console.log('✅ Нікнейм збережено:', nickname);
            const player_id = result.insertId;
            return res.status(200).json({ id: player_id,  message: 'Нікнейм успішно збережено!' });
        } else {
            return res.status(500).json({ error: 'Не вдалося зберегти нікнейм.' });
        }
    } catch (error) {
        console.error('❌ Помилка при збереженні:', error.message);
        return res.status(500).json({ error: 'Помилка сервера.' });
    }
};

exports.getNickname = async (req, res) => {
    try {
        const {id: nickname_id} = req.params;
        const pool = db();
        const [rows] = await pool.execute('SELECT nickname FROM player WHERE player_id = ?', [nickname_id]);
        if (rows.length > 0) {
            return res.status(200).json({ nickname: rows[0].nickname });
        } else {
            return res.status(200).json({ nickname: null });
        }
    } catch (error) {
        console.error('❌ Помилка при отриманні нікнейму:', error.message);
        return res.status(500).json({ error: 'Помилка сервера.' });
    }
};