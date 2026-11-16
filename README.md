# FlowUp — Full-Stack Portfolio Demo

A real full-stack task manager built with React + Flask + Postgres:

- **Auth & account**: signup/login with hashed passwords and server-side sessions; edit display name, change password, delete account.
- **Kanban board**: To Do / In Progress / Done with drag-and-drop, quick add, and a full task editor (description, priority, due date).
- **Search, filter, sort**: by text, priority, overdue, due date.
- **Dashboard**: open / overdue / completed-this-week stats, tasks due in the next 7 days, high-priority list with one-click complete.
- **Analytics**: completions per day (last 14 days), average time to finish, breakdowns by status and priority.
- **Per-user persistence** in Postgres (Supabase), scoped so users only ever see their own data.

## Stack

- **Frontend**: React + Vite + Tailwind CSS (`frontend/`)
- **Backend**: Flask + Flask-SQLAlchemy + Supabase Postgres (`backend/`)
- **Auth**: Flask signed-cookie sessions + `werkzeug.security` password hashing (no extra services needed)
- Flask serves the built frontend static files directly — one deployable service, one URL (same pattern as the AI Chatbot Widget demo).

## Local development

Two terminals:

```bash
# Terminal 1 — backend
cd backend
python -m venv venv
./venv/Scripts/activate        # Windows; use `source venv/bin/activate` on macOS/Linux
pip install -r requirements.txt
cp .env.example .env            # then paste your Supabase DATABASE_URL and a random SECRET_KEY
python app.py                   # http://localhost:5001

# Terminal 2 — frontend (hot reload, proxies /api to Flask)
cd frontend
npm install
npm run dev                     # http://localhost:5173
```

Tables are created automatically via `db.create_all()` on startup; columns added in later versions are added in place by `add_missing_columns()` in `app.py`. No migration framework needed at this scale.

## Database: Supabase (free, no card required)

1. Create a free project at [supabase.com](https://supabase.com).
2. Project Settings → Database → copy the connection string (URI format, pooler mode).
3. **If your database password contains special characters** (`#`, `@`, `/`, etc.), they must be percent-encoded in the URL or the connection will silently fail to parse. Use Python to encode just the password:
   ```python
   from urllib.parse import quote
   print(quote("your-password", safe=""))
   ```
4. Use `postgresql+psycopg://` as the scheme (not plain `postgresql://`) since this project uses the `psycopg` v3 driver.
5. Supabase free projects pause after about a week of inactivity — visiting the dashboard and clicking "Restore" wakes it back up. Worth knowing if a deployed demo link looks broken after sitting untouched.

## Production build (what gets deployed)

```bash
cd frontend && npm run build     # outputs frontend/dist
cd ../backend && gunicorn app:app
```

## Deploying (Vercel, free Hobby plan)

Live at https://flowup-one.vercel.app. Vercel runs the Flask app as a Python
serverless function (`api/index.py` imports `backend/app.py`) and serves the
Vite build as static files, so there is no sleeping server and no wake-up screen.

1. `npx vercel login`, then `npx vercel link --project flowup` from the repo root.
2. Add `DATABASE_URL` and `SECRET_KEY` as Production env vars (`npx vercel env add NAME production`).
3. `npx vercel deploy --prod`.

`vercel.json` pins the function to `dub1` (next to the Supabase eu-west-1 DB) and
runs a daily cron against `/api/health`, which queries the DB so the free
Supabase project never pauses from inactivity.

## API reference

| Route | Method | Auth required | Notes |
|---|---|---|---|
| `/api/auth/signup` | POST | No | `{ email, password }`, password min 6 chars |
| `/api/auth/login` | POST | No | `{ email, password }` |
| `/api/auth/logout` | POST | Yes | Clears session |
| `/api/auth/me` | GET | Yes | Returns current user or 401 |
| `/api/tasks` | GET | Yes | List current user's tasks |
| `/api/tasks` | POST | Yes | `{ title }`, defaults to `todo` status |
| `/api/tasks/:id` | PATCH | Yes | `{ title?, status? }` — `status` must be `todo`/`in_progress`/`done` |
| `/api/tasks/:id` | DELETE | Yes | |

All task routes are scoped to the logged-in user — there is no way to read or modify another user's tasks.

## Reusing this for a different demo

- Rename the "FlowUp" branding in `frontend/src/pages/*.jsx`.
- Extend `models.py` with more fields/tables as needed for a specific client pitch (e.g. due dates, priority, project grouping).
