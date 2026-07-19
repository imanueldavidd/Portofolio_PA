"""
Backend/admin/experience.py
Modul CRUD untuk data Experience (pengalaman kerja/organisasi).
- GET    /api/experiences          -> ambil semua experience (publik)
- POST   /api/experiences          -> tambah experience baru (admin, wajib login)
- PUT    /api/experiences/<id>     -> update experience (admin, wajib login)
- DELETE /api/experiences/<id>     -> hapus experience (admin, wajib login)
"""

from flask import Blueprint, jsonify, request
from model import get_db_connection
from backend.admin.login import login_required

experience_bp = Blueprint("experience", __name__, url_prefix="/api/experiences")


@experience_bp.route("", methods=["GET"])
def get_experiences():
    """Publik — dipakai halaman utama untuk menampilkan riwayat pengalaman."""
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM experiences ORDER BY created_at DESC;")
        data = cursor.fetchall()
        return jsonify(data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()


@experience_bp.route("", methods=["POST"])
@login_required
def create_experience():
    """Tambah experience baru. Wajib login sebagai admin."""
    data = request.get_json()
    posisi = data.get("posisi")
    perusahaan = data.get("perusahaan", "")
    durasi = data.get("durasi", "")
    deskripsi = data.get("deskripsi", "")
    user_id = data.get("user_id", 1)

    if not posisi:
        return jsonify({"error": "posisi wajib diisi"}), 400

    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(
            """INSERT INTO experiences (user_id, posisi, perusahaan, durasi, deskripsi)
               VALUES (%s, %s, %s, %s, %s);""",
            (user_id, posisi, perusahaan, durasi, deskripsi),
        )
        return jsonify({"message": "Experience berhasil ditambahkan", "id": cursor.lastrowid}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()


@experience_bp.route("/<int:exp_id>", methods=["PUT"])
@login_required
def update_experience(exp_id):
    """Update experience berdasarkan id. Wajib login sebagai admin."""
    data = request.get_json()
    kolom_diizinkan = ["posisi", "perusahaan", "durasi", "deskripsi"]
    updates = {k: v for k, v in data.items() if k in kolom_diizinkan}

    if not updates:
        return jsonify({"error": "Tidak ada data valid untuk diupdate"}), 400

    set_clause = ", ".join([f"{kolom} = %s" for kolom in updates.keys()])
    values = list(updates.values()) + [exp_id]

    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(f"UPDATE experiences SET {set_clause} WHERE id = %s;", values)
        return jsonify({"message": "Experience berhasil diupdate"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()


@experience_bp.route("/<int:exp_id>", methods=["DELETE"])
@login_required
def delete_experience(exp_id):
    """Hapus experience berdasarkan id. Wajib login sebagai admin."""
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM experiences WHERE id = %s;", (exp_id,))
        return jsonify({"message": "Experience berhasil dihapus"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()