"""
test_cloudinary.py
Tes sederhana untuk memastikan koneksi ke Cloudinary berhasil
dan bisa upload gambar.

Cara pakai:
    1. Siapkan 1 file gambar contoh (misal: contoh.jpg) di folder yang sama
    2. Ganti nama file di bawah (NAMA_FILE_GAMBAR) sesuai gambar kamu
    3. Jalankan: python test_cloudinary.py
"""

import cloudinary
import cloudinary.uploader
from config import Config

# Ganti ini dengan nama file gambar yang mau kamu tes
NAMA_FILE_GAMBAR = "Test.jpeg"

# Konfigurasi Cloudinary dari .env
cloudinary.config(
    cloud_name=Config.CLOUDINARY_CLOUD_NAME,
    api_key=Config.CLOUDINARY_API_KEY,
    api_secret=Config.CLOUDINARY_API_SECRET,
    secure=True,
)

if __name__ == "__main__":
    try:
        print(f"Mengupload '{NAMA_FILE_GAMBAR}' ke Cloudinary...")
        hasil = cloudinary.uploader.upload(
            NAMA_FILE_GAMBAR,
            folder="portfolio_test",  # gambar akan masuk ke folder ini di Cloudinary
        )
        print("[OK] Upload berhasil!")
        print("URL gambar:", hasil["secure_url"])
        print("Public ID:", hasil["public_id"])
    except FileNotFoundError:
        print(f"[ERROR] File '{NAMA_FILE_GAMBAR}' tidak ditemukan.")
        print("Pastikan ada file gambar dengan nama itu di folder yang sama dengan script ini.")
    except Exception as e:
        print("[ERROR] Gagal upload ke Cloudinary:")
        print(e)
