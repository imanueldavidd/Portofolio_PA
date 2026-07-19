"""
Backend/admin/projects.py
Modul CRUD untuk data Projects, termasuk upload gambar ke Cloudinary.
- GET    /api/projects          -> ambil semua project (publik)
- POST   /api/projects          -> tambah project baru + upload gambar (admin, wajib login)
- PUT    /api/projects/<id>     -> update project, gambar opsional diganti (admin, wajib login)
- DELETE /api/projects/<id>     -> hapus project (admin, wajib login)
"""

from flask import Blueprint, jsonify, request
import cloudinary.uploader
from model import get_db_connection
from backend.admin.login import login_required

projects_bp = Blueprint("projects", __name__, url_prefix="/api/projects")


@projects_bp.route("", methods=["GET"])
def get_projects():
    """Publik — dipakai halaman utama untuk menampilkan daftar project."""
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM projects ORDER BY created_at DESC;")
        data = cursor.fetchall()
        return jsonify(data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()


@projects_bp.route("", methods=["POST"])
@login_required
def create_project():
    """
    Tambah project baru. Wajib login sebagai admin.
    Dikirim sebagai multipart/form-data (bukan JSON), karena ada file gambar.
    Field yang dikirim: judul, deskripsi, link_project, gambar (file)
    """
    judul = request.form.get("judul")
    deskripsi = request.form.get("deskripsi", "")
    link_project = request.form.get("link_project", "")
    user_id = request.form.get("user_id", 1)
    file_gambar = request.files.get("gambar")

    if not judul:
        return jsonify({"error": "judul wajib diisi"}), 400

    gambar_url = None
    if file_gambar:
        try:
            hasil_upload = cloudinary.uploader.upload(file_gambar, folder="portfolio_projects")
            gambar_url = hasil_upload["secure_url"]
        except Exception as e:
            return jsonify({"error": f"Gagal upload gambar: {str(e)}"}), 500

    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(
            """INSERT INTO projects (user_id, judul, deskripsi, gambar_url, link_project)
               VALUES (%s, %s, %s, %s, %s);""",
            (user_id, judul, deskripsi, gambar_url, link_project),
        )
        return jsonify({
            "message": "Project berhasil ditambahkan",
            "id": cursor.lastrowid,
            "gambar_url": gambar_url,
        }), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()


@projects_bp.route("/<int:project_id>", methods=["PUT"])
@login_required
def update_project(project_id):
    """
    Update project. Gambar opsional — kalau tidak kirim file baru, gambar_url tidak diubah.
    Dikirim sebagai multipart/form-data.
    """
    judul = request.form.get("judul")
    deskripsi = request.form.get("deskripsi")
    link_project = request.form.get("link_project")
    file_gambar = request.files.get("gambar")

    updates = {}
    if judul:
        updates["judul"] = judul
    if deskripsi is not None:
        updates["deskripsi"] = deskripsi
    if link_project is not None:
        updates["link_project"] = link_project

    if file_gambar:
        try:
            hasil_upload = cloudinary.uploader.upload(file_gambar, folder="portfolio_projects")
            updates["gambar_url"] = hasil_upload["secure_url"]
        except Exception as e:
            return jsonify({"error": f"Gagal upload gambar: {str(e)}"}), 500

    if not updates:
        return jsonify({"error": "Tidak ada data valid untuk diupdate"}), 400

    set_clause = ", ".join([f"{kolom} = %s" for kolom in updates.keys()])
    values = list(updates.values()) + [project_id]

    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(f"UPDATE projects SET {set_clause} WHERE id = %s;", values)
        return jsonify({"message": "Project berhasil diupdate", "updates": updates}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()


@projects_bp.route("/<int:project_id>", methods=["DELETE"])
@login_required
def delete_project(project_id):
    """Hapus project berdasarkan id. Wajib login sebagai admin."""
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM projects WHERE id = %s;", (project_id,))
        return jsonify({"message": "Project berhasil dihapus"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()