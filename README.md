# Modern e-District Online Portal

A full-stack, decoupled architecture web application designed to replace the legacy e-District system. This version removes artificial document upload limits and provides a premium, responsive UI/UX built with vanilla CSS without relying on heavy utility classes, all adhering strictly to TypeScript and best practices.

## Features

- **User Module**: Register, Login, browse government services, and apply for services.
- **Unlimited Document Uploads**: Users can upload as many documents (PDF/JPG/PNG) as needed for an application without artificial restrictions.
- **Admin Control Panel**: View all applications, accept/reject, securely download attached documents, and add remarks.
- **Premium UI**: Uses advanced CSS variables, glassmorphism headers, subtle micro-animations, and responsive cards.

## Technologies

- **Frontend**: Vite + React + TypeScript + Vanilla Modular CSS
- **Backend**: Python + Flask REST API + SQLAlchemy + SQLite
- **Authentication**: JWT (JSON Web Tokens) with Role-Based Access Control

---

## 🚀 Setup & Execution Instructions

### 1. Prerequisites
Ensure you have the following installed on your system:
- **Node.js**: `v18+` and `npm`
- **Python**: `v3.9+` and `pip`

### 2. Backend Setup
The backend runs on port `5000`.

1. Open a terminal and navigate to the backend directory:
   ```bash
   cd server
   ```
2. Create and activate a Virtual Environment (Recommended):
   ```bash
   # Windows
   python -m venv venv
   .\venv\Scripts\activate

   # Mac/Linux
   python3 -m venv venv
   source venv/bin/activate
   ```
3. Install the required Python packages:
   ```bash
   pip install -r requirements.txt
   ```
4. Start the Flask application:
   ```bash
   python app.py
   ```
   *Note: Application database tables are automatically initialized using SQLite in `server/edistrict.db`.*

### 3. Frontend Setup
The frontend securely proxies to the backend, bypassing CORS constraints locally.

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd client
   ```
2. Install Node dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to `http://localhost:3000`.

---

## 🛠 Usage Flow
1. **Initial Admin Setup**: Register a new user account. For your first administrator, use a database viewing tool (like DB Browser for SQLite) to manually change the role of a user from `"USER"` to `"ADMIN"` in `server/edistrict.db`.
2. **Add Services**: Login as the Admin to create some dummy services (e.g. "Income Certificate"). *(Note: Services API exists, but Admin UI can be seamlessly extended or seeded directly in DB for brevity).*
3. **User Flow**: Register as an ordinary user, apply for a service, attach multiple documents, and track status.
4. **Admin Review**: Log back in as admin to change the application status from Pending to Approved/Rejected, provide comment remarks, and test file downloads.

## 📦 Deployment

### Frontend (Netlify / Vercel)
1. In `client/vite.config.ts`, remove or handle the proxy setting depending on your API host.
2. Change the Axios baseURL in `client/src/api.ts` from `/api` to your deployed backend URL.
3. Run `npm run build` and export the `/dist` folder to your static provider.

### Backend (Render / Heroku)
1. Update `app.config["SQLALCHEMY_DATABASE_URI"]` inside `server/app.py` to point to a production Database (e.g. Postgres URL).
2. Set your production `SECRET_KEY` in Environment Variables.
3. Define a `Procfile` containing `web: gunicorn app:app`. Wait, since `create_app()` is used, use `web: gunicorn "app:create_app()"`.

