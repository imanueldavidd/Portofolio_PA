"""
Backend/admin/social_links.py
Modul CRUD untuk link sosial media (fleksibel, bisa platform apa saja).
- GET    /api/social-links          -> ambil semua link (publik, dipakai halaman utama)
- POST   /api/social-links          -> tambah link baru (admin, wajib login)
- PUT    /api/social-links/<id>     -> update link (admin, wajib login)
- DELETE /api/social-links/<id>     -> hapus link (admin, wajib login)
"""

from flask import Blueprint, jsonify, request
from model import get_db_connection
from backend.admin.login import login_required

social_links_bp = Blueprint("social_links", __name__, url_prefix="/api/social-links")


@social_links_bp.route("", methods=["GET"])
def get_social_links():
    """Publik — dipakai halaman utama untuk menampilkan ikon sosial media."""
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM social_links ORDER BY urutan ASC, id ASC;")
        data = cursor.fetchall()
        return jsonify(data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()


@social_links_bp.route("", methods=["POST"])
@login_required
def create_social_link():
    """Tambah link sosial media baru. Wajib login sebagai admin."""
    data = request.get_json()
    nama_platform = data.get("nama_platform")
    url = data.get("url")
    icon_class = data.get("icon_class", "")
    urutan = data.get("urutan", 0)
    user_id = data.get("user_id", 1)

    if not nama_platform or not url:
        return jsonify({"error": "nama_platform dan url wajib diisi"}), 400

    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(
            """INSERT INTO social_links (user_id, nama_platform, url, icon_class, urutan)
               VALUES (%s, %s, %s, %s, %s);""",
            (user_id, nama_platform, url, icon_class, urutan),
        )
        return jsonify({"message": "Link berhasil ditambahkan", "id": cursor.lastrowid}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()


@social_links_bp.route("/<int:link_id>", methods=["PUT"])
@login_required
def update_social_link(link_id):
    """Update link sosial media berdasarkan id. Wajib login sebagai admin."""
    data = request.get_json()
    kolom_diizinkan = ["nama_platform", "url", "icon_class", "urutan"]
    updates = {k: v for k, v in data.items() if k in kolom_diizinkan}

    if not updates:
        return jsonify({"error": "Tidak ada data valid untuk diupdate"}), 400

    set_clause = ", ".join([f"{kolom} = %s" for kolom in updates.keys()])
    values = list(updates.values()) + [link_id]

    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(f"UPDATE social_links SET {set_clause} WHERE id = %s;", values)
        return jsonify({"message": "Link berhasil diupdate"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()


@social_links_bp.route("/<int:link_id>", methods=["DELETE"])
@login_required
def delete_social_link(link_id):
    """Hapus link sosial media berdasarkan id. Wajib login sebagai admin."""
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM social_links WHERE id = %s;", (link_id,))
        return jsonify({"message": "Link berhasil dihapus"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()
