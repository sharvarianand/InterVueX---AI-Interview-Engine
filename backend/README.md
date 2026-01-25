# InterVueX Backend

The FastAPI backend for the InterVueX AI interview evaluation platform.

## 🚀 Quick Start

```bash
cd backend

# Create virtual environment
python -m venv venv
.\venv\Scripts\activate  # Windows
# source venv/bin/activate  # Linux/Mac

# Install dependencies
pip install -r requirements.txt

# Copy environment file
cp .env.example .env
# Edit .env with your API keys

# Run the server
uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000`

## API Documentation

Once running, visit:
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

## 📁 Project Structure

```
backend/
├── requirements.txt
├── .env.example
├── .gitignore
└── app/
    ├── main.py                     # FastAPI entry point
    ├── __init__.py
    ├── api/
    │   ├── __init__.py
    │   └── endpoints/
    │       ├── __init__.py
    │       ├── interview.py        # Interview session endpoints
    │       └── report.py           # Report endpoints
    ├── core/
    │   ├── __init__.py
    │   └── config.py               # Configuration settings
    ├── models/
    │   ├── __init__.py
    │   └── schemas.py              # Pydantic data models
    ├── services/                   # Composable AI Blocks
    │   ├── __init__.py
    │   ├── orchestrator.py         # Central decision engine
    │   ├── project_analyzer.py     # GitHub/URL scraper
    │   ├── persona_engine.py       # Evaluator personalities
    │   ├── question_generator.py   # Adaptive questioning
    │   ├── memory_engine.py        # Q&A tracking
    │   ├── evaluation_engine.py    # Scoring & reports
    │   └── pressure_engine.py      # Difficulty escalation
    └── db/
        └── __init__.py
```

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/interview/start` | Start new interview session |
| POST | `/api/v1/interview/{id}/answer` | Submit answer, get next question |
| POST | `/api/v1/interview/{id}/video-signals` | Send video behavior signals |
| GET | `/api/v1/interview/{id}/question` | Get current question |
| POST | `/api/v1/interview/{id}/end` | End session, generate report |
| GET | `/api/v1/report/{id}` | Get evaluation report |

## 🧩 Composable AI Blocks

The `services/` directory contains the independent AI blocks:

| Block | Purpose |
|-------|---------|
| **orchestrator.py** | Central decision engine - composes all blocks |
| **project_analyzer.py** | Scrapes GitHub repos and probes live deployments |
| **persona_engine.py** | Defines interviewer personalities (Professor, CTO, etc.) |
| **question_generator.py** | Generates adaptive, context-aware questions |
| **memory_engine.py** | Tracks Q&A history and performance trends |
| **evaluation_engine.py** | Scores answers and generates reports |
| **pressure_engine.py** | Adjusts difficulty based on performance |

## Example Request

### Start Interview

```bash
curl -X POST http://localhost:8000/api/v1/interview/start \
  -H "Content-Type: application/json" \
  -d '{
    "mode": "interview",
    "persona": "startup_cto",
    "github_url": "https://github.com/user/project"
  }'
```

### Submit Answer

```bash
curl -X POST http://localhost:8000/api/v1/interview/{session_id}/answer \
  -H "Content-Type: application/json" \
  -d '{
    "answer": "The architecture uses a microservices pattern..."
  }'
```

## Environment Variables

See `.env.example` for all available configuration options:

- `GEMINI_API_KEY` - Google Gemini API key for LLM
- `GITHUB_TOKEN` - (Optional) GitHub token for higher API rate limits
- `DEBUG` - Enable debug mode
