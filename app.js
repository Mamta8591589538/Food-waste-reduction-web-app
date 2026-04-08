const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const session = require("express-session");

const User = require("./models/User");
const Food = require("./models/Food");

const app = express();

mongoose.connect("mongodb://127.0.0.1:27017/foodWaste")
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.log("❌ MongoDB Error:", err));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

app.use(session({
  secret: "foodsaver-secret-2024",
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 24 * 60 * 60 * 1000 } // 1 day
}));

/* ── AUTH MIDDLEWARE ── */
function requireLogin(req, res, next) {
  if (!req.session.userId) return res.status(401).json({ message: "Not logged in" });
  next();
}

/* ── REGISTER ── */
app.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.json({ success: false, message: "Email already registered" });
    const hash = await bcrypt.hash(password, 10);
    await User.create({ username, email, password: hash });
    res.json({ success: true, message: "Registered successfully" });
  } catch (e) {
    res.json({ success: false, message: "Registration failed" });
  }
});

/* ── LOGIN ── */
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.json({ success: false, message: "User not found" });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.json({ success: false, message: "Wrong password" });
    req.session.userId = user._id;
    req.session.username = user.username;
    res.json({ success: true, message: "Login success", username: user.username });
  } catch (e) {
    res.json({ success: false, message: "Login failed" });
  }
});

/* ── LOGOUT ── */
app.post("/logout", (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

/* ── CHECK SESSION ── */
app.get("/me", (req, res) => {
  if (req.session.userId) {
    res.json({ loggedIn: true, username: req.session.username });
  } else {
    res.json({ loggedIn: false });
  }
});

/* ── ADD FOOD ── */
app.post("/foods", requireLogin, async (req, res) => {
  try {
    await Food.create({ ...req.body, userId: req.session.userId });
    res.json({ success: true, message: "Food added" });
  } catch (e) {
    res.json({ success: false, message: "Failed to add food" });
  }
});

/* ── GET FOODS (user-specific) ── */
app.get("/foods", requireLogin, async (req, res) => {
  const foods = await Food.find({ userId: req.session.userId }).sort({ expiryDate: 1 });
  res.json(foods);
});

/* ── DELETE FOOD ── */
app.delete("/foods/:id", requireLogin, async (req, res) => {
  await Food.findOneAndDelete({ _id: req.params.id, userId: req.session.userId });
  res.json({ success: true, message: "Deleted" });
});

/* ── DASHBOARD DATA ── */
app.get("/dashboard-data", requireLogin, async (req, res) => {
  const foods = await Food.find({ userId: req.session.userId });
  const total = foods.length;
  const today = new Date();

  const expiringSoon = foods.filter(f => {
    const diff = (new Date(f.expiryDate) - today) / (1000 * 60 * 60 * 24);
    return diff <= 5 && diff >= 0;
  }).length;

  const expired = foods.filter(f => new Date(f.expiryDate) < today).length;

  const weekly = foods.filter(f => f.type === "weekly").length;
  const monthly = foods.filter(f => f.type === "monthly").length;

  res.json({ total, expiringSoon, expired, weekly, monthly });
});

app.listen(3000, () => {
  console.log("🚀 FoodSaver running at http://localhost:3000");
});
