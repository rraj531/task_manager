# 🚀 TaskMaster - FullStack Task Management Application

A fullstack Task Management Web Application built with **Node.js, Express, MySQL, and Vanilla JavaScript**. Featuring dual-channel OTP verification (Email via Nodemailer + Mobile SMS via Supabase/Fast2SMS), JWT authentication, task filtering, sorting, and priority management.

---

## ✨ Features

- 🔐 **Dual-Channel Registration OTP:** Email verification (Gmail Nodemailer) and Mobile SMS OTP (Supabase / Fast2SMS / Console dev fallback).
- 🔑 **Secure Authentication:** Password hashing using `bcrypt` and stateless session handling via `JSON Web Tokens (JWT)`.
- 📋 **Task Management:** Create, Read, Update, Delete (CRUD) tasks.
- 🎯 **Priority & Due Date Tracking:** Tag tasks with Low, Medium, or High priority and set target deadlines.
- 🔍 **Dynamic Filtering & Sorting:** Filter tasks by status (All, Pending, Completed), search by title/description, and sort by Newest, Priority, or Due Date.
- 📱 **Responsive UI:** Clean, modern interface designed for mobile and desktop screens.
- ☁️ **Cloud & Hosting Ready:** Auto-reconnecting MySQL connection pool, health check endpoints (`/api/health`), and SPA fallback routing.

---

## 🛠️ Tech Stack

- **Backend:** Node.js, Express.js
- **Database:** MySQL / MariaDB (supports local MySQL, TiDB, Aiven, Railway, AWS RDS)
- **Frontend:** HTML5, CSS3, Modern JavaScript (Vanilla ES6+)
- **Security & Utilities:** `jsonwebtoken`, `bcrypt`, `cors`, `dotenv`, `nodemailer`, `@supabase/supabase-js`

---

## 📦 Getting Started Locally

### 1. Clone the repository
```bash
git clone git@github.com:rraj531/task_manager.git
cd task_manager
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the root folder based on `.env.example`:
```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=task_manager
PORT=3000

# JWT Secret
JWT_SECRET=your_jwt_secret_key

# Gmail Nodemailer (for Email OTP)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password

# Supabase Auth / SMS (Optional)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key

# Fast2SMS (Optional - for Indian SMS)
# FAST2SMS_API_KEY=your_fast2sms_api_key
```

### 4. Start the Application
```bash
npm start
```
The server will start and automatically initialize required tables. Open your browser at `http://localhost:3000`.

---

## 🌐 Cloud Hosting Instructions

This application is ready to be hosted as a single fullstack service on platforms like **Render**, **Railway**, or **Fly.io**.

### Hosting with Render (Recommended Free Option):
1. Create a free MySQL database on **[Aiven.io](https://aiven.io/)** or **[TiDB Cloud](https://tidbcloud.com/)**.
2. Go to **[Render.com](https://render.com/)** and create a new **Web Service**.
3. Connect your GitHub repository: `task_manager`.
4. Configure the settings:
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
5. In the **Environment Variables** tab, add:
   - `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` (or `DATABASE_URL`)
   - `DB_SSL`: `true` (if using cloud MySQL)
   - `JWT_SECRET`: (a secure random string)
   - `EMAIL_USER` & `EMAIL_PASS`: (your Gmail & App Password)
6. Click **Deploy Web Service**!

---

## 📄 License
ISC
