# Nirikshan Scanner

A compliance-checking system for India's **Legal Metrology (Packaged
Commodities) Rules, 2011**. Inspectors photograph a product label, the app
runs OCR, extracts the required declarations (MRP, net quantity, mfg date,
manufacturer details, etc.), and checks them against a rule engine.

- `backend/` — FastAPI + SQLAlchemy + SQLite (Postgres-ready)
- `frontend-web/` — React + TypeScript + MUI dashboard
- `mobile-app/` — Flutter app (partially scaffolded — see note below)

## Quick start (backend)

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
python seed_demo_data.py        # creates demo login: admin@Nirikshan.test / Admin@123
uvicorn app.main:app --reload   # http://localhost:8000
```

API docs: http://localhost:8000/docs

**No OCR engine installed?** No problem — the app automatically falls back
to a clearly-labeled DEMO MODE that returns realistic sample label data, so
the whole upload → OCR → compliance-check → dashboard flow works out of the
box. To get real OCR, install the free Tesseract binary (see SETUP.md).

## Quick start (frontend)

```bash
cd frontend-web
npm install
npm run dev                     # http://localhost:5173
```

Log in with the demo credentials printed by `seed_demo_data.py`.

## Full setup guide

See **SETUP.md** for the exact tools to install on your machine and in
VS Code, plus troubleshooting.

## Mobile app note

`mobile-app/` (Flutter) is a partial scaffold — `main.dart` and the camera
scan screen exist, but the providers/services/screens for auth, results,
and offline sync are stubs. It wasn't rebuilt in this pass; ask if you'd
like it completed too.
