"""
Backend/profil/profil.py
Modul untuk mengelola data profil.
- GET  /api/profil       -> ambil data profil (untuk halaman utama & admin)
- PUT  /api/profil/<id>  -> update data profil (khusus admin, wajib login)
"""

from flask import Blueprint, jsonify, request
import cloudinary.uploader
from model import get_db_connection
from backend.admin.login import login_required

profil_bp = Blueprint("profil", __name__, url_prefix="/api/profil")


@profil_bp.route("", methods=["GET"])
def get_profil():
    """Ambil data profil pertama (asumsi 1 aplikasi = 1 profil pemilik)."""
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM profiles LIMIT 1;")
        data = cursor.fetchone()
        if not data:
            return jsonify({"message": "Profil belum tersedia"}), 404
        return jsonify(data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()


@profil_bp.route("/<int:profil_id>", methods=["PUT"])
@login_required
def update_profil(profil_id):
    """
    Update data profil berdasarkan id. Wajib login sebagai admin.
    Dikirim sebagai multipart/form-data (bukan JSON), karena ada file foto opsional.
    """
    kolom_diizinkan = [
        "nama_lengkap", "nama_panggilan", "tempat_lahir", "tanggal_lahir",
        "email", "telepon", "universitas", "fakultas", "prodi",
        "semester", "alamat",
    ]

    updates = {}
    for kolom in kolom_diizinkan:
        if kolom in request.form:
            updates[kolom] = request.form.get(kolom)

    file_foto = request.files.get("foto")
    if file_foto:
        try:
            hasil_upload = cloudinary.uploader.upload(file_foto, folder="portfolio_profil")
            updates["foto_url"] = hasil_upload["secure_url"]
        except Exception as e:
            return jsonify({"error": f"Gagal upload foto: {str(e)}"}), 500

    if not updates:
        return jsonify({"error": "Tidak ada data valid untuk diupdate"}), 400

    set_clause = ", ".join([f"{kolom} = %s" for kolom in updates.keys()])
    values = list(updates.values()) + [profil_id]

    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(f"UPDATE profiles SET {set_clause} WHERE id = %s;", values)
        return jsonify({"message": "Profil berhasil diupdate", "updates": updates}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()