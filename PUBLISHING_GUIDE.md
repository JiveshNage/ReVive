# 🚀 ReVive Deployment & Publishing Guide

A complete step-by-step roadmap to publish the **ReVive** full-stack platform (FastAPI + React Vite + PostgreSQL) to production with free or low-cost hosting.

---

## 🏗️ Architecture Summary

```mermaid
graph LR
    User[End User / Collector / Recycler] -->|HTTPS| Frontend[React + Vite Frontend\nHosted on Vercel / Netlify]
    Frontend -->|REST API / Bearer JWT| Backend[FastAPI Backend\nHosted on Render / Railway]
    Backend -->|SQLAlchemy / psycopg| Database[(PostgreSQL Database\nNeon.tech / Supabase)]
    Backend -->|SMTP Port 587| Email[Brevo / Gmail SMTP]
    Backend -->|HTTPS| AI[OpenRouter / Gemini AI]
```

---

## 🌟 Method 1: Cloud PaaS (Recommended — Fast, Free & Zero Maintenance)

This is the easiest, modern industry-standard architecture:
- **Database**: [Neon.tech](https://neon.tech) (Free Managed Serverless PostgreSQL)
- **Backend**: [Render.com](https://render.com) (Free Python Web Service)
- **Frontend**: [Vercel](https://vercel.com) (Free High-Speed CDN Edge Hosting)

---

### Step 1: Set Up Free Cloud PostgreSQL on Neon

1. Go to **[https://neon.tech](https://neon.tech)** and sign up with GitHub.
2. Click **Create Project**, name it `revive-db`, and choose the nearest region (e.g., `Asia Pacific (Singapore)` or `US East`).
3. Neon will display your database connection string:
   ```text
   postgresql://revive_owner:password@ep-cool-sample.ap-southeast-1.aws.neon.tech/revive?sslmode=require
   ```
4. For Python SQLAlchemy with `psycopg`, format it with `postgresql+psycopg://`:
   ```text
   postgresql+psycopg://revive_owner:password@ep-cool-sample.ap-southeast-1.aws.neon.tech/revive?sslmode=require
   ```
5. Keep this string handy for Step 2.

---

### Step 2: Deploy the FastAPI Backend to Render

1. Go to **[https://render.com](https://render.com)** and sign in with GitHub.
2. Click **New +** → **Web Service**.
3. Select your repository: `JiveshNage/ReVive`.
4. Configure the service settings:
   - **Name**: `revive-backend`
   - **Region**: Choose the same region as your DB (e.g., Singapore or US East)
   - **Branch**: `main`
   - **Root Directory**: `.` (leave empty or set to root)
   - **Runtime**: `Python 3`
   - **Build Command**:
     ```bash
     pip install -r backend/requirements.txt
     ```
   - **Start Command**:
     ```bash
     cd backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT
     ```
   - **Instance Type**: Free

5. Scroll down to **Environment Variables** and add:
   | Key | Value | Notes |
   | :--- | :--- | :--- |
   | `APP_NAME` | `ReVive` | Application title |
   | `APP_ENV` | `production` | Enables production security |
   | `APP_DEBUG` | `false` | Disables debug stacktraces |
   | `SECRET_KEY` | `generate-a-64-character-random-hex-string` | Run `openssl rand -hex 32` |
   | `DATABASE_URL` | `postgresql+psycopg://...` | Connection string from Step 1 |
   | `OPENROUTER_API_KEY` | `sk-or-v1-...` | Your live OpenRouter key |
   | `SMTP_SERVER` | `smtp-relay.brevo.com` | Brevo SMTP host |
   | `SMTP_PORT` | `587` | Port |
   | `SMTP_LOGIN` | `your-brevo-login` | Brevo SMTP login |
   | `SMTP_PASSWORD` | `your-brevo-master-key` | Brevo SMTP password |
   | `CORS_ORIGINS` | `https://your-frontend.vercel.app` | Updated after Step 3 |

6. Click **Create Web Service**.
7. Render will build and deploy your backend. Once complete, copy your public backend URL:
   ```text
   https://revive-backend.onrender.com
   ```
8. Verify it by visiting `https://revive-backend.onrender.com/docs` in your browser.

---

### Step 3: Deploy the React Frontend to Vercel

1. Go to **[https://vercel.com](https://vercel.com)** and log in with GitHub.
2. Click **Add New...** → **Project**.
3. Select your repository `JiveshNage/ReVive`.
4. Configure the project:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click **Edit** and choose `web`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Expand **Environment Variables** and add:
   | Key | Value |
   | :--- | :--- |
   | `VITE_API_BASE_URL` | `https://revive-backend.onrender.com` (Your backend URL from Step 2) |
6. Click **Deploy**.
7. In ~60 seconds, Vercel will deploy your site and provide a production domain:
   ```text
   https://revive-five.vercel.app
   ```
8. **Final Sync**: Go back to Render → `revive-backend` → **Environment** and update `CORS_ORIGINS` to include your Vercel URL:
   ```text
   CORS_ORIGINS = https://revive-five.vercel.app
   ```

---

## 🐳 Method 2: Self-Hosted on a Single VPS (AWS EC2 / DigitalOcean / Hetzner)

If you prefer hosting everything on your own Linux server using Docker:

### 1. Provision a Server
- Launch an **Ubuntu 22.04 or 24.04 LTS** instance (2 GB RAM minimum, 4 GB recommended).
- Open inbound ports in your Security Group / Firewall:
  - `80` (HTTP)
  - `443` (HTTPS)
  - `22` (SSH)

### 2. Install Docker & Docker Compose
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
newgrp docker
```

### 3. Clone Repository & Setup Environment
```bash
git clone https://github.com/JiveshNage/ReVive.git
cd ReVive
cp .env.example .env
nano .env
```

Ensure `.env` has:
```env
APP_ENV=production
APP_DEBUG=false
SECRET_KEY=use-a-strong-random-secret
DATABASE_URL=postgresql+psycopg://postgres:yourstrongpassword@postgres:5432/revive
OPENROUTER_API_KEY=sk-or-v1-...
SMTP_LOGIN=your-brevo-login
SMTP_PASSWORD=your-brevo-key
VITE_API_BASE_URL=https://api.yourdomain.com
```

### 4. Build and Run via Docker Compose
```bash
docker compose up -d --build
```

### 5. Configure Nginx Reverse Proxy with SSL (Certbot)
Point your DNS `A` records to your VPS IP:
- `yourdomain.com` → VPS IP
- `api.yourdomain.com` → VPS IP

Install Nginx and Certbot:
```bash
sudo apt install -y nginx certbot python3-certbot-nginx
```

Configure `/etc/nginx/sites-available/revive`:
```nginx
# Web Frontend
server {
    server_name yourdomain.com;
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

# API Backend
server {
    server_name api.yourdomain.com;
    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable and secure with SSL:
```bash
sudo ln -s /etc/nginx/sites-available/revive /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
sudo certbot --nginx -d yourdomain.com -d api.yourdomain.com
```

---

## 🔒 Production Readiness Checklist

Before sharing your public URL:
1. **Never commit real `.env` secrets to GitHub**:
   - Keep `.env` in `.gitignore`.
2. **Rotate Secrets**:
   - Generate a unique 64-character random string for `SECRET_KEY`.
3. **Database Backups**:
   - If using Neon or Supabase, point-in-time recovery (PITR) and automatic daily backups are enabled by default.
4. **Email & SMS Service**:
   - Ensure your Brevo sender email (`noreply@revive.gov.in` or custom domain) is verified in Brevo settings to avoid spam filters.
5. **CORS Verification**:
   - The backend automatically permits `.vercel.app` and `.onrender.com` subdomains, as well as any explicit URLs listed in `CORS_ORIGINS`.
