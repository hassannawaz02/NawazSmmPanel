# Niazi SMM Panel

Full-stack Social Media Marketing Panel built with React + Vite, Node.js + Express, PostgreSQL (Neon).

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS, React Router v6 |
| Backend | Node.js, Express.js, Prisma ORM |
| Database | PostgreSQL (Neon Cloud - free tier) |
| Auth | JWT (HTTP-only cookies) |
| Provider API | WorldPanel24 |

---

## Features

**User:**
- Register/Login (JWT)
- Browse & order SMM services
- Wallet balance & fund requests
- Order history & tracking
- WhatsApp support button

**Admin:**
- Dashboard with analytics
- Manage services, categories, providers
- Manage users, orders, fund requests
- Payment methods, reviews, messages
- WhatsApp & site settings (from panel)
- Bulk operations, CSV export
- Financial analytics (8 charts)

---

## Deployment Guide

### Step 1: Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

### Step 2: Deploy Backend (Render)

1. Go to [render.com](https://render.com) and sign up (free)
2. Click **New > Web Service**
3. Connect your GitHub repo
4. Settings:
   - **Name:** `niazi-smm-backend`
   - **Root Directory:** `backend`
   - **Runtime:** Node
   - **Build Command:** `npm install && npx prisma generate && npx prisma db push`
   - **Start Command:** `node src/server.js`
5. Add Environment Variables:
   ```
   NODE_ENV=production
   DATABASE_URL=postgresql://neondb_owner:YOUR_PASSWORD@ep-xxx-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require&connection_limit=5&pool_timeout=20
   JWT_SECRET=your_strong_random_secret_here
   JWT_EXPIRE=7d
   COOKIE_EXPIRE=7
   SMM_PROVIDER_URL=https://worldpanel24.com/api/v2
   SMM_PROVIDER_API_KEY=your_api_key_here
   FRONTEND_URL=https://YOUR_USERNAME.vercel.app
   ```
6. Click **Create Web Service**
7. Copy the URL (e.g., `https://niazi-smm-backend.onrender.com`)

### Step 3: Deploy Frontend (Vercel)

1. Go to [vercel.com](https://vercel.com) and sign up with GitHub
2. Click **Import Project**
3. Select your GitHub repo
4. Settings:
   - **Framework Preset:** Vite
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
5. Add Environment Variable:
   ```
   VITE_API_URL=https://niazi-smm-backend.onrender.com/api
   ```
6. Click **Deploy**

### Step 4: Update Backend CORS

After Vercel deploy, update backend `FRONTEND_URL` environment variable on Render to your Vercel URL.

### Step 5: Create Admin User

After first backend deploy, the database is empty. Use the register endpoint to create a user, then manually update role to `admin` in the database using Neon SQL Editor:

```sql
UPDATE users SET role = 'admin' WHERE email = 'your_email@example.com';
```

---

## Local Development

### Prerequisites
- Node.js 18+
- PostgreSQL (Neon account)

### Backend
```bash
cd backend
npm install
# Create .env file (see backend/.env.example)
npx prisma generate
npx prisma db push
npm run dev
```

### Frontend
```bash
cd frontend
npm install
# Create .env file (see frontend/.env.example)
npm run dev
```

Frontend runs on `http://localhost:5173`
Backend runs on `http://localhost:5000`

---

## Environment Variables

### Backend (.env)
```
PORT=5000
NODE_ENV=development
DATABASE_URL=postgresql://...
JWT_SECRET=your_secret
JWT_EXPIRE=7d
COOKIE_EXPIRE=7
SMM_PROVIDER_URL=https://worldpanel24.com/api/v2
SMM_PROVIDER_API_KEY=your_key
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env)
```
VITE_API_URL=/api
```

---

## Project Structure

```
Smm-Panel/
├── backend/
│   ├── src/
│   │   ├── config/          # Environment config
│   │   ├── controllers/     # Route handlers
│   │   ├── lib/             # Prisma client
│   │   ├── middleware/      # Auth, error handling
│   │   ├── routes/          # API routes
│   │   ├── services/        # SMM Provider, cron jobs
│   │   └── utils/           # Helpers
│   ├── prisma/
│   │   └── schema.prisma    # Database schema
│   ├── Dockerfile
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/      # UI components + layout
│   │   ├── context/         # Auth + SiteSettings
│   │   ├── pages/           # User, Admin, Public pages
│   │   └── services/        # API client
│   ├── index.html
│   └── package.json
│
└── README.md
```

---

## Database Schema

Key models: User, Service, Category, Order, Provider, WalletTransaction, Message, PaymentMethod, FundRequest, Review, SiteSetting

---

## Author

**Hassan Nawaz**
GitHub: [@hassannawz02](https://github.com/hassannawz02)

---

## License

MIT
