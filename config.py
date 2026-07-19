"""
config.py
Memuat seluruh konfigurasi aplikasi dari file .env
Wajib menggunakan os.getenv() sesuai ketentuan tugas.
"""

import os
from dotenv import load_dotenv

# Load isi file .env ke environment sistem
load_dotenv()


class Config:
    # --- Flask ---
    SECRET_KEY = os.getenv("FLASK_SECRET_KEY", "fallback-secret-key")
    DEBUG = os.getenv("FLASK_DEBUG", "False") == "True"

    # --- TiDB / Database ---
    DB_HOST = os.getenv("DB_HOST")
    DB_PORT = int(os.getenv("DB_PORT", 4000))
    DB_USER = os.getenv("DB_USER")
    DB_PASSWORD = os.getenv("DB_PASSWORD")
    DB_NAME = os.getenv("DB_NAME")
    DB_SSL_CA = os.getenv("DB_SSL_CA")

    # --- Cloudinary ---
    CLOUDINARY_CLOUD_NAME = os.getenv("CLOUDINARY_CLOUD_NAME")
    CLOUDINARY_API_KEY = os.getenv("CLOUDINARY_API_KEY")
    CLOUDINARY_API_SECRET = os.getenv("CLOUDINARY_API_SECRET")

    # --- Resend ---
    RESEND_API_KEY = os.getenv("RESEND_API_KEY")
    RESEND_FROM_EMAIL = os.getenv("RESEND_FROM_EMAIL")
    RESEND_TO_EMAIL = os.getenv("RESEND_TO_EMAIL")


def validate_config():
    """
    Cek apakah semua variabel penting sudah terisi.
    Jalankan fungsi ini saat aplikasi start biar langsung ketahuan
    kalau ada kredensial yang lupa diisi.
    """
    required = [
        "DB_HOST", "DB_USER", "DB_PASSWORD", "DB_NAME",
        "CLOUDINARY_CLOUD_NAME", "CLOUDINARY_API_KEY", "CLOUDINARY_API_SECRET",
        "RESEND_API_KEY",
    ]
    missing = [key for key in required if not os.getenv(key)]
    if missing:
        print(f"[WARNING] Environment variable belum diisi: {', '.join(missing)}")
    else:
        print("[OK] Semua konfigurasi environment sudah terisi.")


if __name__ == "__main__":
    # Supaya kamu bisa tes langsung: python config.py
    validate_config()
