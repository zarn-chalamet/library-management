# Library Management System

A full-stack library app: a **.NET Web API with Dapper** (backend) and a **React + Vite + Tailwind CSS** single-page app (frontend).

## Features

- JWT authentication: register and login with email and password
- Role-based access: **Admin** can add, edit and delete books, while **User** has read-only access
- Dashboard with stats cards, search (title, author, ISBN), genre filter and a book detail view
- Responsive UI: table on desktop, cards on mobile
- Separate environment files for Dev, UAT and Prod

## Tech stack

| Part | Stack |
|---|---|
| Backend | .NET, ASP.NET Core Web API, Dapper, SQLite (in-memory), JWT, BCrypt |
| Frontend | React, Vite, Tailwind CSS, Axios, React Router |

## How the mock database works

The JSON files are the tables:

- `backend/LibraryApi/Data/Json/users.json`
- `backend/LibraryApi/Data/Json/books.json`

1. On startup, the API loads both files into an in-memory SQLite database, so Dapper can query them with SQL.
2. After every create, update or delete, the tables are written back to the JSON files, so the data survives restarts.

**users**: `id`, `username`, `email` (unique), `passwordHash` (BCrypt), `role` (`Admin` or `User`), `createdAt`

**books**: `id`, `title`, `author`, `isbn` (unique), `genre`, `publicationYear`, `totalCopies`, `availableCopies`

## Run the backend

Requires the [.NET SDK](https://dotnet.microsoft.com/download).

```bash
cd backend/LibraryApi

# 1. Set a JWT signing secret (any string of 32+ characters). It is not stored in the repo.
dotnet user-secrets set "Jwt:Secret" "replace-with-your-own-32-plus-character-secret"

# 2. Start the API
dotnet run
```

The API listens on `http://localhost:5274`.

If you can't use user-secrets, set an environment variable instead (PowerShell: `$env:Jwt__Secret = "..."`, bash: `export Jwt__Secret="..."`).

On first run, an admin account is created in `users.json`:

| Email | Password | Role |
|---|---|---|
| `admin@library.com` | `Admin@123` | Admin |

Accounts created through the register form always get the `User` role.

## Run the frontend

Requires [Node.js](https://nodejs.org/).

```bash
cd frontend
npm install
npm run dev
```

The app opens at `http://localhost:5173`. Start the backend first.

## Environments

Each mode loads its own file, and the code only reads `VITE_API_BASE_URL`.

| Environment | Command | File |
|---|---|---|
| Development | `npm run dev` | `.env.development` |
| UAT | `npm run dev:uat` or `npm run build:uat` | `.env.uat` |
| Production | `npm run build` | `.env.production` |

Variables:

- `VITE_API_BASE_URL`: the API base URL
- `VITE_ENV_NAME`: shown as a badge in the UI (hidden in Production)

> The UAT and Production URLs are placeholders, because no hosted environments exist for this assignment. Replace them with the real server URLs before deploying. These files only contain public configuration, never secrets.

The backend allows the frontend origin through `Cors:Origins` in `appsettings.json` (default `http://localhost:5173`).

## API endpoints

Errors use the shape `{ "message": "..." }`. Send the token as `Authorization: Bearer <token>`.

**Auth** (`AuthController`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Create a `User` account and return a JWT (409 if the email is taken) |
| POST | `/api/auth/login` | Public | Sign in with email and password and return a JWT (401 if invalid) |

**Books** (`BookController`, the CRUD controller)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/books` | Any logged-in user | List all books |
| GET | `/api/books/{id}` | Any logged-in user | Get one book (404 if not found) |
| POST | `/api/books` | Admin | Create a book (409 on duplicate ISBN) |
| PUT | `/api/books/{id}` | Admin | Update a book (400, 404 or 409) |
| DELETE | `/api/books/{id}` | Admin | Delete a book (204, or 404) |

## Business rules

- Registration password: at least 8 characters, with a number and a special character
- ISBN is unique
- A new book starts with `availableCopies = totalCopies`
- `availableCopies` can never exceed `totalCopies`

## Project structure

```
backend/LibraryApi/
  Controllers/    AuthController, BookController
  Services/       AuthService, BookService, JwtService
  Repositories/   UserRepository, BookRepository (Dapper)
  Data/           JsonDatabase + Json/users.json, books.json
  Dtos/ Models/ Exceptions/

frontend/src/
  pages/          Login, Dashboard
  components/     BookList, modals, Header, StatsCards, ...
  hooks/ auth/ services/ utils/
```

## Troubleshooting

- **API stops at startup with "Jwt:Secret is missing"**: run the `dotnet user-secrets set` command above.
- **Login shows "Cannot reach the server"**: check that the API is running and that `VITE_API_BASE_URL` in the active `.env` file points to it. If the browser console shows a CORS error, add your frontend origin to `Cors:Origins`.
- **Data looks wrong after testing**: stop the API and restore `Data/Json/users.json` and `books.json` from Git.
