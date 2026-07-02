# KSBL Quiz Platform — Backend

> Node.js + Express backend for the KSBL Quiz Platform (quiz management, attempts, users, auth).

## Tech stack

- Node.js
- Express
- MongoDB / Mongoose
- Nodemailer (email helpers)

## Features

- User authentication (register, login)
- Role-based access (student / teacher / admin)
- Quiz creation and management
- Quiz attempts tracking and scoring
- Email notifications and utility services

## Project structure

Root files:

- `app.js` — application entry
- `package.json`
- `vercel.json`

Major folders:

- `controllers/` — request handlers (auth, quiz, user, attempt)
- `routes/` — express routes for `auth`, `quiz`, `user`, `attempt`
- `models/` — Mongoose models (`user.js`, `quiz.js`, `quizAttempt.js`)
- `middleware/` — auth and role middleware
- `utils/` — helpers (DB, mailer, seeder, AI/gemini services, cron jobs)

## Getting started

Prerequisites:

- Node.js (16+ recommended)
- MongoDB (local or Atlas)

Install and run:

```bash
npm install
# create a .env file with the variables below
npm run dev    # or `npm start` depending on your scripts
```

Seed the database (example seeder available):

```bash
node utils/seed.js
```

## Environment variables

Create a `.env` file with at least the following:

- `PORT` — server port
- `MONGO_URI` — MongoDB connection string
- `JWT_SECRET` — JWT signing secret
- `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS` — for nodemailer

## API (summary)

Base path: `/api`

- `POST /api/auth/register` — register new user
- `POST /api/auth/login` — login, returns JWT
- `GET/POST /api/quizzes` — list / create quizzes (creation restricted by role)
- `GET /api/quizzes/:id` — get quiz details
- `POST /api/attempts` — submit an attempt
- `GET /api/users` — user management (admin)

See the route files in `routes/` and controllers in `controllers/` for full details.

## Development notes

- Use the middleware in `middleware/` to protect routes and check roles.
- Utility services live in `utils/` (email, AI/gemini integrations, DB helper, cron jobs).

## Contributing

1. Fork the repo
2. Create a feature branch
3. Open a PR and describe your changes

## License

This project doesn't include a license file. Add one if you plan to publish.

---

If you'd like, I can: add a `.env.example`, expand the API docs from route files, or add npm scripts. Tell me which next.
