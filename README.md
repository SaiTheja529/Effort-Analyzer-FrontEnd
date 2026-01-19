<h1 align="center">Effort Analyzer – Frontend</h1>
<p align="center">
  React + Vite UI for my Effort Analyzer backend (FastAPI). OAuth-backed, job-polling, AI summaries, leaders chart, history, and repo explanations.
</p>

<hr />

<h2>1) What this app does</h2>
<ul>
  <li>Authenticates via GitHub OAuth (token stored client-side, protected routes).</li>
  <li>Kicks off async repo analyses and polls job status until completion.</li>
  <li>Shows AI commit summaries, effort scores, and developer rankings.</li>
  <li>Displays analysis history and lets me open previous jobs.</li>
  <li>Renders a “Leaders” bar chart for top contributors by effort.</li>
  <li>Fetches repo context + Gemini explanation and formats the AI output cleanly.</li>
  <li>Uses a custom dark/glassy UI with responsive layout, sticky nav, and footer.</li>
</ul>

<h2>2) Tech stack</h2>
<ul>
  <li><strong>React + Vite</strong> (SPA)</li>
  <li><strong>React Router</strong> (routing + protected routes)</li>
  <li><strong>Axios</strong> (API client with auth interceptor)</li>
  <li><strong>Custom CSS</strong> (no heavy UI lib; global styles + component styles)</li>
</ul>

<h2>3) Folder structure</h2>
<pre><code>src/
 ├─ api/            # axios client + endpoint helpers (auth, analyze, jobs, explain)
 ├─ auth/           # AuthContext, token helpers (localStorage)
 ├─ components/     # Card, Button, Input, Loader, StatusPill, Header, Footer, Layout, etc.
 ├─ pages/          # Landing, Login, Analyze, JobStatus, History, Leaders, Summary, NotFound
 ├─ routes/         # AppRouter (all routes + protection)
 ├─ styles/         # globals.css (theme)
 ├─ utils/          # (placeholder for helpers)
 ├─ App.jsx, main.jsx, index.css
</code></pre>

<h2>4) Routing & pages</h2>
<ul>
  <li><code>/</code> <strong>Landing</strong>: hero, CTAs for Analyze/Login.</li>
  <li><code>/login</code> <strong>Login</strong>: GitHub OAuth, exchanges code once, stores token/user, shows profile chip.</li>
  <li><code>/analyze</code> <strong>Analyze</strong>: repo + max commits form, starts analysis → redirects to job with <code>jobId</code>, shows quick history links.</li>
  <li><code>/jobs/:jobId</code> <strong>JobStatus</strong>: polls job; when done, shows formatted commit summaries (AI), effort, and rankings.</li>
  <li><code>/history</code> <strong>History</strong>: all succeeded jobs from backend export, sorted, with “View” buttons.</li>
  <li><code>/leaders</code> <strong>Leaders</strong>: bar chart (gradient) of top contributors by effort; repo picker backed by history datalist.</li>
  <li><code>/summary</code> <strong>Summary</strong>: fetches repo context and Gemini explanation; formats AI output into headings, bullets, paragraphs.</li>
  <li><code>*</code> <strong>NotFound</strong>: fallback.</li>
</ul>

<h2>5) Auth model</h2>
<ul>
  <li><strong>Token storage:</strong> localStorage (<code>ea_gh_token</code>, <code>ea_user</code>).</li>
  <li><strong>AuthContext:</strong> loads stored token/user on boot, exposes <code>login</code>/<code>logout</code>, and guards protected routes.</li>
  <li><strong>Axios interceptor:</strong> injects <code>Authorization: Bearer &lt;token&gt;</code> if present.</li>
  <li><strong>OAuth flow:</strong> on <code>/login</code>, read <code>?code</code> once, swap with backend <code>/auth/github/token</code>, clean the URL to avoid reusing the code (avoids bad_verification_code).</li>
</ul>

<h2>6) API endpoints the UI calls</h2>
<ul>
  <li><strong>Auth:</strong> <code>POST /auth/github/token</code>, <code>GET /auth/github/me</code></li>
  <li><strong>Analysis:</strong> <code>POST /analyze-repo</code>, <code>GET /jobs/{id}</code></li>
  <li><strong>Data:</strong> <code>GET /commits</code>, <code>GET /rankings</code>, <code>GET /data/export</code></li>
  <li><strong>Context & Gemini:</strong> <code>POST /repo-context/fetch</code>, <code>GET /repo-context</code>, <code>POST /repo-explain</code></li>
</ul>

<h2>7) Data flow (analyze → job → results)</h2>
<ol>
  <li>User submits repo + max commits on <code>/analyze</code>.</li>
  <li>Backend enqueues job, returns <code>job_id</code> → redirect to <code>/jobs/:jobId</code>.</li>
  <li>JobStatus polls <code>/jobs/{id}</code> until terminal (succeeded/failed).</li>
  <li>On success, UI pulls <code>/commits</code> (shows formatted AI summaries + effort) and <code>/rankings</code> (dev effort totals).</li>
  <li>History and Leaders reuse <code>/data/export</code> and <code>/rankings</code> to surface past runs.</li>
</ol>

<h2>8) Gemini / summary flow</h2>
<ol>
  <li>On <code>/summary</code>, user inputs repo and detail level.</li>
  <li>UI calls <code>/repo-context/fetch</code> (and <code>/repo-context</code> for metadata).</li>
  <li>Then calls <code>/repo-explain</code>; the response text is parsed into headings, bullets, and paragraphs for readability.</li>
</ol>

<h2>9) UI/UX choices</h2>
<ul>
  <li>Dark gradient theme, glassmorphism cards, sticky navbar with custom logo, footer pinned via flex layout.</li>
  <li>Navbar links: Home, Analyze, Summary, Leaders, History, Job Status (last).</li>
  <li>Commit and summary text is auto-formatted (no raw wall-of-text from AI).</li>
  <li>Responsive grids on forms, cards, and charts.</li>
</ul>

<h2>10) Environment variables</h2>
<pre><code>VITE_API_BASE_URL=https://effort-analyzer-backend.onrender.com
VITE_GITHUB_CLIENT_ID=&lt;github_oauth_client_id&gt;
</code></pre>

<h2>11) Scripts</h2>
<pre><code>npm run dev     # start Vite dev server
npm run build   # production build
npm run preview # preview production build
</code></pre>

<h2>12) How to run locally</h2>
<ol>
  <li>Node 18+ recommended.</li>
  <li><code>npm install</code></li>
  <li>Create <code>.env</code> with the vars above.</li>
  <li><code>npm run dev</code> and open the suggested localhost port.</li>
</ol>

<h2>13) Deployment notes</h2>
<ul>
  <li>Set <code>VITE_API_BASE_URL</code> to the deployed backend (Render).</li>
  <li>Expose <code>VITE_GITHUB_CLIENT_ID</code> so the “Login with GitHub” button points to the correct OAuth app.</li>
  <li>Ensure backend CORS allows the frontend origin.</li>
</ul>

<h2>14) Components at a glance</h2>
<ul>
  <li><strong>Layout</strong>: wraps Header + Footer, flex column to pin footer.</li>
  <li><strong>Header</strong>: sticky, centered nav, custom logo, login/logout chip.</li>
  <li><strong>Footer</strong>: simple brand strip.</li>
  <li><strong>Cards/Buttons/Inputs</strong>: consistent styling across pages.</li>
  <li><strong>StatusPill</strong>: job status badge.</li>
  <li><strong>Loader</strong>: spinner + message.</li>
</ul>

<h2>15) Pages at a glance</h2>
<ul>
  <li><strong>Landing</strong>: hero CTA.</li>
  <li><strong>Login</strong>: OAuth exchange, profile display.</li>
  <li><strong>Analyze</strong>: form + “recent history” shortcuts.</li>
  <li><strong>JobStatus</strong>: polling, formatted commit summaries, rankings.</li>
  <li><strong>History</strong>: all succeeded jobs, sortable by time.</li>
  <li><strong>Leaders</strong>: gradient bar chart of dev effort.</li>
  <li><strong>Summary</strong>: repo context + Gemini explanation with rich formatting.</li>
</ul>

<h2>16) Styling</h2>
<ul>
  <li>Global theme in <code>styles/globals.css</code>.</li>
  <li>Page-specific CSS under <code>pages/*.css</code>; components have their own CSS.</li>
</ul>

<h2>17) Troubleshooting tips</h2>
<ul>
  <li><strong>bad_verification_code</strong>: make sure the login page removes <code>?code</code> after one exchange; don’t reload with the same code.</li>
  <li><strong>Missing Bearer token</strong>: ensure token is in localStorage and AuthContext loaded; check that Axios interceptor is adding <code>Authorization</code>.</li>
  <li><strong>401 Invalid GitHub token</strong>: backend PAT must be valid; rerun analysis with a valid token.</li>
</ul>

<hr />
<p align="center">MIT License</p>
