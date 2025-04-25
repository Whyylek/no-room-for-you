

const socket = io('https://no-room-for-you-f8419decc423.herokuapp.com');
const room_code = sessionStorage.getItem('room_code');
const player_id = sessionStorage.getItem('player_id');
const isHost = sessionStorage.getItem('is_host') === 'true';
let usedColorsArr = [];
socket.on('connect', () => {
    console.log('🟢 Підключено до сервера. Socket ID:', socket.id);
    socket.emit('joinRoom', { room_code, player_id });
});

let playerPosition = null;


socket.on('roomJoined', ({ position, playersInRoom }) => {
    console.log(`📦 Ви — Гравець ${position}`);
    playerPosition = position;
    updatePlayersUI(playersInRoom);
});


socket.on('roomUpdate', ({ players, usedColors }) => {
    updatePlayersUI(players);
    usedColorsArr = usedColors;
    updateColorButtons(usedColors); 
});


function updatePlayersUI(players) {
    const playersList = document.getElementById('players-list');
    playersList.innerHTML = '';
    players.forEach(player => {
        const playerName = player.playerId == player_id ? `${player.nickname} (Ви)` : player.nickname;
        const playerDiv = createPlayerElement(playerName, `player-${player.playerId}`, player.color);
        playersList.appendChild(playerDiv);
    });
}


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


const startGameButton = document.getElementById('startGameButton');

startGameButton.addEventListener('click', () => {
    if (!isHost) {
        alert('Лише хост може починати гру!');
        return;
    }
 
    socket.emit('checkPlayerCount', { room_code });
});


socket.on('playerCountResponse', ({ playerCount }) => {
    if (playerCount < 1) { 
        alert('Гра може починатися лише при 6 або більше гравцях!');
        return;
    }
   
    socket.emit('startGame', { room_code });
});


socket.on('redirectPlayers', () => {
    window.location.href = 'fourth-page.html'; 
});


startGameButton.addEventListener('click', () => {
    if (!isHost) {
        alert('Лише хост може починати гру!');
        return;
    }


    socket.emit('checkPlayerCount', { room_code });
});


socket.on('playerCountResponse', ({ playerCount }) => {
    if (playerCount < 1) {
        alert('Гра може починатися лише при 6 або більше гравцях!');
        return;
    }

   
    window.location.href = 'fourth-page.html';
});


document.querySelector('.button2').addEventListener('click', function () {
    const roomCode = sessionStorage.getItem('room_code'); 
    if (!roomCode) {
        alert('Код кімнати не знайдено!');
        return;
    }


    const tempInput = document.createElement('input');
    document.body.appendChild(tempInput);
    tempInput.value = roomCode; 
    tempInput.select();
    document.execCommand('copy');
    document.body.removeChild(tempInput);

   
    const message = document.getElementById('copyMessage');
    message.textContent = 'Код кімнати успішно скопійовано!';
    message.style.display = 'block';


    setTimeout(function () {
        message.style.display = 'none';
    }, 2000);
});

const openBtnRules = document.getElementById("openModal");
const closeBtnRules = document.getElementById("closeModal");
const modalRules = document.getElementById("modal");

openBtnRules.addEventListener("click", () => {
    modalRules.classList.add("open");
});

closeBtnRules.addEventListener("click", () => {
    modalRules.classList.remove("open");
});