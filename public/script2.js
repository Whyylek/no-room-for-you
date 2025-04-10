document.addEventListener("DOMContentLoaded", function () {
    const nicknameSpan = document.getElementById("nickname");

    // Отримання нікнейму з серверу
    const player_id = sessionStorage.getItem('player_id');
    fetch(`https://no-room-for-you.vercel.app/api/get-nickname/${player_id}`)
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


    fetch('https://no-room-for-you.vercel.app/api/find-room', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ room_code: inputValue, player_id: sessionStorage.getItem('player_id') })
    })
    .then(response => {
        if (!response.ok) throw new Error('Помилка при перевірці коду');
        return response.json();
    })
    .then(data => {
        if (data.valid) {
            sessionStorage.setItem('room_code', inputValue);
            window.location.href = 'third-page.html';
        } else {
            console.log(data);
            modalMessage.textContent = 'Невірний код. Спробуйте ще раз.';
        }
    })
    .catch(error => {
        console.error("❌ Помилка при перевірці коду:", error);
        modalMessage.textContent = 'Сталася помилка при перевірці коду.';
    });
});