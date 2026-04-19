# PrepTrack AI Backend Starter

Backend starter for **PrepTrack AI – Smart Placement Preparation System** using Node.js, Express, MongoDB, and JWT.

## Features Included

- JWT authentication (register/login/me)
- Checklist and progress tracking (phase-wise and overall)
- Non-repeating test engine with randomization
- Test submission and scoring
- Analytics endpoints (progress, accuracy, weak topics)
- Smart recommendation endpoint
- Daily streak update on login
- MongoDB seed script for starter MCQ dataset

## Tech Stack

- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication
- Express Validator

## Project Structure

```text
src/
  config/
  controllers/
  middleware/
  models/
  routes/
  services/
  utils/
scripts/
```

## Setup

1. Install dependencies

```bash
npm install
```

2. Create `.env` from `.env.example`

```bash
cp .env.example .env
```

3. Start MongoDB locally or set a cloud `MONGO_URI`

4. Seed questions

```bash
npm run seed
```

5. Run dev server

```bash
npm run dev
```

## Testing

Run all backend tests:

```bash
npm test
```

Run tests in watch mode:

```bash
npm run test:watch
```

Current automated coverage includes:

- API health endpoint validation using Supertest
- Recommendation service behavior using mocked analytics dependencies

Server base URL: `http://localhost:5000`

## Deployment

This app supports single-service deployment:

- Backend serves APIs under `/api`
- Backend serves frontend static files in production from `frontend/dist`

Production flow:

1. Set backend env variables in your host (`NODE_ENV=production`, `MONGO_URI`, `JWT_SECRET`, etc.)
2. Set frontend env to `VITE_API_BASE_URL=/api`
3. Build frontend from root: `npm run build`
4. Start backend: `npm start`

Detailed steps are in `DEPLOYMENT.md`.

For Render, a ready Blueprint config is provided in `render.yaml`.

## API Overview

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/progress`
- `PATCH /api/progress/:phase/item`
- `GET /api/progress/overall`
- `POST /api/tests/generate`
- `POST /api/tests/submit`
- `GET /api/tests/history`
- `GET /api/analytics/overview`
- `GET /api/analytics/weak-topics`
- `GET /api/analytics/recommendations`

## Non-Repeating Test Logic

- Reads previously used question IDs from `TestHistory.questionsUsed`
- Fetches only new questions using MongoDB `$nin`
- Randomizes fetched set and returns requested count

## Sample Request Payloads

Generate test:

```json
{
  "phase": "DBMS",
  "topic": "Normalization",
  "difficulty": "easy",
  "limit": 50,
  "adaptive": false
}
```

Submit test:

```json
{
  "phase": "DBMS",
  "questionIds": ["...", "..."],
  "answers": [
    { "questionId": "...", "selectedAnswer": "A" },
    { "questionId": "...", "selectedAnswer": "C" }
  ]
}
```

## Resume Description

PrepTrack AI – Smart Placement Preparation System

Developed a full-stack web application using React, Node.js, and MongoDB to track and optimize placement preparation
Implemented a dynamic test engine generating non-repeating MCQs using database filtering
Designed progress analytics dashboard with real-time performance tracking
Built adaptive learning system to identify weak areas and suggest improvements
