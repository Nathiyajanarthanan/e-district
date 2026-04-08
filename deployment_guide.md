# Deployment Guide: e-District Application

This guide provides instructions for deploying the e-District application to **Vercel** (Frontend) and **Render** (Backend).

---

## 1. Backend Deployment (Render)

1. **Create a Web Service**:
   - Go to [Dashboard](https://dashboard.render.com/) -> New -> Web Service.
   - Connect your GitHub repository.
   - **Root Directory**: `server`
   - **Environment**: `Python`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn app:app`

2. **Environment Variables**:
   Update these in the Render Dashboard (Environment tab):
   - `DATABASE_URL`: Your PostgreSQL connection string (see step below).
   - `SECRET_KEY`: A random long string for token security.
   - `FRONTEND_URL`: The URL of your Vercel frontend (e.g., `https://e-district-your-username.vercel.app`).

3. **Database (Optional but Recommended)**:
   - Create a **New PostgreSQL** instance on Render.
   - Once created, copy the **Internal Database URL** and paste it into the backend's `DATABASE_URL` environment variable.

---

## 2. Frontend Deployment (Vercel)

1. **Import Project**:
   - Go to [Vercel Dashboard](https://vercel.com/dashboard) -> Add New -> Project.
   - Connect your GitHub repository.

2. **Configure Project**:
   - **Root Directory**: `client`
   - **Framework Preset**: `Vite` (Detected automatically).
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

3. **Environment Variables**:
   Under "Environment Variables", add:
   - `VITE_API_URL`: Your Render Web Service URL (e.g., `https://e-district-api.onrender.com/api`).
   - *Note*: Ensure the URL ends with `/api` as configured in the code.

4. **Deploy**:
   Click "Deploy". Vercel will handle the rest!

---

## 3. Post-Deployment Verification

1. Once both are deployed, check the Render logs to ensure the backend is running.
2. Open the Vercel URL and try to Register/Login.
3. If you encounter CORS errors, double-check that `FRONTEND_URL` on Render exactly matches your Vercel URL (with no trailing slash).
