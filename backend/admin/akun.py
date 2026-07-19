"""
Backend/admin/akun.py
Modul untuk mengelola akun admin yang sedang login.
- GET /api/admin/akun   -> ambil info akun sendiri (username, role)
- PUT /api/admin/akun   -> update username dan/atau password
"""

from flask import Blueprint, jsonify, request, session
import bcrypt
from model import get_db_connection
from backend.admin.login import login_required

akun_bp = Blueprint("akun", __name__, url_prefix="/api/admin/akun")


@akun_bp.route("", methods=["GET"])
@login_required
def get_akun():
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(
            "SELECT id, username, role, created_at FROM users WHERE id = %s;",
            (session["user_id"],),
        )
        user = cursor.fetchone()
        return jsonify(user), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()


@akun_bp.route("", methods=["PUT"])
@login_required
def update_akun():
    """
    Update username dan/atau password akun yang sedang login.
    Body:
      - username (opsional)
      - password_lama (wajib kalau mau ganti password)
      - password_baru (opsional)
    """
    data = request.get_json()
    username_baru = data.get("username")
    password_lama = data.get("password_lama")
    password_baru = data.get("password_baru")

    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM users WHERE id = %s;", (session["user_id"],))
        user = cursor.fetchone()

        updates = {}

        if username_baru and username_baru != user["username"]:
            updates["username"] = username_baru

        if password_baru:
            if not password_lama:
                return jsonify({"error": "Password lama wajib diisi untuk mengganti password"}), 400
            if not bcrypt.checkpw(password_lama.encode("utf-8"), user["password_hash"].encode("utf-8")):
                return jsonify({"error": "Password lama salah"}), 401
            new_hash = bcrypt.hashpw(password_baru.encode("utf-8"), bcrypt.gensalt())
            updates["password_hash"] = new_hash.decode("utf-8")

        if not updates:
            return jsonify({"error": "Tidak ada perubahan untuk disimpan"}), 400

        set_clause = ", ".join([f"{kolom} = %s" for kolom in updates.keys()])
        values = list(updates.values()) + [session["user_id"]]
        cursor.execute(f"UPDATE users SET {set_clause} WHERE id = %s;", values)

        # Update session kalau username berubah
        if "username" in updates:
            session["username"] = updates["username"]

        return jsonify({"message": "Akun berhasil diupdate"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()