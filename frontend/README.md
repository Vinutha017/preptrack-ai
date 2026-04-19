# PrepTrack AI Frontend

React + Vite frontend for PrepTrack AI.

## Local Development

1. Install dependencies:

```bash
npm install
```

2. Configure API base in `.env` (or use default from `.env.example`):

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

3. Run dev server:

```bash
npm run dev
```

## Build

```bash
npm run build
```

## Production API Base

For same-origin deployment behind backend server:

```env
VITE_API_BASE_URL=/api
```
