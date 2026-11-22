# Sehat
A simple multilingual hospital appointment and doctor availability platform.
https://ishita31.github.io/Sehat/**?utm_source=chatgpt.com

A multilingual hospital appointment and doctor availability platform.

## Architecture

- **Presentation tier:** static HTML, CSS, and browser modules built into `dist/`.
- **Application tier:** Cloudflare Pages Functions in `functions/`.
- **Data tier:** Supabase PostgreSQL, Auth, RPC functions, and Row-Level Security.

The browser calls same-origin `/api/...` endpoints. Pages Functions call Supabase
using server-side environment variables and pass the authenticated user's token
for protected RPCs.

## Local development

1. Install Node.js 20 or newer.
2. Install project dependencies:
   ```bash
   npm install
   ```
3. Copy `.dev.vars.example` to `.dev.vars` and set `SUPABASE_URL` and
   `SUPABASE_ANON_KEY`.
4. Start Pages locally:
   ```bash
   npm run dev
   ```

The local site is served by Wrangler, normally at `http://localhost:8788`.
The build command creates the `dist/` static assets directory. Pages Functions
are loaded from the root `functions/` directory.

## Deploy on Cloudflare Pages

1. Push the repository to GitHub and import it from **Workers & Pages → Create → Pages → Connect to Git**.
2. Use these build settings:
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - **Root directory:** repository root
3. In the Pages project settings, add `SUPABASE_URL` and `SUPABASE_ANON_KEY`
   under **Settings → Variables and Secrets** for production and preview as appropriate.
4. Deploy. Pages discovers the Functions from the root `functions/` directory.

The Supabase key belongs only in the Pages server environment. Do not add a
service-role key; these functions use the publishable/anon key and user JWTs.

The following Supabase RPCs must exist and enforce authorization with database
permissions and Row-Level Security:

- `get_public_hospitals`
- `get_public_doctors`
- `get_public_doctor_availability`
- `get_my_staff_profile`
- `get_my_doctor_assignments`
- `set_doctor_availability`

## API endpoints

```text
GET  /api/hospitals
GET  /api/doctors?hospitalId=<id>
GET  /api/availability?hospitalId=<id>&date=<YYYY-MM-DD>
POST /api/auth/login
GET  /api/doctor/assignments
POST /api/doctor/availability
```

## Checks

```bash
npm run build
npm test
```
