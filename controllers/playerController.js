
const db = require('../db/db');
const { generateCardWithBackpack, loadDataFromDB } = require('./cardGenerator');

exports.savePlayerData = async (req, res) => {
    const { player_id, color } = req.body;
    if (!player_id || !color) {
        return res.status(400).json({ error: 'Id та колір є обов\'язковими полями!' });
    }
    try {
        const pool = db();
        const [result] = await pool.execute(
            'UPDATE player SET color = ? WHERE player_id = ?',
            [color, player_id]
        );
        if (result.affectedRows > 0) {
            return res.status(200).json({ message: 'Дані гравця успішно збережено!' });
        } else {
            return res.status(500).json({ error: 'Не вдалося зберегти дані гравця.' });
        }
    } catch (error) {
        console.error('Помилка при збереженні даних гравця:', error);
        return res.status(500).json({ error: 'Помилка сервера.' });
    }
};


exports.getPlayerData = async (req, res) => {
    try {
        const pool = db();

        // Отримуємо кількість гравців з таблиці `room`
        const [roomRows] = await pool.execute('SELECT player_number FROM room ORDER BY room_id DESC LIMIT 1');
        const numPlayers = roomRows.length > 0 ? parseInt(roomRows[0].player_number) : 6;

        // Отримуємо ID головного гравця з query параметрів
        const player_id = req.query.player_id;
        if (!player_id) {
            return res.status(400).json({ error: 'player_id is required.' });
        }

        // Отримуємо дані головного гравця з бази даних
        const [mainPlayerRow] = await pool.execute('SELECT * FROM player WHERE player_id = ?', [player_id]);
        if (!mainPlayerRow.length) {
            return res.status(404).json({ error: 'Головний гравець не знайдений.' });
        }
        const mainPlayer = mainPlayerRow[0];

        // Завантажуємо дані для генерації карток
        const professions = await loadDataFromDB(pool, 'job', 'job');
        const skills = await loadDataFromDB(pool, 'hobby', 'hobby');
        const healthConditions = await loadDataFromDB(pool, 'health', 'health');
        const flaws = await loadDataFromDB(pool, 'vada', 'vada');
        const backpackItems = await loadDataFromDB(pool, 'items', 'items');

        // Генеруємо характеристики головного гравця, але nickname беремо з бази даних
        const mainCard = generateCardWithBackpack(professions, skills, healthConditions, flaws, backpackItems);
        mainCard.nickname = mainPlayer.nickname; // nickname береться з бази даних

        // Отримуємо ID для головного гравця
        const [jobRow] = await pool.execute('SELECT job_id FROM job WHERE job = ?', [mainCard.profession]);
        const [hobbyRow] = await pool.execute('SELECT hobby_id FROM hobby WHERE hobby = ?', [mainCard.skill]);
        const [healthRow] = await pool.execute('SELECT health_id FROM health WHERE health = ?', [mainCard.health]);
        const [flawRow] = await pool.execute('SELECT vada_id FROM vada WHERE vada = ?', [mainCard.flaw]);
        const [itemRows] = await pool.execute('SELECT items_id FROM items WHERE items IN (?)', [mainCard.backpack]);

        const job_id = jobRow.length > 0 ? jobRow[0].job_id : null;
        const hobby_id = hobbyRow.length > 0 ? hobbyRow[0].hobby_id : null;
        const health_id = healthRow.length > 0 ? healthRow[0].health_id : null;
        const vada_id = flawRow.length > 0 ? flawRow[0].vada_id : null;
        const items_ids = itemRows.map(row => row.items_id);

        // Отримуємо останню кімнату
        const [roomRow] = await pool.execute('SELECT room_id FROM room ORDER BY room_id DESC LIMIT 1');
        const room_id = roomRow.length > 0 ? roomRow[0].room_id : null;

        // Вставляємо або оновлюємо дані головного гравця у таблиці `player`
        await pool.execute(
            `
            INSERT INTO player (
                player_id, nickname, age, gender, childfreeStatus, color, room_id, job_id, hobby_id, health_id, vada_id, items_id
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
                age = VALUES(age),
                gender = VALUES(gender),
                childfreeStatus = VALUES(childfreeStatus),
                room_id = VALUES(room_id),
                job_id = VALUES(job_id),
                hobby_id = VALUES(hobby_id),
                health_id = VALUES(health_id),
                vada_id = VALUES(vada_id),
                items_id = VALUES(items_id)
            `,
            [
                player_id,
                mainPlayer.nickname, // nickname береться з бази даних
                mainCard.age,
                mainCard.gender,
                mainCard.childfreeStatus,
                '#FFFFFF', // Колір за замовчуванням (не оновлюється)
                room_id,
                job_id,
                hobby_id,
                health_id,
                vada_id,
                items_ids.join(',')
            ]
        );

        // Генеруємо картки інших гравців (numPlayers - 1)
        const cards = [];
        for (let i = 0; i < numPlayers - 1; i++) {
            const card = generateCardWithBackpack(professions, skills, healthConditions, flaws, backpackItems);
            cards.push(card);

            // Зберігаємо характеристики гравця у таблиці `player`
            const [jobRow] = await pool.execute('SELECT job_id FROM job WHERE job = ?', [card.profession]);
            const [hobbyRow] = await pool.execute('SELECT hobby_id FROM hobby WHERE hobby = ?', [card.skill]);
            const [healthRow] = await pool.execute('SELECT health_id FROM health WHERE health = ?', [card.health]);
            const [flawRow] = await pool.execute('SELECT vada_id FROM vada WHERE vada = ?', [card.flaw]);
            const [itemRows] = await pool.execute('SELECT items_id FROM items WHERE items IN (?)', [card.backpack]);

            const job_id = jobRow.length > 0 ? jobRow[0].job_id : null;
            const hobby_id = hobbyRow.length > 0 ? hobbyRow[0].hobby_id : null;
            const health_id = healthRow.length > 0 ? healthRow[0].health_id : null;
            const vada_id = flawRow.length > 0 ? flawRow[0].vada_id : null;
            const items_ids = itemRows.map(row => row.items_id);

            const [roomRow] = await pool.execute('SELECT room_id FROM room ORDER BY room_id DESC LIMIT 1');
            const room_id = roomRow.length > 0 ? roomRow[0].room_id : null;

            await pool.execute(
                'INSERT INTO player (nickname, age, gender, childfreeStatus, color, room_id, job_id, hobby_id, health_id, vada_id, items_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [
                    card.nickname || `Гравець ${i + 1}`,
                    card.age,
                    card.gender,
                    card.childfreeStatus,
                    '#FFFFFF',
                    room_id,
                    job_id,
                    hobby_id,
                    health_id,
                    vada_id,
                    items_ids.join(',')
                ]
            );
        }

        // Повертаємо дані
        return res.status(200).json({
            numPlayers,
            playerInfo: {
                nickname: mainPlayer.nickname, // nickname з бази даних
                age: mainCard.age,
                gender: mainCard.gender,
                childfreeStatus: mainCard.childfreeStatus,
                profession: mainCard.profession,
                skill: mainCard.skill,
                health: mainCard.health,
                flaw: mainCard.flaw,
                backpack: mainCard.backpack
            },
            otherPlayers: cards
        });
    } catch (error) {
        console.error('Помилка при отриманні даних гравців:', error);
        return res.status(500).json({ error: 'Помилка сервера.' });
    }
};