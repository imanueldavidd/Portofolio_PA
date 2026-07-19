"""
api/index.py
Entry point khusus untuk deployment di Vercel (serverless function).
Vercel akan otomatis mendeteksi variabel bernama `app` di file ini
sebagai WSGI application yang harus dijalankan.

File app.py di root tetap dipakai untuk development di localhost
(dijalankan lewat `python app.py`), sedangkan file ini khusus dipanggil
oleh Vercel saat production.
"""

import sys
import os

# Supaya import "from Backend.xxx" dan "from model import ..." tetap bisa
# ditemukan meskipun file ini berada di dalam folder api/
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import create_app

app = create_app()