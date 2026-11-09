# Vidhi Frontend

React and Vite frontend for the Vidhi legal-aid platform.

## Requirements

- Node.js 18 or newer
- npm
- The FastAPI backend running on `http://localhost:8000`

## Setup

From this directory:

```powershell
npm install
Copy-Item .env.example .env.local
```

Set the API URL in `.env.local`:

```env
VITE_API_BASE_URL=http://localhost:8000
```

For production, use an HTTPS API URL. The frontend automatically uses WSS for WebSocket connections when HTTPS is configured.

## Run

```powershell
npm run dev
```

Open `http://localhost:5173`.

## Validation

```powershell
npm run lint
npm run build
```

Authentication uses an HttpOnly cookie issued by the backend. Do not add access tokens to browser storage or commit `.env.local`.
