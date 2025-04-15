const db = require('../db/db');

// Генератор унікального коду кімнати


async function getRoomByCode(room_code) {
    try {
        const pool = db();
        const [rows] = await pool.execute('SELECT * FROM room WHERE room_code = ?', [room_code]);
        return rows.length > 0 ? rows[0] : null; // Повертаємо кімнату або null
    } catch (error) {
        console.error('Помилка при отриманні кімнати:', error);
        throw error;
    }
}

exports.createRoom = async (req, res) => {
    console.log('👉 /create-room запит отримано');
    console.log('🧾 Тіло запиту:', req.body);
    const { player_number, player_id, room_code } = req.body;

    if (!player_number) {
        return res.status(400).json({ error: 'Кількість гравців є обов\'язковим полем!' });
    }

    try {
        const pool = db();

        // Перевіряємо, чи існує кімната за room_code
        
            // Якщо кімнати немає, створюємо нову
            const newRoomCode = room_code;
            const [result] = await pool.execute(
                'INSERT INTO room (room_code, player_number) VALUES (?, ?)',
                [newRoomCode, player_number]
            );
            
            if (result.insertId) {
                await pool.execute(
                    'UPDATE player SET room_id = ? WHERE player_id = ?',
                    [result.insertId, player_id]
                );
                return res.status(200).json({
                    message: 'Кімната успішно створена!',
                    room_code: newRoomCode,
                    room_id: result.insertId
                });
            } else {
                return res.status(500).json({ error: 'Не вдалося створити кімнату.' });
            }
        
    } catch (error) {
        console.error('Помилка при створенні/оновленні кімнати:', error);
        return res.status(500).json({ error: 'Помилка сервера.' });
    }
};
exports.updateRoom = async (req, res) => {
    try {
        const pool = db();
        const { player_number, room_code } = req.body;
        
        if (!room_code) {
            return res.status(400).json({ error: 'Код кімнати не вказано' });
        }
        
        const existingRoom = await getRoomByCode(room_code);
        if (!existingRoom) {
            return res.status(404).json({ error: 'Кімнату не знайдено.' });
        }
        
        await pool.execute(
            'UPDATE room  SET player_number = ? WHERE room_code = ?',
            [player_number, room_code]
        );
        
        res.json({ 
            success: true, 
            message: 'Кімнату оновлено.', 
            room_code 
        });
    } catch (error) {
        console.error('Помилка при оновленні кімнати:', error);
        res.status(500).json({ error: 'Помилка сервера.' });
    }
};
exports.findRoom = async (req, res) => {
    const { room_code, player_id } = req.body;

    try {
        const pool = db();

        // Перевіряємо, чи існує кімната за room_code
        let existingRoom = null;
        if (room_code) {
            existingRoom = await getRoomByCode(room_code);
        }

        if (existingRoom) {
            await pool.execute(
                'UPDATE player SET room_id = ? WHERE player_id = ?',
                [existingRoom.room_id, player_id]
            );
            return res.status(200).json({
                room_id: existingRoom.id,
                valid: true
            });
        } else {
                return res.status(500).json({ error: 'Не вдалося знайти кімнату.' , valid: false});
            
        }
    } catch (error) {
        console.error('Помилка при пошуку кімнати:', error);
        return res.status(500).json({ error: error , valid: false});
    }
};