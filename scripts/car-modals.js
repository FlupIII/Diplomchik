const API_URL = "http://localhost:3000/api/cars";
const AUTH_URL = "http://localhost:3000/api/auth";

document.addEventListener("DOMContentLoaded", () => {
    const loginModal = document.getElementById("modal-login");
    const regModal = document.getElementById("modal-register");
    const authButtons = document.getElementById("auth-buttons");
    const profileBlock = document.getElementById("profile-block");
    const profileName = document.getElementById("profile-name");
    const profileToggle = document.getElementById("profile-toggle");
    const profileMenu = document.getElementById("profile-menu");

    const token = localStorage.getItem("token");

    if (token) {
        try {
            const payload = JSON.parse(atob(token.split(".")[1]));
            const login = payload.login;

            authButtons.classList.add("hidden");
            authButtons.classList.remove("flex");

            profileBlock.classList.remove("hidden");
            profileBlock.classList.add("flex");
            profileName.textContent = login;
        } catch (e) {
            authButtons.classList.remove("hidden");
            authButtons.classList.add("flex");

            profileBlock.classList.add("hidden");
            profileBlock.classList.remove("flex");
        }
    } else {
        authButtons.classList.remove("hidden");
        authButtons.classList.add("flex");

        profileBlock.classList.add("hidden");
        profileBlock.classList.remove("flex");
    }

    document.getElementById("btn-login").addEventListener("click", () => {
        loginModal.classList.remove("hidden");
        regModal.classList.add("hidden");
    });

    document.getElementById("btn-register").addEventListener("click", () => {
        regModal.classList.remove("hidden");
        loginModal.classList.add("hidden");
    });

    document.querySelectorAll(".modal").forEach(modal => {
        modal.addEventListener("click", e => {
            if (e.target === modal) modal.classList.add("hidden");
        });
    });

    document.getElementById("logout-btn").addEventListener("click", () => {
        localStorage.removeItem("token");
        location.reload();
    });

    // 🆕 Переключение выпадающего меню
    profileToggle.addEventListener("click", () => {
        profileMenu.classList.toggle("hidden");
    });

    // 🆕 Вход в профиль
    document.getElementById("login-submit").addEventListener("click", async () => {
        const login = document.getElementById("login-login").value.trim();
        const password = document.getElementById("login-password").value.trim();

        const res = await fetch(`${AUTH_URL}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ login, password })
        });

        if (!res.ok) return alert("Ошибка входа");

        const data = await res.json();
        localStorage.setItem("token", data.token);
        location.reload();
    });

    // 🆕 Регистрация
    document.getElementById("register-submit").addEventListener("click", async () => {
        const email = document.getElementById("reg-email").value.trim();
        const login = document.getElementById("reg-login").value.trim();
        const password = document.getElementById("reg-password").value.trim();
        const repeat = document.getElementById("reg-repeat").value.trim();

        if (password !== repeat) return alert("Пароли не совпадают");

        const res = await fetch(`${AUTH_URL}/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, login, password })
        });

        if (!res.ok) return alert("Ошибка регистрации");

        const data = await res.json();
        localStorage.setItem("token", data.token);
        location.reload();
    });

    // === МОИ АВТО ===
    document.getElementById("my-cars-btn").addEventListener("click", async () => {
        const token = localStorage.getItem("token");
        if (!token) return;

        const cars = await loadCars(token);

        if (cars.length === 0) {
            document.getElementById("modal-add-car").classList.remove("hidden");
        } else {
            showCarListModal(cars);
        }
    });

    const addCarSubmit = document.getElementById("add-car-submit");
    if (addCarSubmit) {
        addCarSubmit.addEventListener("click", async () => {
            const brand = document.getElementById("car-brand").value.trim();
            const model = document.getElementById("car-model").value.trim();
            const year = document.getElementById("car-year").value.trim();

            if (!brand || !model || !year) {
                alert("Заполните все поля");
                return;
            }

            const token = localStorage.getItem("token");
            if (!token) return;

            await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ brand, model, year })
            });

            document.getElementById("modal-add-car").classList.add("hidden");
            const cars = await loadCars(token);
            showCarListModal(cars);
        });
    }

    document.getElementById("add-car-btn").addEventListener("click", () => {
        document.getElementById("modal-cars-list").classList.add("hidden");
        document.getElementById("modal-add-car").classList.remove("hidden");
    });
});

async function loadCars(token) {
    const res = await fetch(API_URL, {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });
    return await res.json();
}

function showCarListModal(cars) {
    const carListContainer = document.getElementById("car-list");
    carListContainer.innerHTML = "";

    cars.forEach(car => {
        const div = document.createElement("div");
        div.className = "car-card";
        div.innerHTML = `
      <div><strong>${car.brand}</strong></div>
      <div>${car.model}</div>
      <div>${car.year}</div>
      <button class="delete-car" data-id="${car._id}">🗑</button>
    `;
        carListContainer.appendChild(div);
    });

    document.getElementById("modal-cars-list").classList.remove("hidden");
}

document.addEventListener("click", async (e) => {
    if (e.target.classList.contains("delete-car")) {
        const id = e.target.dataset.id;
        const token = localStorage.getItem("token");
        if (!token || !id) return;

        await fetch(`${API_URL}/${id}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        const cars = await loadCars(token);
        showCarListModal(cars);
    }
});