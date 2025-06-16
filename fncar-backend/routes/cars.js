const express = require("express");
const Car = require("../models/Car");
const jwt = require("jsonwebtoken");

const router = express.Router();

// Middleware для авторизации
router.use((req, res, next) => {
    const auth = req.headers.authorization;
    if (!auth) return res.sendStatus(401);

    try {
        const token = auth.split(" ")[1];
        req.user = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch {
        res.sendStatus(403);
    }
});

// Получить авто пользователя
router.get("/", async (req, res) => {
    const cars = await Car.find({ userId: req.user.userId });
    res.json(cars);
});

// Добавить авто
router.post("/", async (req, res) => {
    const { brand, model, year } = req.body;
    const car = new Car({ userId: req.user.userId, brand, model, year });
    await car.save();
    res.status(201).json(car);
});

// Удалить авто
router.delete("/:id", async (req, res) => {
    await Car.deleteOne({ _id: req.params.id, userId: req.user.userId });
    res.sendStatus(204);
});

module.exports = router;


