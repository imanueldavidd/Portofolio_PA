"""
test_resend.py
Tes sederhana untuk memastikan koneksi ke Resend berhasil
dan bisa mengirim email.

Cara pakai:
    Jalankan: python test_resend.py
"""

import resend
from config import Config

resend.api_key = Config.RESEND_API_KEY

if __name__ == "__main__":
    try:
        print("Mengirim email tes lewat Resend...")
        response = resend.Emails.send({
            "from": Config.RESEND_FROM_EMAIL,
            "to": [Config.RESEND_TO_EMAIL],
            "subject": "Tes Koneksi Resend - Portfolio App",
            "html": "<p>Halo! Ini email tes dari aplikasi portofolio kamu.</p>"
                    "<p>Kalau kamu menerima email ini, artinya konfigurasi Resend sudah benar.</p>",
        })
        print("[OK] Email berhasil dikirim!")
        print("Response:", response)
    except Exception as e:
        print("[ERROR] Gagal mengirim email:")
        print(e)
