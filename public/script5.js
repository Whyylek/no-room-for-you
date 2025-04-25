window.addEventListener('DOMContentLoaded', async function () {
    function isHost() {
        return sessionStorage.getItem('is_host') === 'true';
    }
    async function fetchDataFromDB() {
        try {
            const player_id = sessionStorage.getItem('player_id'); 
            if (!player_id) {
                throw new Error('player_id не знайдено в sessionStorage.');
            }
            const response = await fetch(`/api/player-data?player_id=${player_id}`);
            if (!response.ok) {
                throw new Error('Помилка запиту');
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Помилка отримання даних:', error);
            return {
                numPlayers: 6,
                playerInfo: {
                    nickname: 'ВИ',
                    age: 37,
                    gender: 'Жінка',
                    childfreeStatus: 'Childfree',
                    profession: 'Лікар',
                    skill: 'Танцювати танго',
                    health: 'Здорова',
                    flaw: 'Без вад',
                    backpack: ['Чай', 'Гриби', 'Ложка']
                },
                otherPlayers: []
            };
        }
    }

    const dbData = await fetchDataFromDB();
    const numPlayers = dbData.numPlayers || 6;
    const mainContainer = document.querySelector('.main-fifth');
    const modalContainer = document.getElementById('modalContainer');
    dbData.otherPlayers.forEach(player => {
        if (typeof player.backpack === 'string') {
            player.backpack = player.backpack.split(',').map(item => item.trim());
        }
    });

    const playerModalHtml = `
    <div class="modal" id="playerModal" data-player-id="${dbData.playerInfo.player_id}">
          <div class="modal-inner" style="box-shadow: 0 0 20px ${dbData.playerInfo.color || "white"};">
            <button class="modal-close" id="closeModal">✖</button>
            <h2 class="kartka">КАРТКА:</h2>
            <div class="player-header-container">
                <h3>${dbData.playerInfo.nickname || 'ВИ'}</h3>
            </div>
            <ul class="player-info">
                <li>
                    <input type="radio" id="gender" name="playerInfo">
                    <label for="gender" class="yellow">Стать: <span>${dbData.playerInfo.gender} (${dbData.playerInfo.childfreeStatus})</span></label>
                </li>
                <li>
                    <input type="radio" id="age" name="playerInfo">
                    <label for="age">Вік: <span>${dbData.playerInfo.age}</span></label>
                </li>
                <li>
                    <input type="radio" id="profession" name="playerInfo">
                    <label for="profession" data-attribute-id="profession">Професія: <span>${dbData.playerInfo.profession}</span></label>
                </li>
                <li>
                    <input type="radio" id="health" name="playerInfo">
                    <label for="health">Стан здоров'я: <span>${dbData.playerInfo.health}</span></label>
                </li>
                <li>
                    <input type="radio" id="skills" name="playerInfo">
                    <label for="skills">Навички: <span>${dbData.playerInfo.skill}</span></label>
                </li>
               <li>
                 <input type="radio" id="items" name="playerInfo">
                <label for="items">Предмети в рюкзаку: 
                 <span>${Array.isArray(dbData.playerInfo.backpack) ? dbData.playerInfo.backpack.join(', ') : dbData.playerInfo.backpack}</span>
                </label>
                </li>
                <li>
                    <input type="radio" id="flaws" name="playerInfo">
                    <label for="flaws">Вади: <span>${dbData.playerInfo.flaw}</span></label>
                </li>
            </ul>
            <button id="confirmSelection" class="confirm-btn">Підтвердити</button>
        </div>
    </div>`;
    modalContainer.innerHTML = playerModalHtml;

    let modalsHtml = '';
    dbData.otherPlayers.forEach((player, index) => {
        modalsHtml += `
        <div class="modal" id="playerModal${index + 1}" data-player-id="${player.player_id}">
             <div class="modal-inner" style="box-shadow: 0 0 20px ${player.color || "white"};">
                <button class="modal-close" id="closeModal${index + 1}">✖</button>
                <h2 class="kartka">КАРТКА:</h2>
                <div class="player-header-container">
                    <h3>${player.nickname}</h3>
                </div>
                <ul class="player-info player-info-other">
                    <li><label data-attribute-id="gender">Стать: <span class="hidden-attribute">${player.gender} (${player.childfreeStatus})</span></label></li>
                    <li><label data-attribute-id="age">Вік: <span class="hidden-attribute">${player.age}</span></label></li>
                    <li><label data-attribute-id="profession">Професія: <span class="hidden-attribute">${player.profession}</span></label></li>
                    <li><label data-attribute-id="health">Стан здоров'я: <span class="hidden-attribute">${player.health}</span></label></li>
                    <li><label data-attribute-id="skills">Навички: <span class="hidden-attribute">${player.skill}</span></label></li>
                   <li><label data-attribute-id="items">Предмети в рюкзаку: <span class="hidden-attribute">${Array.isArray(player.backpack) ? player.backpack.join(', ') : player.backpack}</span></label></li>
                    <li><label data-attribute-id="flaws">Вади: <span class="hidden-attribute">${player.flaw}</span></label></li>
                </ul>
            </div>
        </div>`;
    });
    modalContainer.innerHTML += modalsHtml;


    const positions = {
        6: { top: 1, sides: 2 },
        7: { top: 2, sides: 2 },
        8: { top: 3, sides: 2 },
        9: { top: 2, sides: 3 },
        10: { top: 3, sides: 3 },
        11: { top: 4, sides: 3 },
        12: { top: 5, sides: 3 }
    };
    const config = positions[numPlayers] || positions[6];

    let html = `<div class="player"><span class="player-name">${dbData.playerInfo.nickname || 'Ви'}</span><button class="player-card" id="openModal"></button></div>`;
  
    html += '<div class="up-and-down">';
    html += '<div class="up-players">';
    for (let i = 1; i <= config.top; i++) {
        const player = dbData.otherPlayers[i - 1];
        console.log(`Rendering player ${i}:`, player);
        html += `<div class="player-up">
        <button class="player-circle" id="player${i}" data-player-id="${player?.player_id}" style="background-color: ${player?.color || '#FFFFFF'};"></button>
        <span class="player-name">${player?.nickname || 'Гравець ' + i}</span>
    </div>`;
    }
    html += '</div>';
    html += '</div>';

    html += '<div class="left-and-right">';
    html += '<div class="side-players">';
    for (let i = config.top + 1; i <= config.top + config.sides; i++) {
        const player = dbData.otherPlayers[i - 1];
        console.log(`Rendering player ${i}:`, player);
         html += `<div class="player-left"><button class="player-circle" data-player-id="${player?.player_id}" id="player${i}"></button><span class="player-name">${player?.nickname || 'Гравець ' + i}</span></div>`;
    }
    html += '</div><div class="side-players">';
    for (let i = config.top + config.sides + 1; i <= numPlayers - 1; i++) {
        const player = dbData.otherPlayers[i - 1]; 
        console.log(`Rendering player ${i}:`, player);
        html += `<div class="player-right"><button class="player-circle" data-player-id="${player?.player_id}" id="player${i}"></button><span class="player-name">Гравець ${i}</span></div>`;
    }
    html += '</div></div>';
    mainContainer.innerHTML = html;

   
    function closeAllModals() {
        document.getElementById("playerModal").classList.remove("open");
        document.querySelector(".player-card").style.opacity = "1";
        document.querySelector(".player-card").style.pointerEvents = "auto";
        for (let i = 1; i < numPlayers; i++) {
            const modal = document.getElementById(`playerModal${i}`);
            if (modal) {
                modal.classList.remove("open");
            }
        }
    }


    const openBtn = document.getElementById("openModal");
    const closeBtn = document.getElementById("closeModal");
    const modal = document.getElementById("playerModal");
    const playerCard = document.querySelector(".player-card");
    openBtn.addEventListener("click", () => {
        closeAllModals();
        modal.classList.add("open");
        playerCard.style.opacity = "0";
        playerCard.style.pointerEvents = "none";
    });
    closeBtn.addEventListener("click", () => {
        modal.classList.remove("open");
        playerCard.style.opacity = "1";
        playerCard.style.pointerEvents = "auto";
    });

    const confirmBtn = document.getElementById("confirmSelection");
    confirmBtn.addEventListener("click", () => {
        const selectedRadio = document.querySelector('#playerModal input[type="radio"]:checked');
        if (selectedRadio) {
            selectedRadio.style.display = "none"; 
         
            const label = document.querySelector(`label[for="${selectedRadio.id}"]`);
            if (label) {
                label.style.pointerEvents = "none";
            }
        }
    });


    dbData.otherPlayers.forEach((player, index) => {
        const playerButton = document.getElementById(`player${index + 1}`);
        const playerModal = document.getElementById(`playerModal${index + 1}`);
        const closePlayerModal = document.getElementById(`closeModal${index + 1}`);
        if (playerButton && playerModal && closePlayerModal) {
            playerButton.addEventListener("click", () => {
                closeAllModals();
                playerModal.classList.add("open");
            });
            closePlayerModal.addEventListener("click", () => {
                playerModal.classList.remove("open");
            });
        }
    });

    const startVoteButton = document.getElementById('startVoteButton');
    const voteModal = document.getElementById('voteModal');
    const closeVoteModal = document.getElementById('closeVoteModal');
    const confirmVoteButton = document.getElementById('confirmVote');
    const voteForm = document.getElementById('voteForm');
    const socket = io();

    const isPlayerHost = sessionStorage.getItem('is_host') === 'true';

    function createVotingOptions(numPlayers) {
        let votingOptionsHtml = '';
       
        dbData.otherPlayers.forEach((player, index) => {
            votingOptionsHtml += `
                <div class="vote-option">
                    <input type="radio" id="vote-player${index + 1}" name="vote" value="${player.player_id}">
                    <label for="vote-player${index + 1}">${player.nickname || `Гравець ${index + 1}`}</label>
                </div>
            `;
        });
        if (voteForm) {
            voteForm.innerHTML = votingOptionsHtml;
        }
    }


    createVotingOptions(numPlayers);

    socket.on('roomJoined', function(data) {
        const { position, isHost } = data;
      
        console.log(`Гравець зайшов у кімнату. Роль: ${isPlayerHost ? 'Хост' : 'Гравець'}`);
        if (startVoteButton) {
          
            startVoteButton.style.display = isPlayerHost ? 'block' : 'none';
            console.log(`Кнопка "Почати голосування" показана для хоста: ${isPlayerHost}`);
        
            startVoteButton.onclick = () => {
                if (!isPlayerHost) {
                    alert("Ви не є хостом!");
                    return;
                }
                closeAllModals(); 
                voteModal.classList.add('open');
                console.log('Модальне вікно голосування відкрито.');
            };
        }
    });


    if (closeVoteModal) {
        closeVoteModal.addEventListener('click', () => {
            voteModal.classList.remove('open');
            console.log('Модальне вікно голосування закрито.');
        });
    }


    if (confirmVoteButton) {
        confirmVoteButton.addEventListener('click', () => {
            const selectedPlayer = document.querySelector('input[name="vote"]:checked');
            if (!selectedPlayer) {
                alert("Будь ласка, виберіть гравця для вигнання!");
                return;
            }
            const playerId = selectedPlayer.value;
            const roomCode = sessionStorage.getItem('room_code');
     
            socket.emit('kickPlayer', { room_code: roomCode, playerId });
          
            voteModal.classList.remove('open');
            console.log(`Гравець з ID ${playerId} вигнаний.`);
        });
    }


    function renderPlayersList(players) {
        const playersContainer = document.querySelector('.main-fifth');
        playersContainer.innerHTML = ''; 
        players.forEach((player, index) => {
            console.log(player);
            const playerHtml = `
                <div class="player">
                    <button class="player-circle" id="player${player.playerId}" style="background-color: ${player.color || '#FFFFFF'};"></button>
                    <span class="player-name">${player.nickname}</span>
                    ${isHost() && index > 0 ? `<button class="kick-button" data-player-id="${player.playerId}">Вигнати</button>` : ''}
                </div>
            `;
            playersContainer.innerHTML += playerHtml;
        });

      
        if (startVoteButton) {
            startVoteButton.style.display = isHost() ? 'block' : 'none';
        }

     
        if (isHost()) {
            document.querySelectorAll('.kick-button').forEach(button => {
                button.addEventListener('click', () => {
                    const playerId = button.getAttribute('data-player-id');
                    const roomCode = sessionStorage.getItem('room_code');
                    socket.emit('kickPlayer', { room_code: roomCode, playerId });
                    console.log(`Відправлено запит на вигнання гравця з ID ${playerId}`);
                });
            });
        }
    }

  
    socket.on('roomUpdate', function(data) {
        const { players } = data;
        renderPlayersList(players);
    });

    
    socket.on('playerKicked', function(data) {
        const { playerId } = data;
        console.log('Отримано команду кікнути гравця з ID:', playerId);
 
        const playerCircle = document.querySelector(`button.player-circle[data-player-id="${playerId}"]`);
        if (playerCircle) {
            playerCircle.style.opacity = 0.5;
            playerCircle.disabled = true;
            console.log(`Гравець з ID ${playerId} вигнаний.`);
        } else {
            console.warn(`Не знайдено гравця з ID ${playerId}`);
        }
    });

    const openBtnRules = document.getElementById("openModalRules");
    const closeBtnRules = document.getElementById("closeModalRules");
    const modalRules = document.getElementById("modalRules");
    openBtnRules.addEventListener("click", () => {
        modalRules.classList.add("open");
    });
    closeBtnRules.addEventListener("click", () => {
        modalRules.classList.remove("open");
    });

  
const timerElement = document.getElementById('timer');
const startBtn = document.getElementById('startBtn');
const resetBtn = document.getElementById('resetBtn');


function updateTimerDisplay(timeLeft) {
    const mins = Math.floor(timeLeft / 60).toString().padStart(2, '0');
    const secs = (timeLeft % 60).toString().padStart(2, '0');
    timerElement.textContent = `${mins}:${secs}`;
}


startBtn.addEventListener('click', () => {
    const roomCode = sessionStorage.getItem('room_code');
    if (isHost()) {
        socket.emit('startTimer', { room_code: roomCode }); 
    } else {
        alert("Ви не є хостом!");
    }
});


resetBtn.addEventListener('click', () => {
    const roomCode = sessionStorage.getItem('room_code');
    if (isHost()) {
        socket.emit('stopTimer', { room_code: roomCode }); 
    } else {
        alert("Ви не є хостом!");
    }
});


socket.on('updateTimer', function(data) {
    const { timeLeft } = data;
    updateTimerDisplay(timeLeft); 
});


socket.on('timerFinished', function() { 
    updateTimerDisplay(0); 
});


socket.on('timerStopped', function() {
    updateTimerDisplay(60); 
});
    


 
    socket.on('connect', function() {
        console.log('Сокет підключено успішно. ID сокета:', socket.id);

        const roomCode = sessionStorage.getItem('room_code');
        if (roomCode) {
            socket.emit('joinGameRoom', { room_code: roomCode });
            console.log('Відправлено запит на приєднання до кімнати:', roomCode);
        }
    });

    socket.on('disconnect', function() {
        console.log('Сокет відключено');
    });

    socket.on('error', function(error) {
        console.error('Помилка сокета:', error);
    });


    function testSocketConnection() {
        const roomCode = sessionStorage.getItem('room_code');
        if (roomCode) {
            socket.emit('testConnection', { message: "Тестове повідомлення", room_code: roomCode });
            console.log('Відправлено тестове повідомлення до кімнати:', roomCode);
        }
    }


    socket.on('testResponse', function(data) {
        console.log('Отримано відповідь на тестове повідомлення:', data);
    });

 
    socket.on('updateAttributeVisibility', function(data) {
        const { players } = data;
    
        players.forEach(player => {
            const modal = document.querySelector(`.modal[data-player-id="${player.player_id}"]`);
            if (modal) {
                const labels = modal.querySelectorAll('label[data-attribute-id]');
                
                labels.forEach(label => {
                    const attributeId = label.getAttribute('data-attribute-id');
                    const span = label.querySelector('span');
                    
                    if (span) {
                        let value = '';
                        
                        switch(attributeId) {
                            case 'gender':
                                value = player.gender ? `${player.gender}` : null;
                                break;
                            case 'age':
                                value = player.age || null;
                                break;
                            case 'profession':
                                value = player.job || null;
                                break;
                            case 'health':
                                value = player.health || null;
                                break;
                            case 'skills':
                                value = player.hobby || null;
                                break;
                            case 'items':
                                value = player.items || null;
                                break;
                            case 'flaws':
                                value = player.vada || null;
                                break;
                        }
                        
                      
                        if (value) {
                            span.textContent = value;
                            span.style.opacity = '1';
                        } else {
                            span.textContent = '';
                            span.style.opacity = '0';
                        }
                    }
                });
            }
        });
    });

  
    document.querySelectorAll('#playerModal input[type="radio"]').forEach(radio => {
        radio.addEventListener('click', async () => {
            const playerId = sessionStorage.getItem('player_id');
            const attributeId = radio.id; 
            const roomCode = sessionStorage.getItem('room_code');
            const playerNickname = document.querySelector('#playerModal h3').textContent || 'ВИ';

            if (!playerId || !roomCode) {
                console.error('Відсутні дані для надсилання оновлення.', { playerId, attributeId, roomCode });
                return;
            }

          
            const selfModal = document.getElementById('playerModal');
            const selfModalLabel = selfModal.querySelector(`label[for="${attributeId}"]`);
            if (!selfModalLabel) {
                console.error(`Мітка для атрибута ${attributeId} не знайдена.`);
                return;
            }

            const span = selfModalLabel.querySelector('span');
            if (!span) {
                console.error(`Span для атрибута ${attributeId} не знайдений.`);
                return;
            }

            const attributeValue = span.textContent.trim(); 
            console.log(`Відправляємо відкриття атрибуту: ${attributeId} (${attributeValue}) для гравця ${playerId} (${playerNickname})`);

          
            span.style.opacity = '1';
            console.log('Зроблено видимим атрибут для себе');

           
            socket.emit('revealAttribute', { 
                playerId, 
                attributeId, 
                roomCode,
                playerNickname,
                attributeValue 
            });
        });
    });
});