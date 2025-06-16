document.addEventListener("DOMContentLoaded", () => {
    const buttons = document.querySelectorAll(".console_item");
    const form = document.getElementById("dashboard-form");
    const typeInput = document.getElementById("expense-type");
    const volumeInput = document.getElementById("volume-wrapper");

    // Назначаем каждой кнопке data-type в HTML или по порядку
    const types = ["parking", "fuel", "wash", "repair"];
    buttons.forEach((btn, i) => {
        btn.dataset.type = types[i];

        btn.addEventListener("click", () => {
            buttons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            typeInput.value = btn.dataset.type;

            // Показываем объем только если это заправка
            if (btn.dataset.type === "fuel") {
                volumeInput.classList.remove("hidden");
            } else {
                volumeInput.classList.add("hidden");
            }
        });
    });

    // Отправка формы
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const token = localStorage.getItem("token");
        if (!token) return alert("Вы не авторизованы");

        const data = {
            type: typeInput.value,
            date: form.date.value,
            mileage: form.mileage.value,
            amount: form.amount.value,
            note: form.note.value,
        };

        if (typeInput.value === "fuel") {
            data.volume = form.volume.value;
        }

        const res = await fetch("http://localhost:3000/api/expenses", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });

        if (res.ok) {
            alert("Запись добавлена");
            form.reset();
            volumeInput.classList.add("hidden");
        } else {
            alert("Ошибка при добавлении записи");
        }
    });
});