# 💻 Weather Explorer — Frontend Interface

Modern, responsive single-page web dashboard built with **React**, **Vite**, **Tailwind CSS**, and **Recharts**. Supports 100% OLED Pitch Black Dark Mode and Clean Light Mode.

---

## 📂 Frontend Architecture

```
frontend/
├── index.html                  # HTML entry point loading Google Fonts (Outfit / Inter)
├── package.json                # Dependencies (lucide-react, recharts, axios, tailwindcss)
├── vite.config.js              # Vite bundler configuration
├── tailwind.config.js          # Tailwind styling configuration
├── .env.example                # Environment variables template
├── .env                        # Local API configuration (Ignored by Git)
└── src/
    ├── App.jsx                 # Top navbar, clock, segmented theme switcher (Dark/Light mode)
    ├── main.jsx                # React root entry point
    ├── index.css               # Design system & high-contrast theme styling
    └── components/
        ├── InputPanel.jsx      # Location filters, 31 Gujarat cities, 28 Indian states, smart combobox
        ├── FileList.jsx        # Stored datasets explorer
        ├── Visualization.jsx   # Recharts Line/Area charts, KPI summary cards & paginated records table
        └── LoadingSpinner.jsx  # Glassmorphic loading spinner
```

---

## 🚀 Running Frontend Locally

```bash
# 1. Navigate to frontend directory
cd frontend

# 2. Install dependencies
npm install

# 3. Launch Vite dev server
npm run dev
```
Frontend web application will be live at `http://localhost:5173`
