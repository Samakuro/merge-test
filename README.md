# merge-test — simple backend for the provided index.html

This repository contains a minimal Node.js backend (no external dependencies) to serve `index.html` and provide simple JSON APIs used by the frontend.

How to run (PowerShell on Windows):

1. Start the server:

   node server.js

2. Open http://localhost:3000 in your browser.

APIs provided:

- GET /api/features — returns JSON list of features
- GET /api/stats — returns site stats
- POST /api/contact — accepts JSON { name, email, message } and appends to `submissions.json`

Notes:

- This server uses only built-in Node modules (http, fs, path). No npm install necessary.
- `submissions.json` is a simple JSON file stored next to the server; ensure the process has write permissions.
