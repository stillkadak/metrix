# Setup Guide

## 1. Install on your computer

| Tool | Version | Why | Link |
|---|---|---|---|
| **Python** | 3.11 or 3.12 | Runs the FastAPI backend | https://www.python.org/downloads/ |
| **Node.js** | 20 LTS (includes npm) | Runs/builds the React frontend | https://nodejs.org/ |
| **Git** | latest | Clone/manage the code | https://git-scm.com/downloads |
| **Tesseract OCR** (optional but recommended) | latest | Real text extraction from label photos. Without it, the app runs in DEMO MODE with sample data instead of crashing. | see below |

Everything else (FastAPI, React, SQLAlchemy, MUI, etc.) is installed automatically via `pip install -r requirements.txt` and `npm install` — you don't need to install those yourself.

**You do NOT need to install:** Docker, Postgres, Redis, or any GPU/ML library (PaddleOCR, OpenCV, TensorFlow) to run this project. Those are optional upgrades for later, not requirements.

### Installing Tesseract (for real OCR instead of demo mode)
- **Windows:** download the installer from https://github.com/UB-Mannheim/tesseract/wiki, then add the install folder to your PATH.
- **macOS:** `brew install tesseract`
- **Linux (Debian/Ubuntu):** `sudo apt install tesseract-ocr`

Verify it worked: `tesseract --version`

## 2. VS Code

Download VS Code: https://code.visualstudio.com/

### Recommended extensions
| Extension | Purpose |
|---|---|
| **Python** (Microsoft) | Python IntelliSense, debugging, run backend from VS Code |
| **Pylance** | Fast Python type checking |
| **ESLint** | Catches JS/TS errors as you type |
| **Prettier — Code formatter** | Auto-formats React/TypeScript code |
| **ES7+ React/Redux/React-Native snippets** | Faster React component authoring |
| **Tailwind CSS IntelliSense** | Only needed if you later add Tailwind |
| **SQLite Viewer** | Inspect `legal_metrix.db` visually without a separate DB tool |
| **Thunder Client** or **REST Client** | Test the FastAPI endpoints without leaving VS Code |
| **Docker** (Microsoft) | Only needed if you use `docker-compose.yml` |

Install any of these from the Extensions panel (`Ctrl+Shift+X` / `Cmd+Shift+X`) — search the name and click Install.

## 3. Running the project

Open the project folder in VS Code, then open **two terminals** (`` Ctrl+` ``):

**Terminal 1 — backend**
```bash
cd backend
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt
python seed_demo_data.py
uvicorn app.main:app --reload
```

**Terminal 2 — frontend**
```bash
cd frontend-web
npm install
npm run dev
```

Then open http://localhost:5173 and log in with:
- `admin@Nirikshan.test` / `Admin@123`

## 4. What files matter for what

| I want to... | Edit this |
|---|---|
| Change compliance rules (MRP checks, net quantity checks, etc.) | `backend/app/services/rule_engine.py` |
| Change what fields get pulled from OCR text (regex patterns) | `backend/app/services/field_extractor.py` |
| Change the OCR engine behavior / demo-mode sample labels | `backend/app/services/ocr_service.py` |
| Add/modify an API endpoint | `backend/app/api/v1/*.py` |
| Change database tables | `backend/app/models/*.py` (then create an Alembic migration) |
| Change the dashboard UI | `frontend-web/src/pages/Dashboard.tsx` and `src/components/dashboard/` |
| Change the scan upload/list/detail UI | `frontend-web/src/pages/Scans.tsx`, `src/pages/ScanDetail.tsx`, `src/components/scans/` |
| Change colors/branding | `frontend-web/src/theme.ts` |
| Change navigation/sidebar | `frontend-web/src/components/common/Sidebar.tsx` |

## 5. Deploying later (optional, not needed to run locally)
`docker-compose.yml` at the project root is set up for a Postgres-backed
deployment if/when you want one. For local development, SQLite (the
default) is simpler and needs no setup.
