# Effort Analyzer Frontend

React + Vite frontend for the Effort Analyzer platform.  
This app connects to the FastAPI backend and gives users a clean UI for repository analysis, rankings, trends, summaries, and history.

## What this frontend does

1. Lets users sign in with either:
   - email/password (normal auth), or
   - GitHub OAuth.
2. Starts repository analysis jobs.
3. Polls job status live.
4. Shows commit summaries, effort scores, and scoring details.
5. Shows leaderboards and developer trend charts.
6. Provides account-specific history with delete actions.
7. Includes a mini game on the home page for gamification.

## Main features

1. **Dual authentication**
   - Local login/register form
   - GitHub OAuth login
   - Auth state is handled with `AuthContext`

2. **Protected routes**
   - Analyze, Job Status, History, Summary, Leaders, and Trends require login

3. **Analyze flow**
   - Submit `owner/repo` + commit limit
   - Redirect to job page and auto-track progress

4. **Live job status**
   - Polls backend every few seconds
   - Shows stage, processed commits, result, and error state

5. **Commit insights**
   - Displays commit summary, effort score, added/deleted lines
   - Shows scoring source, confidence, and short reason
   - Includes a **Scoring Explainer** tooltip

6. **Leaders page**
   - Ranks developers by total effort for a selected repository

7. **Developer trends dashboard**
   - Daily/weekly buckets
   - Adjustable time window and top developers
   - Trend chart, KPI cards, and direction indicators
   - Includes **How to read this chart** tooltip

8. **History management**
   - View completed analyses
   - Delete one entry
   - Delete all history
   - Uses account-scoped backend history

9. **Project summary page**
   - Fetches repo context and renders AI-generated explanation
   - Formats output into readable sections

10. **Gamification on home page**
    - Prompt asks if user wants a quick refresh game
    - Launches **Commit Rush**
    - Shows result message: “Hurrah! Your score is …”

11. **Consistent UI layout**
    - Sticky header, shared cards/buttons/inputs, footer
    - Responsive layout across desktop/mobile

## Routes

- `/` - Landing page + game prompt
- `/login` - Local auth + GitHub OAuth
- `/analyze` - Start a new analysis
- `/jobs/:jobId` - Job progress and results (`/jobs/last` supported)
- `/history` - Completed job history with delete actions
- `/summary` - Repo context + AI project explanation
- `/leaders` - Effort ranking by developer
- `/trends` - Developer trend dashboard
- `*` - Not found page

## Backend APIs used by frontend

### Auth
- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`
- `POST /auth/github/token`
- `GET /auth/github/me`

### Analysis and jobs
- `POST /analyze-repo`
- `GET /jobs/{id}`
- `DELETE /jobs/{id}`
- `DELETE /jobs/history/all`

### Insights
- `GET /commits`
- `GET /contributors`
- `GET /rankings`
- `GET /rankings/trends`
- `GET /data/export`

### Repo explanation
- `POST /repo-context/fetch`
- `GET /repo-context`
- `POST /repo-explain`

## Tech stack

- React 19
- Vite
- React Router
- Axios
- Custom CSS modules/files (no heavy UI library)

## Project structure

```text
src/
  api/            # axios client + API wrappers
  auth/           # AuthContext + token storage helpers
  components/     # shared UI components
  pages/          # route-level pages
  routes/         # router + protected route wrapper
  styles/         # global styles/theme
  App.jsx
  main.jsx
```

## Environment variables

Create `Effort-Analyzer-FrontEnd/.env`:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000
VITE_GITHUB_CLIENT_ID=your_github_oauth_client_id
```

Notes:
- If `VITE_API_BASE_URL` is missing/placeholder:
  - frontend uses `http://127.0.0.1:8000` on localhost
  - otherwise it falls back to hosted backend URL in code

## Run locally

```bash
npm install
npm run dev
```

Open the Vite URL shown in terminal (usually `http://localhost:5173`).

## Build

```bash
npm run build
npm run preview
```

## Typical user flow

1. User logs in.
2. User starts analysis from Analyze page.
3. Frontend stores last job and opens Job Status page.
4. Frontend polls until job completes.
5. User reviews commit insights, leaders, trends, and history.
6. User can reopen or delete old history entries.

## Troubleshooting

1. **OAuth code errors (`bad_verification_code`)**
   - Refresh login flow and avoid reusing old `?code`.

2. **`AI unavailable` shown in commit cards**
   - Usually backend AI key/config issue.
   - Check backend `.env` and restart backend.

3. **401 / missing auth**
   - Clear local storage and login again.
   - Verify token is being sent in request headers.

4. **No history/trends data**
   - Run at least one successful analysis first.
   - Ensure you are logged in with the same account.
