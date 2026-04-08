# 🌱 FoodSaver — Food Waste Reduction Web App

A full-stack mini project built with Node.js, Express, MongoDB, Bootstrap 5, HTML, CSS & JavaScript.

---

## 📁 Project Structure

```
food-waste-app/
│
├── models/
│   ├── User.js          # User schema (MongoDB)
│   └── Food.js          # Food item schema (MongoDB)
│
├── public/
│   ├── login.html       # Login page
│   ├── register.html    # Registration page
│   ├── dashboard.html   # Dashboard with stats
│   ├── inventory.html   # Food inventory list
│   ├── addFood.html     # Add new grocery form
│   ├── script.js        # All frontend JavaScript
│   └── style.css        # Custom CSS + Bootstrap overrides
│
├── app.js               # Express backend & API routes
├── package.json
└── README.md
```

---

## ✅ Features

- 🔐 User Register / Login (with bcrypt password hashing)
- 📦 Add, View & Delete grocery items
- 🎨 Beautiful Bootstrap 5 UI with custom CSS
- 🔴🟠🟢 Expiry color indicators (danger/warning/safe)
- 📊 Animated dashboard stats
- 🍎🥛🍞 Auto food icons based on name
- 📦 Auto unit detection (kg, litre, pieces, etc.)
- 🔍 Real-time search & filter (by type, expiry status)
- ⚠️ Expiry alert banners
- 🌐 Session-based authentication
- 👤 Per-user food inventory (data isolation)

---

## 🚀 Setup & Run

### 1. Prerequisites
- Node.js (v16+)
- MongoDB (running locally on port 27017)

### 2. Install Dependencies
```bash
npm install
```

### 3. Start MongoDB
Make sure MongoDB is running:
```bash
mongod
```
Or on Windows: start MongoDB as a service.

### 4. Start the Server
```bash
node app.js
```
Or with auto-restart (dev mode):
```bash
npm run dev
```

### 5. Open in Browser
```
http://localhost:3000/login.html
```

---

## 🔌 API Endpoints

| Method | Route            | Description              |
|--------|-----------------|--------------------------|
| POST   | /register        | Register new user        |
| POST   | /login           | Login & create session   |
| POST   | /logout          | Destroy session          |
| GET    | /me              | Check current session    |
| POST   | /foods           | Add new food item        |
| GET    | /foods           | Get all foods (user's)   |
| DELETE | /foods/:id       | Delete a food item       |
| GET    | /dashboard-data  | Get stats for dashboard  |

---

## 🛠 Tech Stack

| Layer     | Technology                     |
|-----------|-------------------------------|
| Frontend  | HTML5, CSS3, JavaScript (ES6) |
| UI Framework | Bootstrap 5.3               |
| Backend   | Node.js + Express.js          |
| Database  | MongoDB + Mongoose            |
| Auth      | bcrypt + express-session      |

---

## 📸 Pages

1. **Login / Register** — Clean auth UI with form validation
2. **Dashboard** — Animated stats: Total Items, Expiring Soon, Expired, Weekly count
3. **Inventory** — Food cards with expiry bars, search & filter
4. **Add Grocery** — Smart form with auto unit detection and food icons

---

Made with 💚 for Web Programming Mini Project
