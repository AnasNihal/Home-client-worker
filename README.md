🏠 OLTON — Home Service Application
 ██████  ██       ████████  ██████  ███    ██
██       ██          ██    ██    ██ ████   ██
██   ███ ██          ██    ██    ██ ██ ██  ██
██    ██ ██          ██    ██    ██ ██  ██ ██
 ██████  ███████     ██     ██████  ██   ████

              O L T O N   •   Home Service Platform


A modern full-stack platform where workers offer services and clients can book home-based services easily.

Built using Django + DRF on the backend and React + Tailwind CSS on the frontend.

🛡️ Badges
<p align="left"> <img src="https://img.shields.io/badge/Python-3.10+-blue?logo=python" /> <img src="https://img.shields.io/badge/Django-REST%20Framework-green?logo=django" /> <img src="https://img.shields.io/badge/React-18-blue?logo=react" /> <img src="https://img.shields.io/badge/TailwindCSS-3.0-38BDF8?logo=tailwindcss" /> <img src="https://img.shields.io/badge/JWT-Authentication-orange" /> <img src="https://img.shields.io/badge/PostgreSQL-Database-blue?logo=postgresql" /> <img src="https://img.shields.io/badge/License-MIT-lightgrey" /> </p>
🎥 Preview (GIF Placeholder)

Replace later with your actual GIF in:

/screenshots/demo.gif

[ Demo Preview Coming Soon ]

📘 Overview

OLTON is a home service marketplace where:

🔧 Workers can

Create and update profile

Add skills, categories, pricing

Manage availability

Accept service bookings

🏡 Clients can

Register & login

Browse workers

Book home services

Track booking status

The platform is built for scalability, speed, and modern UI/UX.

🚀 Features
👨‍🔧 Worker Features

Create professional profile

Add service categories & skills

Manage pricing

Accept bookings

🧑‍💼 Client Features

Browse workers

Book a service

View and manage bookings

🔐 Authentication

JWT-based login

Protected routes

Role-based access

🎨 UI

Fully responsive

Modern Tailwind-based UI

🛠 Tech Stack
Backend

Python

Django

Django REST Framework

PostgreSQL / SQLite

JWT Authentication

Frontend

React

Tailwind CSS

Axios

React Router

📂 Project Structure
Home-client-worker/
│
├── backend/
│   ├── home_service_backend/
│   ├── workers/
│   ├── clients/
│   ├── bookings/
│   ├── auth/
│   └── manage.py
│
└── frontend/
    ├── src/
    │   ├── components/
    │   ├── pages/
    │   ├── services/
    │   ├── context/
    │   └── hooks/
    └── index.jsx

⚙️ Installation & Setup
1️⃣ Clone the repository
git clone https://github.com/AnasNihal/Home-client-worker.git
cd Home-client-worker

2️⃣ Backend Setup (Django)
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver


Backend runs at:
👉 http://127.0.0.1:8000/

3️⃣ Frontend Setup (React)
cd ../frontend
npm install
npm run dev


Frontend runs at:
👉 http://localhost:5173/

📸 Screenshots (Add Later)

Add your screenshots in:

/screenshots
  home.png
  worker-profile.png
  bookings.png
  demo.gif

🛣️ Roadmap

 Worker profiles

 JWT Authentication

 Payment integration

 Worker scheduling calendar

 Ratings & reviews

 Admin dashboard

 Real-time notifications

🤝 Contributing

Contributions are welcome!

Fork the repo

Create a feature branch

Commit changes

Open a Pull Request

📜 License

This project is licensed under the MIT License.
