# ☁️ Cloud Mosaic Website

A full-stack business portal built with **React** (frontend) and **Django REST Framework** (backend).

## 🏗️ Project Structure

```
Cloud Mosaic website_project/
├── Frontend/    → React 19 app (public site + client portal)
└── Backend/     → Django 5 REST API (JWT auth, client portal APIs)
```

## 🚀 Running Locally

### Backend (Django)
```bash
cd Backend/backend
.venv\Scripts\activate        # Windows
# source .venv/bin/activate   # Mac/Linux
python manage.py runserver
```
API available at: `http://127.0.0.1:8000/api/v1/`  
API Docs: `http://127.0.0.1:8000/api/docs/`

### Frontend (React)
```bash
cd Frontend
npm install --legacy-peer-deps
npm start
```
App available at: `http://localhost:3000`

## 🔑 Environment Variables

### Backend (`Backend/backend/.env`)
```
SECRET_KEY=your-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
DATABASE_URL=sqlite:///db.sqlite3
CORS_ALLOWED_ORIGINS=http://localhost:3000
```

### Frontend (`Frontend/.env`)
```
REACT_APP_API_URL=http://127.0.0.1:8000/api/v1/
```

## 📦 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, React Router, Axios, CSS Variables |
| Backend | Django 5, Django REST Framework, SimpleJWT |
| Auth | JWT (Access + Refresh tokens), Token Blacklisting |
| Database | SQLite (dev) / PostgreSQL (prod) |

## 🌐 Client Portal Features

- **Dashboard** — Projects, invoices, meetings overview
- **Profile** — Company info management
- **Projects** — Active & past projects with status filters
- **Documents** — Upload & download shared files
- **Contracts** — View formal agreements
- **Invoices** — Billing history & balance due
- **Payments** — Transaction history
- **Meetings** — Upcoming & past consultations
- **Support** — Raise & track support tickets
- **Settings** — Change password
