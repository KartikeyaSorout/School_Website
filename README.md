# I.S. Memorial School — Backend Setup Guide

## What's Included
- `server.js` — Express server with all API routes
- `public/index.html` — School website frontend
- `public/admin.html` — Admin dashboard to manage enquiries
- `enquiries.db` — SQLite database (auto-created on first run)

---

## ✅ Requirements
- Node.js (v16 or above) — Download from https://nodejs.org

---

## 🚀 Setup & Run (Step by Step)

### 1. Install dependencies
Open a terminal in this folder and run:
```
npm install
```

### 2. Start the server
```
npm start
```

### 3. Open in browser
- 🌐 School Website: http://localhost:3000
- 📋 Admin Panel:    http://localhost:3000/admin

---

## 📡 API Endpoints

| Method | URL | Description |
|--------|-----|-------------|
| POST | /api/enquiry | Submit a new enquiry |
| GET | /api/enquiries | Get all enquiries |
| GET | /api/enquiries/:id | Get single enquiry |
| PATCH | /api/enquiries/:id/status | Update status (new/contacted/resolved) |
| DELETE | /api/enquiries/:id | Delete an enquiry |

---

## 📋 Admin Dashboard Features
- View all form submissions in a table
- Filter by status: New / Contacted / Resolved
- Search by name, phone, or email
- Mark enquiries as Contacted or Resolved
- Delete enquiries
- Live stats (Total, New, Resolved)

---

## 💡 Tips
- The database file `enquiries.db` is created automatically — no setup needed
- To run in development with auto-restart: `npm run dev` (requires nodemon)
- To deploy online, consider platforms like Railway, Render, or a VPS
