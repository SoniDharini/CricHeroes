# CricHeroes Backend

This is the backend for the **CricHeroes Player Impact Analyzer**. It is built using **FastAPI** to provide high-performance REST APIs for analyzing cricket player impact. The backend interacts with a database via **SQLAlchemy**, and implements a machine learning/rule-based engine to calculate player performance and match context contribution.

## Features

- **High-Performance API**: Powered by FastAPI and Uvicorn.
- **Player Impact Engine**: Analyzes and calculates player match impact scores based on performance, match context, and pressure constraints.
- **Search Capabilities**: Simple API to search for players by name, team, or roles.
- **Historical Analysis**: Fetches moving averages (rolling impact score) and recent innings statistics.
- **PostgreSQL / SQLite Compatibility**: Built using clear SQLAlchemy schemas and models.
- **Explainable Analytics**: Highlights positive and negative drivers of a player's performance.

## Requirements

- Python 3.8+
- Recommended: `pip` and a virtual environment (like `venv`).

## Running the Backend

Follow these steps to set up and run the backend locally:

### 1. Navigate to the backend directory
Open your terminal and make sure you are in the `backend` folder:
```bash
cd backend
```

### 2. Set up a Virtual Environment (Recommended)
Create a clean environment for your dependencies to avoid conflicts:
```bash
python -m venv venv

# To activate on Windows:
.\venv\Scripts\activate

# To activate on macOS/Linux:
source venv/bin/activate
```

### 3. Install Dependencies
Install all required Python packages from the `requirements.txt` file:
```bash
pip install -r requirements.txt
```

### 4. Start the Server
Run the FastAPI application with `uvicorn` in development mode (with auto-reload enabled):
```bash
uvicorn app.main:app --reload
```

By default, the backend will run at `http://localhost:8000`. 
- The APIs are accessible at `http://localhost:8000/api`
- Health check available at `http://localhost:8000/health`
- **Interactive Documentation**: You can access the Swagger UI documentation by navigating to `http://localhost:8000/docs` in your browser.

## Project Structure

- `app/api`: Contains the API routers (e.g., `player_router.py`).
- `app/core`: Configuration and database injection (`db.py`).
- `app/models`: SQLAlchemy Database models mapping to tables.
- `app/schemas`: Pydantic models for data validation and API payloads.
- `app/services`: Core logic (e.g., `impact_engine.py`) detailing exactly how the impact metrics are calculated.
- `scripts`: Contains auxiliary scripts for training machine learning models or ingesting data.
