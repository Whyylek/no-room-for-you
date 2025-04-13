document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("nicknameForm");

    if (form) {
        form.addEventListener("submit", async function (event) {
            event.preventDefault(); // Запобігаємо стандартну поведінку форми

            const nicknameInput = document.getElementById("name");
            const nickname = nicknameInput.value.trim();

            console.log('➡️ Відправляємо нікнейм:', nickname); // Логування

            if (!nickname) {
                alert("Будь ласка, введіть ім'я!");
                return;
            }

            
                const response = await fetch('http://localhost:3000/api/save-nickname', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({ nickname })
                });

                console.log('⬅️ Відповідь від сервера:', response); // Логування

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(`HTTP error! Status: ${response.status} - ${errorData.error}`);
                }

                const data = await response.json();
                console.log('✅ Успішна відповідь:', data);
                sessionStorage.setItem('player_id', data.id);
                window.location.href = "second-page.html"; // Переходимо на другу сторінку
           
            
        });
    } else {
        console.error("❌ Форма не знайдена!");
    }

    const openBtn = document.getElementById("openModal");
    const closeBtn = document.getElementById("closeModal");
    const modal = document.getElementById("modal");

    openBtn.addEventListener("click", () => {
        modal.classList.add("open");
    });

    closeBtn.addEventListener("click", () => {
        modal.classList.remove("open");
    });
});