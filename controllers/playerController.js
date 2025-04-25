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


        const [roomRows] = await pool.execute('SELECT room_id, player_number FROM room ORDER BY room_id DESC LIMIT 1');
        const numPlayers = roomRows.length > 0 ? parseInt(roomRows[0].player_number) : 6;
        const room_id = roomRows.length > 0 ? roomRows[0].room_id : null;


        const player_id = req.query.player_id;
        if (!player_id) {
            return res.status(400).json({ error: 'player_id is required.' });
        }


        const [mainPlayerRow] = await pool.execute('SELECT * FROM player WHERE player_id = ?', [player_id]);
        if (!mainPlayerRow.length) {
            return res.status(404).json({ error: 'Головний гравець не знайдений.' });
        }
        const mainPlayer = mainPlayerRow[0];

        


        const [professions] = await pool.execute('SELECT * FROM job');
        const [skills] = await pool.execute('SELECT * FROM hobby');
        const [healthConditions] = await pool.execute('SELECT * FROM health');
        const [flaws] = await pool.execute('SELECT * FROM vada');
        const [backpackItems] = await pool.execute('SELECT * FROM items');


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

        const [playerColor] = await pool.execute('SELECT color FROM player WHERE player_id = ?', [player_id]);
        mainCard.color = playerColor[0].color;

        

        


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
            const itemIds = mainPlayer.items_id.split(',').map(id => parseInt(id.trim()));
            console.log(itemIds);
            const placeholders = itemIds.map(() => '?').join(',');
            const query = `SELECT items FROM items WHERE items_id IN (${placeholders})`;
            const [itemsRow] = await pool.execute(query, itemIds);
            mainCard.backpack = itemsRow.map(item => item.items);
            console.log(mainCard.backpack);
        }

        await pool.execute(
            `INSERT INTO player_to_show(player_id, age, gender, job, hobby, health, vada, items, color) VALUES( ?,?,?,?,?,?,?,?, ?)`,
            [
                player_id,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                playerColor[0].color
            ]
        );

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
            player_id: player.player_id,
            nickname: player.nickname,
            age: player.age,
            gender: player.gender,
            childfreeStatus: player.childfreeStatus,
            profession: player.profession,
            skill: player.skill,
            health: player.health,
            flaw: player.flaw,
            backpack: player.backpack ? player.backpack.split(',') : [],
            color: player.color
        }));


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
            
                
                newCard.age = newCard.age ?? 0; 
                newCard.gender = newCard.gender ?? 'Unknown'; 
                newCard.childfreeStatus = newCard.childfreeStatus ?? 'No'; 


               
                const [jobRow] = await pool.execute('SELECT job_id FROM job WHERE job = ?', [newCard.profession]);
                const job_id = jobRow.length ? jobRow[0].job_id : null;

                const [hobbyRow] = await pool.execute('SELECT hobby_id FROM hobby WHERE hobby = ?', [newCard.skill]);
                const hobby_id = hobbyRow.length ? hobbyRow[0].hobby_id : null;

                const [healthRow] = await pool.execute('SELECT health_id FROM health WHERE health = ?', [newCard.health]);
                const health_id = healthRow.length ? healthRow[0].health_id : null;

                const [flawRow] = await pool.execute('SELECT vada_id FROM vada WHERE vada = ?', [newCard.flaw]);
                const vada_id = flawRow.length ? flawRow[0].vada_id : null;

                const [itemRows] = await pool.execute('SELECT items_id FROM items WHERE items IN (?)', [newCard.backpack]);
              
                const items_ids = itemRows?.map(row => row.items_id).join(',') || '';

                const [row] =  await pool.execute(
                    'INSERT INTO player (nickname, age, gender, childfreeStatus, color, room_id, job_id, hobby_id, health_id, vada_id, items_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                    [
                        newCard.nickname || `Гравець ${i + 1}`, 
                        newCard.age, 
                        newCard.gender, 
                        newCard.childfreeStatus, 
                        '#FFFFFF',
                        room_id,
                        job_id,
                        hobby_id,
                        health_id,
                        vada_id,
                        items_ids
                    ]
                );
                const otherPlayerId = row.insertId;
                otherPlayers.push(newCard);
                console.log(otherPlayerId);
                await pool.execute(
                    'INSERT INTO player_to_show (player_id, age, gender, color, job, hobby, health, vada, items) VALUES ( ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                    [
                        otherPlayerId,
                        null,
                        null,
                        '#FFFFFF',
                        null,
                        null,
                        null,
                        null,
                        null
                    ]
                );
            }
        }


        const [otherPlayersCards] = await pool.execute('SELECT player.nickname, p.player_id, p.age, p.gender, p.color, p.job, p.hobby, p.health, p.vada, p.items FROM player_to_show AS p JOIN player ON p.player_id = player.player_id JOIN room ON player.room_id = room.room_id WHERE player.room_id = ? AND p.player_id <> ?', [room_id, player_id]);
        console.log(otherPlayersCards);
        return res.status(200).json({
            numPlayers,
            playerInfo: mainCard,
            otherPlayers: otherPlayersCards
        });
    } catch (error) {
        console.error('Помилка при отриманні даних гравців:', error);
        return res.status(500).json({ error: 'Помилка сервера.' });
    }
};