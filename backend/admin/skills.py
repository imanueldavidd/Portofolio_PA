"""
Backend/admin/skills.py
Modul CRUD untuk data Skills.
- GET    /api/skills          -> ambil semua skill (dipakai halaman utama & admin)
- POST   /api/skills          -> tambah skill baru (khusus admin, wajib login)
- PUT    /api/skills/<id>     -> update skill (khusus admin, wajib login)
- DELETE /api/skills/<id>     -> hapus skill (khusus admin, wajib login)
"""

from flask import Blueprint, jsonify, request
from model import get_db_connection
from backend.admin.login import login_required

skills_bp = Blueprint("skills", __name__, url_prefix="/api/skills")


@skills_bp.route("", methods=["GET"])
def get_skills():
    """Publik — dipakai halaman utama untuk menampilkan daftar skill."""
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM skills ORDER BY id ASC;")
        data = cursor.fetchall()
        return jsonify(data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()


@skills_bp.route("", methods=["POST"])
@login_required
def create_skill():
    """Tambah skill baru. Wajib login sebagai admin."""
    data = request.get_json()
    nama_skill = data.get("nama_skill")
    icon_class = data.get("icon_class", "")
    kategori = data.get("kategori", "Lainnya")
    level = data.get("level", 70)
    deskripsi = data.get("deskripsi", "")
    user_id = data.get("user_id", 1)  # sementara default ke admin id=1

    if not nama_skill:
        return jsonify({"error": "nama_skill wajib diisi"}), 400

    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(
            """INSERT INTO skills (user_id, nama_skill, icon_class, kategori, level, deskripsi)
               VALUES (%s, %s, %s, %s, %s, %s);""",
            (user_id, nama_skill, icon_class, kategori, level, deskripsi),
        )
        return jsonify({"message": "Skill berhasil ditambahkan", "id": cursor.lastrowid}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()


@skills_bp.route("/<int:skill_id>", methods=["PUT"])
@login_required
def update_skill(skill_id):
    """Update skill berdasarkan id. Wajib login sebagai admin."""
    data = request.get_json()
    kolom_diizinkan = ["nama_skill", "icon_class", "kategori", "level", "deskripsi"]
    updates = {k: v for k, v in data.items() if k in kolom_diizinkan}

    if not updates:
        return jsonify({"error": "Tidak ada data valid untuk diupdate"}), 400

    set_clause = ", ".join([f"{kolom} = %s" for kolom in updates.keys()])
    values = list(updates.values()) + [skill_id]

    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(f"UPDATE skills SET {set_clause} WHERE id = %s;", values)
        return jsonify({"message": "Skill berhasil diupdate"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()


@skills_bp.route("/<int:skill_id>", methods=["DELETE"])
@login_required
def delete_skill(skill_id):
    """Hapus skill berdasarkan id. Wajib login sebagai admin."""
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM skills WHERE id = %s;", (skill_id,))
        return jsonify({"message": "Skill berhasil dihapus"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()