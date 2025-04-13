async function getPlayersCount() {
    try {
        const response = await fetch('/api/players_count'); // Запит до API
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json(); // Парсимо JSON відповідь
        return data.players_count; // Повертаємо кількість гравців
    } catch (error) {
        console.error('Помилка при отриманні кількості гравців:', error);
        return 0; // Якщо сталася помилка, повертаємо 0
    }
}

// Функція для оновлення списку переможців на основі кількості гравців
async function updateWinners() {
    const numberOfPlayers = await getPlayersCount(); // Отримуємо кількість гравців

    let winnersCount = 0;
    if (numberOfPlayers >= 6 && numberOfPlayers <= 8) {
        winnersCount = 3;
    } else if (numberOfPlayers >= 9 && numberOfPlayers <= 10) {
        winnersCount = 4;
    } else if (numberOfPlayers === 11) {
        winnersCount = 5;
    } else if (numberOfPlayers === 12) {
        winnersCount = 6;
    }

    // Знайдемо контейнер для переможців
    const winnersContainer = document.getElementById('winners-container');
    
    // Очищаємо контейнер перед додаванням нових елементів
    winnersContainer.innerHTML = ''; 

    // Очищаємо попередні класи для контейнера
    winnersContainer.classList.remove('three-players', 'four-players', 'five-players', 'six-players');

    // Додаємо відповідну кількість переможців
    for (let i = 1; i <= winnersCount; i++) {
        const playerDiv = document.createElement('div');
        playerDiv.classList.add('player');
        playerDiv.innerHTML = `<span>Гравець ${i}</span>`;
        winnersContainer.appendChild(playerDiv);
    }

    // Додаємо відповідний клас в залежності від кількості переможців
    if (winnersCount === 3) {
        winnersContainer.classList.add('three-players'); // 3 переможці в один ряд
    } else if (winnersCount === 4) {
        winnersContainer.classList.add('four-players'); // 4 переможці в 2 ряди
    } else if (winnersCount === 5) {
        winnersContainer.classList.add('five-players'); // 5 переможців: 2 ряди по 2, 1 в центрі
    } else if (winnersCount === 6) {
        winnersContainer.classList.add('six-players'); // 6 переможців: 3 ряди по 2
    }
}

// Викликаємо функцію для оновлення переможців після завантаження сторінки
updateWinners();


// const numberOfPlayers =12; // Замініть це число для тестування

// function updateWinners() {
//     let winnersCount = 0;

//     // Визначаємо кількість переможців на основі кількості гравців
//     if (numberOfPlayers >= 6 && numberOfPlayers <= 8) {
//         winnersCount = 3;
//     } else if (numberOfPlayers >= 9 && numberOfPlayers <= 10) {
//         winnersCount = 4;
//     } else if (numberOfPlayers === 11) {
//         winnersCount = 5;
//     } else if (numberOfPlayers === 12) {
//         winnersCount = 6;
//     }

//     // Знайдемо контейнер для переможців
//     const winnersContainer = document.getElementById('winners-container');
//     winnersContainer.innerHTML = ''; // Очищаємо контейнер перед додаванням нових елементів

//     // Додаємо відповідну кількість переможців
//     for (let i = 1; i <= winnersCount; i++) {
//         const playerDiv = document.createElement('div');
//         playerDiv.classList.add('player');
//         playerDiv.innerHTML = `<span>Гравець ${i}</span>`;
//         winnersContainer.appendChild(playerDiv);
//     }

//     // Змінюємо стилі залежно від кількості переможців
//     winnersContainer.classList.remove('three-players', 'four-players', 'five-players', 'six-players'); // Очищаємо попередні класи

//     if (winnersCount === 3) {
//         winnersContainer.classList.add('three-players'); // 3 переможці в один ряд
//     } else if (winnersCount === 4) {
//         winnersContainer.classList.add('four-players'); // 4 переможці в 2 ряди
//     } else if (winnersCount === 5) {
//         winnersContainer.classList.add('five-players'); // 5 переможців: 2 ряди по 2, 1 в центрі
//     } else if (winnersCount === 6) {
//         winnersContainer.classList.add('six-players'); // 6 переможців: 3 ряди по 2
//     }
// }

// // Викликаємо функцію для оновлення переможців після завантаження сторінки
// document.addEventListener('DOMContentLoaded', updateWinners);
