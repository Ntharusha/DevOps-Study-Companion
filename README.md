# DevOps Study Companion

DevOps Study Companion is a web-based productivity and learning platform designed specifically for DevOps learners. It helps users track their daily study tasks, monitor progress across a structured roadmap, and log hands-on practice such as commands, errors, and solutions.

## 🚀 Tech Stack

- **Frontend:** React 18 + Vite
- **Backend:** Node.js + Express
- **Database:** MongoDB

## 📦 Setup

### Prerequisites
- Node.js >= 18
- MongoDB running locally (or use MongoDB Atlas)

### Backend
```bash
cd backend
npm install
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

The frontend runs at `http://localhost:3000` and proxies API requests to the backend at `http://localhost:5000`.

## 📁 Project Structure
```
devops-daily-tracker/
├── frontend/          # React + Vite frontend
│   └── src/
│       ├── pages/     # Dashboard, NewEntry, Entries, EditEntry
│       ├── components/# Sidebar
│       ├── api.js     # Axios API client
│       └── index.css  # Design system
├── backend/           # Express API server
│   ├── models/        # Mongoose schemas
│   ├── routes/        # API routes
│   └── server.js      # Entry point
└── README.md
```

## 🎯 Features (Phase 1 MVP)
- ✅ Log daily work with topic, description, time, difficulty
- ✅ View, edit, and delete entries
- ✅ Dashboard with streaks, stats, and charts
- ✅ Filter entries by topic and difficulty
- ✅ Responsive dark-themed UI
