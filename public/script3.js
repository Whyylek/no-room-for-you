
// Socket.IO підключення
const socket = io('http://localhost:3000');
const room_code = sessionStorage.getItem('room_code');
const player_id = sessionStorage.getItem('player_id');
const isHost = sessionStorage.getItem('is_host') === 'true';
let usedColorsArr = [];
socket.on('connect', () => {
    console.log('🟢 Підключено до сервера. Socket ID:', socket.id);
    socket.emit('joinRoom', { room_code, player_id });
});

let playerPosition = null;

// Обробка відповіді на приєднання
socket.on('roomJoined', ({ position, playersInRoom }) => {
    console.log(`📦 Ви — Гравець ${position}`);
    playerPosition = position;
    updatePlayersUI(playersInRoom);
});

// Обробка оновлення списку гравців кімнати
socket.on('roomUpdate', ({ players, usedColors }) => {
    updatePlayersUI(players);
    usedColorsArr = usedColors;
    updateColorButtons(usedColors); // Оновлюємо кнопки кольорів
});

// Оновлення UI гравців
function updatePlayersUI(players) {
    const playersList = document.getElementById('players-list');
    playersList.innerHTML = '';
    players.forEach(player => {
        const playerName = player.playerId == player_id ? `${player.nickname} (Ви)` : player.nickname;
        const playerDiv = createPlayerElement(playerName, `player-${player.playerId}`, player.color);
        playersList.appendChild(playerDiv);
    });
}

// Створення елемента гравця
function createPlayerElement(playerName, playerClass, playerColor) {
    const playerDiv = document.createElement('div');
    playerDiv.classList.add('players', playerClass);

    const playerText = document.createElement('span');
    playerText.classList.add('players-text');
    playerText.textContent = playerName;

    const playerColorButton = document.createElement('button');
    playerColorButton.classList.add('players-color');
    playerColorButton.style.backgroundColor = playerColor || '#FFFFFF';
    playerColorButton.onclick = function () {
        openModal(playerColorButton);
    };

    playerDiv.appendChild(playerText);
    playerDiv.appendChild(playerColorButton);
    return playerDiv;
}

// Відкриття модального вікна для вибору кольору
function openModal(playerElement) {
    const playerClasses = playerElement.closest('.players').classList;
    const currentPlayerClass = `player-${player_id}`;
    if (playerClasses.contains(currentPlayerClass)) {
        window.selectedPlayerElement = playerElement;
        document.getElementById('colorModal').style.display = 'block';
    } else {
        alert('Ви не можете змінювати колір іншого гравця!');
    }
}

function closeModal() {
    document.getElementById('colorModal').style.display = 'none';
}

function selectColor(color) {
    //const usedColors = Array.from(document.querySelectorAll('.players-color')).map(el => el.style.backgroundColor);
    console.log(usedColorsArr);
    if (window.selectedPlayerElement && window.selectedPlayerElement.closest('.players').classList.contains(`player-${player_id}`)) {
        if (!usedColorsArr.includes(color)) {
            window.selectedPlayerElement.style.backgroundColor = color;
            socket.emit('colorChange', { color, playerId: player_id });
            closeModal();
        } else {
            alert('Цей колір вже вибрали!');
        }
    }
}

function updateColorButtons(usedColors) {
    const colorButtons = document.querySelectorAll('.color-button');
    colorButtons.forEach(button => {
        const buttonColor = button.style.backgroundColor;
        if (usedColors.includes(buttonColor)) {
            button.disabled = true;
            button.style.backgroundColor = '#D9D9D9';
            button.style.borderColor = '#B0B0B0';
            button.style.cursor = 'not-allowed';
        } else {
            button.disabled = false;
            button.style.backgroundColor = buttonColor;
            button.style.borderColor = buttonColor;
            button.style.cursor = 'pointer';
        }
    });
}

// Отримуємо кнопку "Початок гри"
const startGameButton = document.getElementById('startGameButton');
// Обробник події для кнопки "Початок гри"
startGameButton.addEventListener('click', () => {
    if (!isHost) {
        alert('Лише хост може починати гру!');
        return;
    }
    // Перевіряємо кількість гравців
    socket.emit('checkPlayerCount', { room_code });
});

// Обробка відповіді від сервера про кількість гравців
socket.on('playerCountResponse', ({ playerCount }) => {
    if (playerCount < 1) { // Мінімум 6 гравців для початку гри
        alert('Гра може починатися лише при 6 або більше гравцях!');
        return;
    }
    // Якщо всі умови виконані, повідомляємо сервер про початок гри
    socket.emit('startGame', { room_code });
});

// Обробка сигналу про початок гри від сервера
socket.on('redirectPlayers', () => {
    window.location.href = 'fourth-page.html'; // Перенаправлення на наступну сторінку
});

// Обробник події для кнопки "Початок гри"
startGameButton.addEventListener('click', () => {
    if (!isHost) {
        alert('Лише хост може починати гру!');
        return;
    }

    // Перевіряємо кількість гравців
    socket.emit('checkPlayerCount', { room_code });
});

// Обробка відповіді від сервера про кількість гравців
socket.on('playerCountResponse', ({ playerCount }) => {
    if (playerCount < 1) {
        alert('Гра може починатися лише при 6 або більше гравцях!');
        return;
    }

    // Якщо всі умови виконані, перенаправляємо на наступну сторінку
    window.location.href = 'fourth-page.html';
});

// Логіка копіювання запрошення
document.querySelector('.button2').addEventListener('click', function () {
    const roomCode = sessionStorage.getItem('room_code'); // Отримуємо код кімнати
    if (!roomCode) {
        alert('Код кімнати не знайдено!');
        return;
    }

    // Створюємо тимчасовий елемент для копіювання
    const tempInput = document.createElement('input');
    document.body.appendChild(tempInput);
    tempInput.value = roomCode; // Копіюємо саме код кімнати
    tempInput.select();
    document.execCommand('copy');
    document.body.removeChild(tempInput);

    // Змінюємо повідомлення на "Код кімнати успішно скопійовано!"
    const message = document.getElementById('copyMessage');
    message.textContent = 'Код кімнати успішно скопійовано!';
    message.style.display = 'block';

    // Приховуємо повідомлення через 2 секунди
    setTimeout(function () {
        message.style.display = 'none';
    }, 2000);
});