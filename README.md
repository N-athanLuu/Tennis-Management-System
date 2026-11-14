
### Account login

The React app opens on a public home page with a Log in link. Login and signup require the Flask backend; authenticated users see Log out. Run the Flask backend on port 5000 and the frontend with `npm.cmd run dev`; Vite proxies `/api` requests to Flask. PostgreSQL must be running with `DATABASE_URL` configured (the Compose configuration supplies this).

Accounts are stored in PostgreSQL with hashed passwords. The accounts table is created automatically on the first signup or login. Signing up creates an account; log in afterward to enter the home page. Logout clears the session cookie.

Set a persistent, random `SECRET_KEY` in the backend environment to preserve sessions across restarts. Without it, a new key is generated on startup and existing sessions expire. For HTTPS hosting, set `COOKIE_SECURE=1` and forward `/api` requests from the frontend host to Flask. Login rate limiting is still needed before public deployment.

