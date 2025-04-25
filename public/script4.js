document.addEventListener('DOMContentLoaded', () => {
    const prevButton = document.getElementById('prev-story');
    const nextButton = document.getElementById('next-story');
    const chooseButton = document.querySelector('.button'); 
    let currentStoryId = 0;
    const roomCode = sessionStorage.getItem('room_code'); 

const player_id = sessionStorage.getItem('player_id');
    const isHost = sessionStorage.getItem('is_host') === 'true';
    const socket = io(); 

    if (!roomCode) {
        alert('Код кімнати не знайдено. Будь ласка, створіть кімнату спочатку.');
        return;
    }

    console.log('Отриманий room_code:', roomCode);
    console.log('Is host:', isHost);
    socket.emit('joinRoom', { room_code: roomCode, player_id: player_id });


    function loadStory(storyId) {
        fetch(`https://no-room-for-you-f8419decc423.herokuapp.com/api/stories/${storyId}`)
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
                document.getElementById('history-title').innerHTML = 'Помилка при завантаженні історії.';
                document.getElementById('history-subtitle').style.display = 'none';
                document.getElementById('story-name').innerHTML = 'Номер історії недоступний.';
            });
    }


    if (isHost) {
        prevButton.addEventListener('click', () => {
            if (currentStoryId > 1) {
                currentStoryId--;
                const newStoryId = currentStoryId % 20 + 1;
                loadStory(newStoryId);
                socket.emit('changeStory', { room_code: roomCode, story_id: newStoryId });
            }
        });

        nextButton.addEventListener('click', () => {
            currentStoryId++;
            const newStoryId = currentStoryId % 20 + 1;
            loadStory(newStoryId);
            socket.emit('changeStory', { room_code: roomCode, story_id: newStoryId }); 
        });

  
        chooseButton.addEventListener('click', async (event) => {
            event.preventDefault(); 
            try {
                const chosenStoryId = currentStoryId % 20 + 1;
                const response = await fetch('https://no-room-for-you-f8419decc423.herokuapp.com/api/update-room-story', {
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
                    socket.emit('chooseStory', { room_code: roomCode, story_id: chosenStoryId });
                    window.location.href = 'fifth-page.html'; 
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
       
        prevButton.disabled = true;
        nextButton.disabled = true;
        chooseButton.disabled = true;
    }

   
    socket.on('updateStory', ({ story_id }) => {
        console.log('Отримана нова історія від хоста:', story_id);
        loadStory(story_id);
    });

    socket.on('storyChosen', () => {
        console.log('Хост обрав історію. Переходимо на п\'яту сторінку...');
        window.location.href = 'fifth-page.html'; 
    });

 
    loadStory(currentStoryId + 1);
});