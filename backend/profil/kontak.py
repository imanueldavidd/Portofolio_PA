"""
Backend/profil/kontak.py
Modul untuk menangani form kontak di halaman utama.
Saat pengunjung mengisi form kontak, backend akan mengirim email
notifikasi ke pemilik portofolio lewat Resend.

- POST /api/kontak  -> terima pesan dari form kontak, kirim email via Resend
"""

from flask import Blueprint, jsonify, request
import resend
from config import Config

kontak_bp = Blueprint("kontak", __name__, url_prefix="/api/kontak")

resend.api_key = Config.RESEND_API_KEY


@kontak_bp.route("", methods=["POST"])
def kirim_kontak():
    """Terima data dari form kontak di halaman utama, lalu kirim email."""
    data = request.get_json()
    nama = data.get("nama")
    email_pengirim = data.get("email")
    pesan = data.get("pesan")

    if not nama or not email_pengirim or not pesan:
        return jsonify({"error": "nama, email, dan pesan wajib diisi"}), 400

    html_content = f"""
        <h3>Pesan baru dari form kontak portofolio</h3>
        <p><strong>Nama:</strong> {nama}</p>
        <p><strong>Email:</strong> {email_pengirim}</p>
        <p><strong>Pesan:</strong></p>
        <p>{pesan}</p>
    """

    try:
        response = resend.Emails.send({
            "from": Config.RESEND_FROM_EMAIL,
            "to": [Config.RESEND_TO_EMAIL],
            "subject": f"Pesan Baru dari {nama} - Form Kontak Portofolio",
            "html": html_content,
            "reply_to": email_pengirim,  # supaya kamu bisa langsung reply ke pengirim
        })
        return jsonify({"message": "Pesan berhasil dikirim", "resend_id": response.get("id")}), 200
    except Exception as e:
        return jsonify({"error": f"Gagal mengirim pesan: {str(e)}"}), 500