# Student Records Manager

A minimal CRUD demo built with MySQL, Flask, and vanilla HTML/CSS/JS.

## Features
- Create student records
- Read all students in a table
- Update existing records inline
- Delete records

## Project Structure
- `app.py` - Flask API and frontend host
- `db.py` - MySQL connection helper
- `schema.sql` - Database and table creation script
- `frontend/` - HTML, CSS, and JavaScript UI

## Setup
1. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
2. Create the database and table:
   ```bash
   mysql -u root -p < schema.sql
   ```
3. Configure MySQL credentials using environment variables or a `.env` file based on `.env.example`.
4. Start the app:
   ```bash
   python app.py
   ```
5. Open `http://127.0.0.1:5000/` in your browser.

## API
- `GET /students`
- `POST /students`
- `PUT /students/<id>`
- `DELETE /students/<id>`
