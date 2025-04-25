document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("nicknameForm");

    if (form) {
        form.addEventListener("submit", async function (event) {
            event.preventDefault(); 

            const nicknameInput = document.getElementById("name");
            const nickname = nicknameInput.value.trim();

            console.log('➡️ Відправляємо нікнейм:', nickname); 

            if (!nickname) {
                alert("Будь ласка, введіть ім'я!");
                return;
            }

            
                const response = await fetch('https://no-room-for-you-f8419decc423.herokuapp.com/api/save-nickname', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({ nickname })
                });

                console.log('⬅️ Відповідь від сервера:', response); 
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(`HTTP error! Status: ${response.status} - ${errorData.error}`);
                }

                const data = await response.json();
                console.log('✅ Успішна відповідь:', data);
                sessionStorage.setItem('player_id', data.id);
                window.location.href = "second-page.html"; 
           
            
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