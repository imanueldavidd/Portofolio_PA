"""
Backend/admin/login.py
Modul autentikasi admin.
- POST /api/admin/login   -> cek username & password, simpan session kalau valid
- POST /api/admin/logout  -> hapus session
- GET  /api/admin/me      -> cek apakah sedang login (dipakai frontend admin)
"""

from functools import wraps
from flask import Blueprint, jsonify, request, session
import bcrypt
from model import get_db_connection

login_bp = Blueprint("login", __name__, url_prefix="/api/admin")


def login_required(fn):
    """Decorator untuk melindungi endpoint admin lain (dipakai di langkah selanjutnya)."""
    @wraps(fn)
    def wrapper(*args, **kwargs):
        if not session.get("user_id"):
            return jsonify({"error": "Belum login"}), 401
        return fn(*args, **kwargs)
    return wrapper


@login_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        return jsonify({"error": "Username dan password wajib diisi"}), 400

    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM users WHERE username = %s;", (username,))
        user = cursor.fetchone()

        if not user:
            return jsonify({"error": "Username atau password salah"}), 401

        if not bcrypt.checkpw(password.encode("utf-8"), user["password_hash"].encode("utf-8")):
            return jsonify({"error": "Username atau password salah"}), 401

        # Simpan session
        session["user_id"] = user["id"]
        session["username"] = user["username"]
        session["role"] = user["role"]

        return jsonify({
            "message": "Login berhasil",
            "user": {"id": user["id"], "username": user["username"], "role": user["role"]},
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()


@login_bp.route("/logout", methods=["POST"])
def logout():
    session.clear()
    return jsonify({"message": "Logout berhasil"}), 200


@login_bp.route("/me", methods=["GET"])
def me():
    if not session.get("user_id"):
        return jsonify({"logged_in": False}), 200
    return jsonify({
        "logged_in": True,
        "user": {
            "id": session.get("user_id"),
            "username": session.get("username"),
            "role": session.get("role"),
        },
    }), 200