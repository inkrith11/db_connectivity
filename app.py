from pathlib import Path

from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from mysql.connector import Error

from db import get_connection

BASE_DIR = Path(__file__).resolve().parent
FRONTEND_DIR = BASE_DIR / "frontend"

app = Flask(__name__, static_folder=str(FRONTEND_DIR), static_url_path="")
CORS(app)


@app.get("/")
def index():
    return send_from_directory(FRONTEND_DIR, "index.html")


@app.get("/students")
def get_students():
    connection = None
    cursor = None
    try:
        connection = get_connection()
        cursor = connection.cursor(dictionary=True)
        cursor.execute(
            "SELECT id, name, email, course, created_at, updated_at FROM students ORDER BY id DESC"
        )
        students = cursor.fetchall()
        return jsonify(students)
    except Error as exc:
        return jsonify({"error": str(exc)}), 500
    finally:
        if cursor is not None:
            cursor.close()
        if connection is not None:
            connection.close()


@app.post("/students")
def create_student():
    payload = request.get_json(silent=True) or {}
    name = payload.get("name", "").strip()
    email = payload.get("email", "").strip()
    course = payload.get("course", "").strip()

    if not name or not email or not course:
        return jsonify({"error": "name, email, and course are required"}), 400

    connection = None
    cursor = None
    try:
        connection = get_connection()
        cursor = connection.cursor()
        cursor.execute(
            "INSERT INTO students (name, email, course) VALUES (%s, %s, %s)",
            (name, email, course),
        )
        connection.commit()
        student_id = cursor.lastrowid
        return jsonify({"message": "Student created", "id": student_id}), 201
    except Error as exc:
        if connection is not None:
            connection.rollback()
        status_code = 409 if getattr(exc, "errno", None) == 1062 else 500
        return jsonify({"error": str(exc)}), status_code
    finally:
        if cursor is not None:
            cursor.close()
        if connection is not None:
            connection.close()


@app.put("/students/<int:student_id>")
def update_student(student_id):
    payload = request.get_json(silent=True) or {}
    name = payload.get("name", "").strip()
    email = payload.get("email", "").strip()
    course = payload.get("course", "").strip()

    if not name or not email or not course:
        return jsonify({"error": "name, email, and course are required"}), 400

    connection = None
    cursor = None
    try:
        connection = get_connection()
        cursor = connection.cursor()
        cursor.execute(
            "UPDATE students SET name = %s, email = %s, course = %s WHERE id = %s",
            (name, email, course, student_id),
        )
        connection.commit()
        if cursor.rowcount == 0:
            return jsonify({"error": "Student not found"}), 404
        return jsonify({"message": "Student updated"})
    except Error as exc:
        if connection is not None:
            connection.rollback()
        status_code = 409 if getattr(exc, "errno", None) == 1062 else 500
        return jsonify({"error": str(exc)}), status_code
    finally:
        if cursor is not None:
            cursor.close()
        if connection is not None:
            connection.close()


@app.delete("/students/<int:student_id>")
def delete_student(student_id):
    connection = None
    cursor = None
    try:
        connection = get_connection()
        cursor = connection.cursor()
        cursor.execute("DELETE FROM students WHERE id = %s", (student_id,))
        connection.commit()
        if cursor.rowcount == 0:
            return jsonify({"error": "Student not found"}), 404
        return jsonify({"message": "Student deleted"})
    except Error as exc:
        if connection is not None:
            connection.rollback()
        return jsonify({"error": str(exc)}), 500
    finally:
        if cursor is not None:
            cursor.close()
        if connection is not None:
            connection.close()


if __name__ == "__main__":
    app.run(debug=True)
