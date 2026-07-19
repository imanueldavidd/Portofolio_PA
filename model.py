"""
model.py
Berisi fungsi untuk membuka koneksi ke TiDB Cloud.
Tahap ini baru fokus ke koneksi database saja (belum Cloudinary/Resend).
"""

import pymysql
import cloudinary
from config import Config


def get_db_connection():
    """
    Membuka koneksi baru ke TiDB Cloud.
    Cara pakai:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT 1")
        print(cursor.fetchone())
        conn.close()
    """
    conn = pymysql.connect(
        host=Config.DB_HOST,
        port=Config.DB_PORT,
        user=Config.DB_USER,
        password=Config.DB_PASSWORD,
        database=Config.DB_NAME,
        ssl={"ca": Config.DB_SSL_CA} if Config.DB_SSL_CA else {"ssl": {}},
        cursorclass=pymysql.cursors.DictCursor,
        autocommit=True,
    )
    return conn


def init_cloudinary():
    """Konfigurasi Cloudinary sekali saat aplikasi start."""
    cloudinary.config(
        cloud_name=Config.CLOUDINARY_CLOUD_NAME,
        api_key=Config.CLOUDINARY_API_KEY,
        api_secret=Config.CLOUDINARY_API_SECRET,
        secure=True,
    )


if __name__ == "__main__":
    # Jalankan file ini langsung untuk tes koneksi: python model.py
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT NOW() AS waktu_server;")
        hasil = cursor.fetchone()
        print("[OK] Berhasil konek ke TiDB!")
        print("Waktu server saat ini:", hasil["waktu_server"])

        # Bonus: cek apakah tabel dari database.sql sudah ada
        cursor.execute("SHOW TABLES;")
        tabel = cursor.fetchall()
        print("Tabel yang terdeteksi di database:", tabel)

        conn.close()
    except Exception as e:
        print("[ERROR] Gagal konek ke TiDB:")
        print(e)