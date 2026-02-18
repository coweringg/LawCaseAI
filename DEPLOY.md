# LawCaseAI Deployment Guide

This guide outlines the steps to deploy the LawCaseAI platform (Frontend + Backend) to a production environment.

## Prerequisites

- **Node.js** (v18 or higher)
- **MongoDB** (v6.0 or higher) - Local or Cloud (Atlas)
- **Cloudflare R2** account (for file storage)
- **FreeLLM** account (for AI features)

## Directory Structure
- `frontend/`: Next.js application (Client-side)
- `backend/`: Node.js/Express API (Server-side)

---

## 1. Environment Configuration

Ensure you have `.env` files created in both `backend/` and `frontend/` directories based on the `.env.example` files.

### Backend (.env)
```env
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/lawcaseai
JWT_SECRET=your-secure-production-secret
CLOUDFLARE_R2_ACCESS_KEY_ID=...
CLOUDFLARE_R2_SECRET_ACCESS_KEY=...
FREELLM_API_KEY=...
```

### Frontend (.env)
```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

---

## 2. Backend Deployment

The backend is a Node.js/Express application written in TypeScript.

1.  **Navigate to backend:**
    ```bash
    cd backend
    ```

2.  **Install Dependencies:**
    ```bash
    npm install --production=false
    ```

3.  **Build the Project:**
    ```bash
    npm run build
    ```
    This compiles the TypeScript code into the `dist/` folder.

4.  **Start the Server:**
    ```bash
    npm start
    ```
    The server will run on port `5000` (or as defined in `PORT`).

**Recommendation:** Use a process manager like **PM2** for production resilience.
```bash
npm install -g pm2
pm2 start dist/server.js --name "lawcaseai-api"
```

---

## 3. Frontend Deployment

The frontend is a Next.js application.

1.  **Navigate to frontend:**
    ```bash
    cd frontend
    ```

2.  **Install Dependencies:**
    ```bash
    npm install
    ```

3.  **Build the Project:**
    ```bash
    npm run build
    ```
    This creates an optimized production build in the `.next` folder.

4.  **Start the Server:**
    ```bash
    npm start
    ```
    The app will be available on port `3000`.

**Recommendation:** Deploy the frontend to **Vercel** or **Netlify** for optimal performance and automatic CI/CD.

---

## 4. Verification

After deployment:
1.  Navigate to `https://yourdomain.com`.
2.  Register a new user account.
3.  Verify that the dashboard loads correctly.
4.  Test AI features (Chat & Document Summary) to ensure backend connectivity.

## Troubleshooting

- **CORS Issues:** Ensure `FRONTEND_URL` in backend `.env` matches your frontend domain.
- **Database Connection:** Check MongoDB allowlist settings.
- **AI Errors:** Verify `FREELLM_API_KEY` and rate limits.
