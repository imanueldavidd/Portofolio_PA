"""
Backend/admin/dashboard.py
Modul untuk menyediakan data ringkasan (statistik) di halaman Dashboard admin.
- GET /api/admin/dashboard  -> jumlah data + beberapa item terbaru (wajib login)
"""

from flask import Blueprint, jsonify
from model import get_db_connection
from backend.admin.login import login_required

dashboard_bp = Blueprint("dashboard", __name__, url_prefix="/api/admin/dashboard")


@dashboard_bp.route("", methods=["GET"])
@login_required
def get_dashboard():
    conn = get_db_connection()
    try:
        cursor = conn.cursor()

        cursor.execute("SELECT COUNT(*) AS total FROM experiences;")
        total_experience = cursor.fetchone()["total"]

        cursor.execute("SELECT COUNT(*) AS total FROM projects;")
        total_projects = cursor.fetchone()["total"]

        cursor.execute("SELECT COUNT(*) AS total FROM skills;")
        total_skills = cursor.fetchone()["total"]

        cursor.execute("SELECT * FROM experiences ORDER BY created_at DESC LIMIT 3;")
        recent_experience = cursor.fetchall()

        cursor.execute("SELECT * FROM projects ORDER BY created_at DESC LIMIT 3;")
        recent_projects = cursor.fetchall()

        cursor.execute("SELECT * FROM skills ORDER BY id DESC LIMIT 5;")
        recent_skills = cursor.fetchall()

        return jsonify({
            "total_experience": total_experience,
            "total_projects": total_projects,
            "total_skills": total_skills,
            "recent_experience": recent_experience,
            "recent_projects": recent_projects,
            "recent_skills": recent_skills,
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()