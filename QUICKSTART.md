# Run The Project

## Prerequisites

- Node.js and npm installed
- `backend/.env` configured
- `frontend/.env` configured if needed

## Install dependencies

### Backend
```bash
cd D:\Code\ecom471\backend
npm install
```

### Frontend
```bash
cd D:\Code\ecom471\frontend
npm install
```

## Start the app

### Terminal 1: backend
```bash
cd D:\Code\ecom471\backend
npm run start:dev
```

Backend URL: `http://localhost:3000`

### Terminal 2: frontend
```bash
cd D:\Code\ecom471\frontend
npm run dev
```

Frontend URL: `http://localhost:5173`

## Notes

- Start the backend before using the frontend.
- If requests fail with auth errors, sign in again to refresh the token.
- If the frontend cannot reach the API, confirm the backend is running on port `3000`.
