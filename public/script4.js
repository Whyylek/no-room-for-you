document.addEventListener('DOMContentLoaded', () => {
    const prevButton = document.getElementById('prev-story');
    const nextButton = document.getElementById('next-story');
    const chooseButton = document.querySelector('.button'); // Кнопка "Обрати"
    let currentStoryId = 0; // Початкове значення історії
    const roomCode = sessionStorage.getItem('room_code'); // Отримуємо код кімнати з сесії

const player_id = sessionStorage.getItem('player_id');
    const isHost = sessionStorage.getItem('is_host') === 'true'; // Перевіряємо, чи є хостом
    const socket = io(); // Підключаємо Socket.IO

    if (!roomCode) {
        alert('Код кімнати не знайдено. Будь ласка, створіть кімнату спочатку.');
        return;
    }

    console.log('Отриманий room_code:', roomCode); // Логування
    console.log('Is host:', isHost);
    socket.emit('joinRoom', { room_code: roomCode, player_id: player_id });

    // Функція для завантаження історії
    function loadStory(storyId) {
        fetch(`http://localhost:3000/api/stories/${storyId}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                console.log('Отримані дані про історію:', data);
                document.getElementById('history-title').innerHTML = data.story || 'Але для початку оберіть історію, що стала причиною для виживання, а не життя.';
                document.getElementById('story-name').innerHTML = data.storyName;
            })
            .catch(error => {
                console.error('Помилка при завантаженні історії:', error);
                document.getElementById('history-title').innerHTML = 'Помилка при завантаженні історії';
                document.getElementById('history-subtitle').style.display = 'none';
                document.getElementById('story-name').innerHTML = 'Номер історії недоступний';
            });
    }

    // Обробники подій для кнопок навігації
    if (isHost) {
        prevButton.addEventListener('click', () => {
            if (currentStoryId > 1) {
                currentStoryId--;
                const newStoryId = currentStoryId % 20 + 1;
                loadStory(newStoryId);
                socket.emit('changeStory', { room_code: roomCode, story_id: newStoryId }); // Повідомляємо інших гравців
            }
        });

        nextButton.addEventListener('click', () => {
            currentStoryId++;
            const newStoryId = currentStoryId % 20 + 1;
            loadStory(newStoryId);
            socket.emit('changeStory', { room_code: roomCode, story_id: newStoryId }); // Повідомляємо інших гравців
        });

        // Обробник події для кнопки "Обрати"
        chooseButton.addEventListener('click', async (event) => {
            event.preventDefault(); // Зупиняємо стандартну поведінку форми
            try {
                const chosenStoryId = currentStoryId % 20 + 1;
                const response = await fetch('http://localhost:3000/api/update-room-story', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        room_code: roomCode,
                        story_id: chosenStoryId,
                    }),
                });
                const data = await response.json();
                if (response.ok) {
                    socket.emit('chooseStory', { room_code: roomCode, story_id: chosenStoryId }); // Повідомляємо інших гравців
                    window.location.href = 'fifth-page.html'; // Переходимо на п'яту сторінку
                } else {
                    console.error('Помилка при виборі історії:', data.error);
                    alert(`Помилка: ${data.error}`);
                }
            } catch (error) {
                console.error('Помилка при виборі історії:', error);
                alert('Сталася помилка. Будь ласка, спробуйте ще раз.');
            }
        });
    } else {
        // Якщо користувач не є хостом, вимикаємо кнопки
        prevButton.disabled = true;
        nextButton.disabled = true;
        chooseButton.disabled = true;
    }

    // Слухачі подій Socket.IO
    socket.on('updateStory', ({ story_id }) => {
        console.log('Отримана нова історія від хоста:', story_id);
        loadStory(story_id); // Завантажуємо нову історію
    });

    socket.on('storyChosen', () => {
        console.log('Хост обрав історію. Переходимо на п\'яту сторінку...');
        window.location.href = 'fifth-page.html'; // Переходимо на п'яту сторінку
    });

    // Завантажуємо першу історію при завантаженні сторінки
    loadStory(currentStoryId + 1);
});