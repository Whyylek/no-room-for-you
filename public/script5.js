window.addEventListener('DOMContentLoaded', async function () {
    // Функція для отримання даних з сервера
    async function fetchDataFromDB() {
        try {
            const player_id = sessionStorage.getItem('player_id'); // Отримуємо player_id з sessionStorage
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

    // Отримуємо дані з сервера
    const dbData = await fetchDataFromDB();
    const numPlayers = dbData.numPlayers || 6;
    const mainContainer = document.querySelector('.main-fifth');
    const modalContainer = document.getElementById('modalContainer');
    dbData.otherPlayers.forEach(player => {
        if (typeof player.backpack === 'string') {
            player.backpack = player.backpack.split(',').map(item => item.trim());
        }
    });
    // Оновлюємо модальне вікно користувача з даними з БД
    const playerModalHtml = `
    <div class="modal" id="playerModal">
        <div class="modal-inner">
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
                     <label for="profession">Професія: <span>${dbData.playerInfo.profession}</span></label>
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
                     <label for="items">Предмети в рюкзаку: <span>${dbData.playerInfo.backpack}</span></label>
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

    // Генеруємо HTML для модальних вікон інших гравців
    let modalsHtml = '';
    dbData.otherPlayers.forEach((player, index) => {
        modalsHtml += `
        <div class="modal" id="playerModal${index + 1}">
            <div class="modal-inner">
                <button class="modal-close" id="closeModal${index + 1}">✖</button>
                <h2 class="kartka">КАРТКА:</h2>
                <div class="player-header-container">
                     <h3>${player.nickname}</h3>
                </div>
                <ul class="player-info player-info-other">
                    <li>Стать: <span>${player.gender} (${player.childfreeStatus})</span></li>
                    <li>Вік: <span>${player.age}</span></li>
                    <li>Професія: <span>${player.profession}</span></li>
                    <li>Стан здоров'я: <span>${player.health}</span></li>
                    <li>Навички: <span>${player.skill}</span></li>
                    <li>Предмети в рюкзаку: <span>${player.backpack}</span></li>
                    <li>Вади: <span>${player.flaw}</span></li>
                </ul>
            </div>
        </div>`;
    });
    modalContainer.innerHTML += modalsHtml;

    // Конфігурація для розміщення гравців на сторінці
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

    // Генеруємо основний HTML для розміщення гравців
    // Додаємо головного гравця в контейнер першим, щоб він був під іншими елементами
    let html = `<div class="player"><span class="player-name">${dbData.playerInfo.nickname || 'Ви'}</span><button class="player-card" id="openModal"></button></div>`;
    
    // Додаємо верхніх гравців
    html += '<div class="up-and-down">';
    html += '<div class="up-players">';
    for (let i = 1; i <= config.top; i++) {
        const player = dbData.otherPlayers[i - 1];
         html += `<div class="player-up"><button class="player-circle" id="player${i}"></button><span class="player-name">${player?.nickname || 'Гравець ' + i}</span></div>`;
    }
    html += '</div>';
    html += '</div>';
    
    // Додаємо бічних гравців
    html += '<div class="left-and-right">';
    html += '<div class="side-players">';
    for (let i = config.top + 1; i <= config.top + config.sides; i++) {
        const player = dbData.otherPlayers[i - 1];
         html += `<div class="player-left"><button class="player-circle" id="player${i}"></button><span class="player-name">${player?.nickname || 'Гравець ' + i}</span></div>`;
    }
    html += '</div><div class="side-players">';
    for (let i = config.top + config.sides + 1; i <= numPlayers - 1; i++) {
        html += `<div class="player-right"><button class="player-circle" id="player${i}"></button><span class="player-name">Гравець ${i}</span></div>`;
    }
    html += '</div></div>';
    
    mainContainer.innerHTML = html;

    // Функція для закриття всіх модальних вікон
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

    // Додаємо обробники подій для модального вікна користувача
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
            selectedRadio.style.display = "none"; // Hide the radio button
            
            // Get the label associated with this radio button
            const label = document.querySelector(`label[for="${selectedRadio.id}"]`);
            if (label) {
                label.style.pointerEvents = "none";
            }
        }
    });
    // Додаємо обробники подій для інших гравців
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

    // Функція для створення опцій голосування
    function createVotingOptions(numPlayers) {
        let votingOptionsHtml = '';
        
        // Додаємо опції для всіх гравців, крім головного (Ви)
        for (let i = 1; i < numPlayers; i++) {
            votingOptionsHtml += `
                <div class="vote-option">
                    <input type="radio" id="vote-player${i}" name="vote" value="${i}">
                    <label for="vote-player${i}">${dbData.otherPlayers[i - 1]?.nickname || `Гравець ${i}`}</label>
                </div>
            `;
        }
        
        if (voteForm) {
            voteForm.innerHTML = votingOptionsHtml;
        }
    }

    // Створюємо опції голосування на основі кількості гравців
    createVotingOptions(numPlayers);

    startVoteButton.addEventListener('click', () => {
        closeAllModals(); // Закриваємо всі інші модальні вікна
        voteModal.classList.add('open');
        console.log('Відкрито модальне вікно голосування');
    });

    // Закриваємо модальне вікно голосування
    closeVoteModal.addEventListener('click', () => {
        voteModal.classList.remove('open');
        console.log('Закрито модальне вікно голосування');
    });
    confirmVoteButton.addEventListener("click", () => {
        const selectedPlayer = document.querySelector('input[name="vote"]:checked');
        
        if (selectedPlayer) {
            const playerNumber = selectedPlayer.value;
            
            // Знімаємо ефект проголосованості з усіх гравців
            for (let i = 1; i < numPlayers; i++) {
                const playerElement = document.getElementById(`player${i}`);
                if (playerElement) {
                    playerElement.parentElement.classList.remove("voted");
                }
            }
            
            // Застосовуємо ефект проголосованості до вибраного гравця
            const votedPlayerElement = document.getElementById(`player${playerNumber}`);
            if (votedPlayerElement) {
                votedPlayerElement.parentElement.classList.add("voted");
            }
            
            // Закриваємо модальне вікно
            voteModal.classList.remove("open");
        } else {
            // Попередження, якщо жоден гравець не вибраний
            alert("Будь ласка, виберіть гравця для голосування!");
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
});