# Flask Survey Backend with PostgreSQL

This is a Flask-based backend for the survey application, using PostgreSQL as the database.

## Prerequisites
- Python 3.x
- PostgreSQL installed and running
- A database named `tnelection` created in PostgreSQL

## Setup

1. **Install Dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Configure Environment:**
   Create a `.env` file (or update your existing one) with your PostgreSQL connection string:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/tnelection"
   ```

3. **Initialize Database:**
   This script will create the tables and seed an admin user (`admin@example.com` / `admin-password`).
   ```bash
   python create_db.py
   ```

4. **Run the Application:**
   ```bash
   python app.py
   ```
   The server will run on `http://localhost:5000`.

## API Endpoints

- `POST /api/survey`: Submit a survey
- `POST /api/admin/login`: Admin login
- `GET /api/reports`: Get aggregated survey reports

## Frontend Connection
If you are using the React frontend, make sure to update your API calls to point to `http://localhost:5000/api` instead of the original Express server.
