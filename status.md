# Project Status & Checkpoints

This file tracks significant milestones, checkpoints, and commit logs for the Debris project.

## Checkpoint Log

| Checkpoint Name | Commit Hash | Commit Message | Branch | Date | Notes |
|---|---|---|---|---|---|
| **Baseline Teammate Checkpoint** | `9f64a23010602434e424b07d6ef49f14974180d8` | Import current project state | `Ai-services` | 2026-11-18 23:12:22 +0530 | Initial baseline state pulled from `origin/Ai-services`. Revert target if changes need to be rolled back. |
| **Commit 1: Cleanup & File Deletions** | `19b447624d33c6ded3f5ec3e6e0264c4cd46b540` | chore: remove deprecated stubs, unused scripts, and legacy RAG-pipeline folder | `Ai-services` | 2026-11-19 23:53:40 +0530 | Removed 23 dead/deprecated/duplicate files and legacy RAG-pipeline folder. |
| **Commit 2: Code Optimization & Prototype Setup** | `32a39b5c1935aca72692c3939f9478e2267fadae` | refactor: fix build errors, optimize RAG data loading, and configure prototype | `Ai-services` | 2026-11-20 00:11:52 +0530 | Fixed broken frontend router imports/sidebar, trimmed 74 bulky crime CSVs for fast demo indexing, added missing RAG deps, resolved secrets/env configs, and rebranded to Debris. |

---

## Commit 2: Code Optimization & Prototype Setup

- **Commit ID**: `32a39b5c1935aca72692c3939f9478e2267fadae` (Short: `32a39b5`)
- **Message**: `refactor: fix build errors, optimize RAG data loading, and configure prototype`

### Summary of Optimizations
1. **Frontend Build Fixes**:
   - In `frontend/src/router/index.tsx`, removed ghost imports and routes for non-existent `pages/logs/RecognitionLogs` and `pages/logs/UnknownFaces`.
   - In `frontend/src/components/layout/Sidebar.tsx`, removed broken navigation links pointing to `/logs` and `/unknown-faces`.
2. **RAG Startup Optimization**:
   - In `ai-service/rag/data/crime_statistics/`, pruned 74 large CSV files, retaining the 2 most comprehensive 2014 sample datasets (`01_District_wise_crimes_committed_IPC_2014.csv` and `42_District_wise_crimes_committed_against_women_2014.csv`) to enable near-instantaneous indexing during demo startup.
3. **AI Service Config & Dependencies**:
   - In `ai-service/main.py`, removed duplicate `rag_routes` router mounting.
   - In `ai-service/requirements.txt`, added missing core packages (`langchain-core`, `langchain-groq`, `langchain-huggingface`, `pandas`).
   - In `ai-service/config/settings.py`, updated default Groq model from `openai/gpt-oss-20b` to `llama-3.3-70b-versatile`.
   - In `backend/src/controllers/ai.controller.ts`, aligned AI proxy routes to `/api/v1/ai/...`.
4. **Backend Queues & Environment Config**:
   - In `backend/src/config/db.ts`, replaced hardcoded credentials with environment variables (`SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD`).
   - In `backend/src/config/env.ts`, strengthened fallback secrets and updated MinIO bucket default to `debris-bucket`.
   - Updated `backend/.env.example` and created `ai-service/.env.example`.
   - In `backend/src/queues/video.queue.ts`, hoisted dynamic `createSighting` import outside the loop and integrated Pino logger.
5. **Rebranding to Debris**:
   - Updated `package.json`, `start_all.py`, and `run.bat` banners to Debris.
   - Updated `README.md` with Hackathon Prototype badge, prerequisites, and streamlined startup documentation.

### Reverting Commit 2
To revert this commit and return to the state after Commit 1:
```bash
git revert 32a39b5c1935aca72692c3939f9478e2267fadae --no-edit
```

---

## Commit 1: Cleanup & File Deletions

- **Commit ID**: `19b447624d33c6ded3f5ec3e6e0264c4cd46b540` (Short: `19b4476`)
- **Message**: `chore: remove deprecated stubs, unused scripts, and legacy RAG-pipeline folder`

### Files Removed
1. **Root**:
   - `start.bat` *(Redundant duplicate of `run.bat`)*
   - `RAG-pipeline/` *(Entire folder: `universal_document_importer.py`, `index.faiss` — dead external artifact)*
2. **AI Service (`ai-service/`)**:
   - `ai-service/debug_error.txt` *(Crash traceback from developer PC)*
   - `ai-service/pipelines/unknown_pipeline.py` *(Deprecated stub)*
   - `ai-service/check_db.py` *(Ad-hoc MongoDB query script)*
   - `ai-service/debug_mongo.py` *(Ad-hoc MongoDB debugging script)*
   - `ai-service/inspect_db.py` *(Ad-hoc recognition log inspect script)*
   - `ai-service/test_faiss.py` *(One-off FAISS test script)*
   - `ai-service/test_register_and_match.py` *(Ad-hoc test script with hardcoded local paths)*
   - `ai-service/scrub_sightings.py` *(One-time data scrubbing script)*
   - `ai-service/scrub_unknowns.py` *(One-time data scrubbing script)*
   - `ai-service/reregister_embeddings.py` *(One-time migration script)*
3. **Backend (`backend/`)**:
   - `backend/src/routes/suspect.routes.ts` *(Deprecated stub)*
   - `backend/src/controllers/suspect.controller.ts` *(Deprecated stub)*
   - `backend/src/services/suspect.service.ts` *(Deprecated stub)*
   - `backend/src/models/Suspect.ts` *(Deprecated stub)*
4. **Frontend (`frontend/`)**:
   - `frontend/src/pages/suspects/Suspects.tsx` *(Deprecated stub)*
   - `frontend/test_page.mjs` *(Orphaned ad-hoc puppeteer test script)*
   - `frontend/src/App.css` *(Unused default Vite starter CSS)*
   - `frontend/src/assets/hero.png` *(Unused asset)*
   - `frontend/src/assets/react.svg` *(Unused default Vite template logo)*
   - `frontend/src/assets/vite.svg` *(Unused default Vite template logo)*

### Reverting Commit 1
To revert this commit and restore all removed files:
```bash
git revert 19b447624d33c6ded3f5ec3e6e0264c4cd46b540 --no-edit
```
Or to restore any individual file from the baseline:
```bash
git checkout 9f64a23010602434e424b07d6ef49f14974180d8 -- <path/to/file>
```

---

### Reverting to Baseline

If you ever need to reset or inspect the original baseline:

- **Inspect in detached HEAD:**
  ```bash
  git checkout 9f64a23010602434e424b07d6ef49f14974180d8
  ```

- **Hard reset branch to baseline:**
  ```bash
  git reset --hard 9f64a23010602434e424b07d6ef49f14974180d8
  ```
