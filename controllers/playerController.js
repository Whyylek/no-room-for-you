const { flatMap } = require('lodash');
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
        const [roomRows] = await pool.execute('SELECT room_id, player_number FROM room ORDER BY room_id DESC LIMIT 1');
        const numPlayers = roomRows.length > 0 ? parseInt(roomRows[0].player_number) : 6;
        const room_id = roomRows.length > 0 ? roomRows[0].room_id : null;

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
        const [professions] = await pool.execute('SELECT * FROM job');
        const [skills] = await pool.execute('SELECT * FROM hobby');
        const [healthConditions] = await pool.execute('SELECT * FROM health');
        const [flaws] = await pool.execute('SELECT * FROM vada');
        const [backpackItems] = await pool.execute('SELECT * FROM items');

        // Генеруємо характеристики головного гравця (якщо їх немає в БД)
       // Після отримання mainPlayer з БД:
        let mainCard = generateCardWithBackpack(professions, skills, healthConditions, flaws, backpackItems);
        mainPlayer.job_id = mainCard.profession.job_id;
        mainPlayer.hobby_id = mainCard.skill.hobby_id;
        mainPlayer.health_id = mainCard.health.health_id || mainCard.health;
        mainPlayer.vada_id = mainCard.flaw.vada_id || mainCard.flaw;
        mainPlayer.items_id = (mainCard.backpack.map((item)=>item.items_id)).join(',');
        mainPlayer.age = mainCard.age;
        mainPlayer.gender = mainCard.gender;
        mainPlayer.childfreeStatus = mainCard.childfreeStatus;
        console.log(mainCard);
        console.log(mainPlayer);
        // Якщо job_id немає - згенерувати нову професію
        // if (!mainPlayer.job_id) {
        //     const randomJob = professions[Math.floor(Math.random() * professions.length)].job;
        //     mainCard.profession = randomJob;
        //     // Оновлення job_id в БД
        //     const [jobRow] = await pool.execute('SELECT job_id FROM job WHERE job = ?', [randomJob]);
        //     mainPlayer.job_id = jobRow[0]?.job_id;
        // }
        
        // // Аналогічно для інших полів:
        // if (!mainPlayer.hobby_id) {
        //     const randomSkill = skills[Math.floor(Math.random() * skills.length)].hobby;
        //     mainCard.skill = randomSkill;
        //     const [hobbyRow] = await pool.execute('SELECT hobby_id FROM hobby WHERE hobby = ?', [randomSkill]);
        //     mainPlayer.hobby_id = hobbyRow[0]?.hobby_id;
        // }
        
        // if (!mainPlayer.health_id) {
        //     const randomHealth = healthConditions[Math.floor(Math.random() * healthConditions.length)].health;
        //     mainCard.health = randomHealth;
        //     const [healthRow] = await pool.execute('SELECT health_id FROM health WHERE health = ?', [randomHealth]);
        //     mainPlayer.health_id = healthRow[0]?.health_id;
        // }
        
        // if (!mainPlayer.vada_id) {
        //     const randomFlaw = flaws[Math.floor(Math.random() * flaws.length)].vada;
        //     mainCard.flaw = randomFlaw;
        //     const [flawRow] = await pool.execute('SELECT vada_id FROM vada WHERE vada = ?', [randomFlaw]);
        //     mainPlayer.vada_id = flawRow[0]?.vada_id;
        // }
        
        // // Генерація предметів, якщо items_id відсутній
        // if (!mainPlayer.items_id) {
        //     const randomItems = backpackItems
        //         .sort(() => 0.5 - Math.random())
        //         .slice(0, 3)
        //         .map(item => item.items);
        //     mainCard.backpack = randomItems;
        //     const itemIds = randomItems.map(item => 
        //         backpackItems.find(i => i.items === item).items_id
        //     );
        //     mainPlayer.items_id = itemIds.join(',');
        // }
        
        // Оновлення даних гравця в БД
        await pool.execute(
            `UPDATE player SET 
                age = ?,
                gender = ?,
                childfreeStatus = ?,
                job_id = ?, 
                hobby_id = ?, 
                health_id = ?, 
                vada_id = ?, 
                items_id = ?
            WHERE player_id = ?`,
            [
                mainPlayer.age,
                mainPlayer.gender,
                mainPlayer.childfreeStatus,
                mainPlayer.job_id,
                mainPlayer.hobby_id,
                mainPlayer.health_id,
                mainPlayer.vada_id,
                mainPlayer.items_id,
                player_id
            ]
        );

        // Отримуємо дані з пов'язаних таблиць для головного гравця
        if (mainPlayer.job_id) {
            const [jobRow] = await pool.execute('SELECT job FROM job WHERE job_id = ?', [mainPlayer.job_id]);
            mainCard.profession = jobRow[0]?.job || '';
        }
        if (mainPlayer.hobby_id) {
            const [hobbyRow] = await pool.execute('SELECT hobby FROM hobby WHERE hobby_id = ?', [mainPlayer.hobby_id]);
            mainCard.skill = hobbyRow[0]?.hobby || '';
        }
        if (mainPlayer.health_id) {
            const [healthRow] = await pool.execute('SELECT health FROM health WHERE health_id = ?', [mainPlayer.health_id]);
            mainCard.health = healthRow[0]?.health || '';
        }
        if (mainPlayer.vada_id) {
            const [flawRow] = await pool.execute('SELECT vada FROM vada WHERE vada_id = ?', [mainPlayer.vada_id]);
            mainCard.flaw = flawRow[0]?.vada || '';
        }
        if (mainPlayer.items_id) {
            const itemIds = mainPlayer.items_id;//.split(',').map(item => parseInt(item));
            console.log(itemIds);
            const [itemsRow] = await pool.execute('SELECT items FROM items WHERE items_id IN (?)', [itemIds]);
            mainCard.backpack = itemsRow.map(item => item.items);
            console.log(mainCard.backpack);
        }

        // Отримуємо всіх інших гравців з поточної кімнати
        const [otherPlayersRows] = await pool.execute(`
            SELECT p.*, 
                   j.job AS profession, 
                   h.hobby AS skill, 
                   he.health, 
                   v.vada AS flaw,
                   GROUP_CONCAT(i.items) AS backpack
            FROM player p
            LEFT JOIN job j ON p.job_id = j.job_id
            LEFT JOIN hobby h ON p.hobby_id = h.hobby_id
            LEFT JOIN health he ON p.health_id = he.health_id
            LEFT JOIN vada v ON p.vada_id = v.vada_id
            LEFT JOIN items i ON FIND_IN_SET(i.items_id, p.items_id)
            WHERE p.room_id = ? AND p.player_id != ?
            GROUP BY p.player_id
        `, [room_id, player_id]);

        let otherPlayers = otherPlayersRows.map(player => ({
            nickname: player.nickname,
            age: player.age,
            gender: player.gender,
            childfreeStatus: player.childfreeStatus,
            profession: player.profession,
            skill: player.skill,
            health: player.health,
            flaw: player.flaw,
            backpack: player.backpack ? player.backpack.split(',') : []
        }));

        // Якщо кількість інших гравців менша за необхідну, генеруємо нових
        const requiredOtherPlayers = numPlayers - 1;
        if (otherPlayers.length < requiredOtherPlayers) {
            const toGenerate = requiredOtherPlayers - otherPlayers.length;
            for (let i = 0; i < toGenerate; i++) {
                const newCard = generateCardWithBackpack(
                    professions.map(p => p.job),
                    skills.map(s => s.hobby),
                    healthConditions.map(h => h.health),
                    flaws.map(f => f.vada),
                    backpackItems.map(b => b.items)
                );
            
                // Ensure all required fields are present (add defaults if necessary)
                newCard.age = newCard.age ?? 0; // Default age to 0 if missing
                newCard.gender = newCard.gender ?? 'Unknown'; // Default gender
                newCard.childfreeStatus = newCard.childfreeStatus ?? 'No'; // Default childfree status


                // Зберігаємо нового гравця в БД
                const [jobRow] = await pool.execute('SELECT job_id FROM job WHERE job = ?', [newCard.profession]);
                const job_id = jobRow.length ? jobRow[0].job_id : null;

                const [hobbyRow] = await pool.execute('SELECT hobby_id FROM hobby WHERE hobby = ?', [newCard.skill]);
                const hobby_id = hobbyRow.length ? hobbyRow[0].hobby_id : null;

                const [healthRow] = await pool.execute('SELECT health_id FROM health WHERE health = ?', [newCard.health]);
                const health_id = healthRow.length ? healthRow[0].health_id : null;

                const [flawRow] = await pool.execute('SELECT vada_id FROM vada WHERE vada = ?', [newCard.flaw]);
                const vada_id = flawRow.length ? flawRow[0].vada_id : null;

                const [itemRows] = await pool.execute('SELECT items_id FROM items WHERE items IN (?)', [newCard.backpack]);
                // Під час генерації нового гравця:
                const items_ids = itemRows?.map(row => row.items_id).join(',') || '';

                await pool.execute(
                    'INSERT INTO player (nickname, age, gender, childfreeStatus, color, room_id, job_id, hobby_id, health_id, vada_id, items_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                    [
                        newCard.nickname || `Гравець ${i + 1}`, // Fallback nickname
                        newCard.age, // Now guaranteed to be defined
                        newCard.gender, // Now guaranteed to be defined
                        newCard.childfreeStatus, // Now guaranteed to be defined
                        '#FFFFFF',
                        room_id,
                        job_id,
                        hobby_id,
                        health_id,
                        vada_id,
                        items_ids
                    ]
                );
                otherPlayers.push(newCard);
            }
        }

        // Повертаємо дані
        return res.status(200).json({
            numPlayers,
            playerInfo: mainCard,
            otherPlayers: otherPlayers
        });
    } catch (error) {
        console.error('Помилка при отриманні даних гравців:', error);
        return res.status(500).json({ error: 'Помилка сервера.' });
    }
};