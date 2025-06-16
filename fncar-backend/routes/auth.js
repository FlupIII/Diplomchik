const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

router.post("/register", async (req, res) => {
    const { email, login, password } = req.body;

    const exists = await User.findOne({ $or: [{ email }, { login }] });
    if (exists) return res.status(400).json({ message: "Пользователь уже существует" });

    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ email, login, password: hashed });
    await user.save();

    res.status(201).json({ message: "Регистрация успешна" });
});

router.post("/login", async (req, res) => {
    const { login, password } = req.body;

    const user = await User.findOne({ login });
    if (!user) return res.status(404).json({ message: "Пользователь не найден" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: "Неверный пароль" });

    const token = jwt.sign(
        { userId: user._id, login: user.login },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
    );
    res.json({ token });
});

module.exports = router; // ← ВАЖНО!
