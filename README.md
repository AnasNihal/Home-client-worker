<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Home Service Application — README</title>
  <meta name="description" content="Worker-client home services booking platform — Django + DRF + React + Tailwind" />
  <style>
    :root{--bg:#0f172a;--card:#0b1220;--muted:#9aa4bf;--accent:#7c3aed;--glass:rgba(255,255,255,0.03)}
    html,body{height:100%;margin:0;font-family:Inter,ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,'Helvetica Neue',Arial; background:linear-gradient(180deg,#07102a 0%, #071a2f 100%);color:#e6eef8}
    .container{max-width:980px;margin:40px auto;padding:28px;background:linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0.01));border:1px solid rgba(255,255,255,0.04);border-radius:12px;box-shadow:0 6px 30px rgba(2,6,23,0.6)}
    header{display:flex;align-items:center;gap:16px}
    .logo{width:66px;height:66px;background:linear-gradient(135deg,var(--accent),#4f46e5);border-radius:12px;display:flex;align-items:center;justify-content:center;font-weight:700;color:white;font-size:26px}
    h1{margin:0;font-size:22px}
    p.lead{color:var(--muted);margin-top:6px}
    .grid{display:grid;grid-template-columns:1fr 320px;gap:20px;margin-top:22px}
    .card{background:var(--card);padding:18px;border-radius:10px;border:1px solid rgba(255,255,255,0.03)}
    .section-title{font-weight:600;margin-bottom:10px}
    ul{margin:8px 0 12px 18px;color:var(--muted)}
    pre{background:var(--glass);padding:12px;border-radius:8px;overflow:auto;color:#dbeafe}
    code{font-family:SFMono-Regular,Menlo,Monaco,Consolas,"Liberation Mono","Courier New",monospace;background:transparent}
    .badge{display:inline-block;padding:6px 10px;border-radius:999px;background:rgba(255,255,255,0.03);color:var(--muted);font-size:13px;margin-right:8px}
    .features{display:grid;grid-template-columns:repeat(2,1fr);gap:12px}
    footer{margin-top:22px;border-top:1px solid rgba(255,255,255,0.02);padding-top:14px;color:var(--muted);font-size:13px}
    @media (max-width:900px){.grid{grid-template-columns:1fr}.features{grid-template-columns:1fr}}
  </style>
</head>
<body>
  <div class="container">
    <header>
      <div class="logo">HS</div>
      <div>
        <h1>Home Service Application</h1>
        <p class="lead">Worker–Client booking platform • Django + Django REST Framework • React + Tailwind CSS</p>
      </div>
    </header>

    <div style="margin-top:18px">
      <span class="badge">Python</span>
      <span class="badge">Django</span>
      <span class="badge">DRF</span>
      <span class="badge">React</span>
      <span class="badge">Tailwind</span>
      <span class="badge">JWT</span>
    </div>

    <div class="grid">
      <main class="card">
        <h2 class="section-title">Overview</h2>
        <p style="color:var(--muted)">A full-stack application where <strong>workers</strong> create profiles and list services, and <strong>homeowners/clients</strong> register and book those services. Designed to be responsive, secure, and easy to extend.</p>

        <h3 class="section-title" style="margin-top:18px">Key Features</h3>
        <div class="features">
          <div>
            <strong>Worker</strong>
            <ul>
              <li>Create & manage professional profile</li>
              <li>Add skills, pricing and availability</li>
              <li>View & accept bookings</li>
            </ul>
          </div>
          <div>
            <strong>Client</strong>
            <ul>
              <li>Register/login with JWT</li>
              <li>Browse workers by category</li>
              <li>Book services & view history</li>
            </ul>
          </div>
        </div>

        <h3 class="section-title" style="margin-top:18px">Project Structure</h3>
        <pre><code>Home-client-worker/
├── backend/        # Django project & APIs (workers, clients, bookings, auth)
└── frontend/       # React app (components, pages, services, hooks)
</code></pre>

        <h3 class="section-title" style="margin-top:18px">Installation</h3>
        <p style="color:var(--muted)">Clone, install backend dependencies, migrate DB, then run frontend.</p>

        <pre><code># clone
git clone https://github.com/AnasNihal/Home-client-worker.git
cd Home-client-worker

# backend (example)
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver

# frontend (example)
cd ../frontend
npm install
npm run dev
</code></pre>

        <h3 class="section-title" style="margin-top:18px">API & Auth</h3>
        <p style="color:var(--muted)">Backend exposes REST endpoints (DRF). Authentication uses JSON Web Tokens (JWT). Use Postman or the React app to obtain tokens and call protected endpoints.</p>

        <h3 class="section-title" style="margin-top:18px">Screenshots</h3>
        <p style="color:var(--muted)">Place images under <code>/screenshots</code> and reference them here for the README preview on GitHub.</p>

        <h3 class="section-title" style="margin-top:18px">Roadmap</h3>
        <ul>
          <li>Payment integration (Razorpay / Stripe)</li>
          <li>Worker calendar & scheduling</li>
          <li>Ratings & reviews</li>
          <li>Admin dashboard</li>
        </ul>

        <h3 class="section-title" style="margin-top:18px">Contributing</h3>
        <p style="color:var(--muted)">PRs and issues are welcome — fork the repo, create a branch, and open a pull request with a clear description.</p>

        <h3 class="section-title" style="margin-top:18px">License</h3>
        <p style="color:var(--muted)">MIT License — see <code>LICENSE</code> for details.</p>
      </main>

      <aside class="card">
        <h3 class="section-title">Quick Links</h3>
        <ul>
          <li><strong>Repo:</strong> <a href="https://github.com/AnasNihal/Home-client-worker" target="_blank" style="color:#dbeafe">GitHub</a></li>
          <li><strong>Backend:</strong> <span style="color:var(--muted)">/backend</span></li>
          <li><strong>Frontend:</strong> <span style="color:var(--muted)">/frontend</span></li>
        </ul>

        <h3 class="section-title" style="margin-top:14px">Commands</h3>
        <pre><code># run backend
python manage.py runserver

# run frontend
npm run dev
</code></pre>

        <h3 class="section-title" style="margin-top:14px">Contact</h3>
        <p style="color:var(--muted)">Open an issue on GitHub for bugs or feature requests.</p>
      </aside>
    </div>

    <footer>
      <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap">
        <div>Made with ❤️ • Django + DRF + React</div>
        <div>This is from Sumana.</div>
      </div>
    </footer>
  </div>
</body>
</html>
