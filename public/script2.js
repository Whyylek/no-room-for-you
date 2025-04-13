function generateRoomCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}
document.addEventListener("DOMContentLoaded", function () {
    const nicknameSpan = document.getElementById("nickname");

    const player_id = sessionStorage.getItem('player_id');
    fetch(`http://localhost:3000/api/get-nickname/${player_id}`)
        .then(response => {
            if (!response.ok) throw new Error('Помилка сервера');
            return response.json();
        })
        .then(data => {
            const savedNickname = data.nickname;
            nicknameSpan.textContent = savedNickname || "Гравець";
        })
        .catch(error => {
            console.error("❌ Помилка при отриманні нікнейму:", error);
            nicknameSpan.textContent = "Гравець";
        });
});

const openBtn = document.getElementById("openModal");
const closeBtn = document.getElementById("closeModal");
const modal = document.getElementById("modal");
const urlInput = document.querySelector(".url-input");
const modalMessage = document.createElement("p");

document.querySelector('.url-container').appendChild(modalMessage);

// ✅ Кнопка "СТВОРИТИ"
document.querySelector('.buttons-main button').addEventListener("click", async () => {
    
    
    sessionStorage.setItem('is_host', 'true');
    const room_code = generateRoomCode()
    sessionStorage.setItem('room_code', room_code); 
    await createRoom(6, room_code);
    // чекаємо завершення
    window.location.href = 'third-page.html'; // перехід після збереження room_code
});


// ✅ Кнопка "ПРИЄДНАТИСЯ"
openBtn.addEventListener("click", () => {
    modal.classList.add("open");
});

closeBtn.addEventListener("click", () => {
    modal.classList.remove("open");
    modalMessage.textContent = '';
});

const submitBtn = document.querySelectorAll(".modal-button")[1];

submitBtn.addEventListener("click", () => {
    const inputValue = urlInput.value.trim();

    if (inputValue.length !== 6) {
        modalMessage.textContent = 'Код повинен складатися з 6 символів!';
        return;
    }

    modalMessage.textContent = '';

    fetch('http://localhost:3000/api/find-room', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            room_code: inputValue,
            player_id: sessionStorage.getItem('player_id')
        })
    })
        .then(response => {
            if (!response.ok) throw new Error('Помилка при перевірці коду');
            return response.json();
        })
        .then(data => {
            if (data.valid) {
                sessionStorage.setItem('room_code', inputValue);
                sessionStorage.setItem('is_host', 'false'); // <- додано

                window.location.href = 'third-page.html';
            } else {
                modalMessage.textContent = 'Невірний код. Спробуйте ще раз.';
            }
        })
        .catch(error => {
            console.error("❌ Помилка при перевірці коду:", error);
            modalMessage.textContent = 'Сталася помилка при перевірці коду.';
        });
});


async function createRoom(playerNumber, roomCode) {
    try {
      const response = await fetch('http://localhost:3000/api/create-room', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          player_number: playerNumber,
          player_id: sessionStorage.getItem('player_id'),
          room_code: roomCode
        }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`HTTP error! Status: ${response.status} - ${errorData.error}`);
      }
  
      const data = await response.json();
      //sessionStorage.setItem('room_code', data.room_code);
      console.log('✅ Кімнату створено:', data);
      if (data.room_code) {
        roomCode = data.room_code;
        
      } else {
        console.error('❌ Помилка: room_code відсутній у відповіді сервера.');
      }
      console.log(sessionStorage.getItem('room_code'))
    } catch (error) {
      console.error('❌ Помилка створення кімнати:', error.message || error);
    }
   
  }

  function generateRoomCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}
