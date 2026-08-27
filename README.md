# Real-Time Data & Modern Tech — Feature-Isolated Build

## Login fix (review version)
- Fixed the startup JavaScript error that stopped the login page from initializing.
- Login and registration now use one backend flow when the project is started with `node server.js` or `start.bat`.
- After successful login or registration, the dashboard opens immediately without a page reload.
- Do not open `index.html` by double-clicking it: start the server and use `http://localhost:3000`.

## What changed
- Login is session-only. The authenticated user is stored in `sessionStorage`, so closing the browser tab/window ends the login session automatically.
- Old persistent auth keys are cleared on startup so an earlier build cannot keep a user logged in.
- After login, the application behaves like a feature-based single-view dashboard: only the selected top-level feature is visible; the other features are hidden.
- Clicking a feature in the navigation opens that feature alone and updates the URL hash.
- If a user clicks a feature while logged out, the login screen opens first and the requested feature is remembered for after login.
- Viewer accounts cannot open the Admin Dashboard.
- Existing real-time API, registration, dashboard, analytics, reports, data streams, notifications, settings, map, contact form, and role controls are preserved.

## Demo accounts
- Admin: `admin` / `admin123`
- Viewer: `viewer` / `viewer123`

## Run
### Windows
Double-click `start.bat`.

### Terminal
```bash
node server.js
```
Then open `http://localhost:3000`.

## Navigation behavior
1. Start at the login screen.
2. Sign in.
3. The dashboard opens as the default feature. Newly registered users are signed in automatically.
4. Select Analytics, Reports, Data Streams, Settings, etc. — only that feature is shown.
5. Use Logout to return to the login screen.
6. Close the browser tab/window and reopen the project — the previous session is not restored.

## Feature Data Upgrade — Review Build

This build adds populated, connected data surfaces to the main feature pages. Dashboard, About, Features, Data Streams, Analytics, Users & Access, Reports, Operations Monitor, World Map, Security/System Health, Settings, Team, Contact, and Alerts & Notifications now have dedicated live-data panels or populated content.

Authentication remains session-only: active login state is held in `sessionStorage`; the backend token is cleared on logout, and a closed browser session requires login again. Backend-registered users remain available through the current session after refresh instead of being incorrectly discarded by a localStorage-only user lookup.

The dashboard/analytics data panels update from the same live `/api/metrics` stream, so throughput, latency, uptime, synchronization, risk, and alert counts remain connected to the real-time demo metrics.


## Review checklist
- Dashboard keeps the reference-style command view with KPI cards, overall performance, advanced analytics, activity, streams, notifications, and quick actions.
- Analytics, Data Streams, Reports, Notifications, Users & Access, Operations, World Map, Security, Settings, Team, and Contact each open as a dedicated single-feature workspace.
- Each dedicated workspace contains its own KPI cards, data table, health/status area, and feature-specific actions.
- Only the selected top-level feature is displayed after login.
- Login/Register are available before authentication.
- Active authentication uses `sessionStorage`; refresh and in-app navigation preserve the current session, while closing the tab ends it.
- Live `/api/metrics` updates feed dashboard and feature KPI values.
