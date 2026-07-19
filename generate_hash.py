"""
generate_hash.py
Script sekali pakai untuk generate password hash bcrypt.
Hasil hash-nya dipakai untuk mengisi kolom password_hash di tabel users
(menggantikan placeholder REPLACE_WITH_BCRYPT_HASH di database.sql).

Cara pakai:
    python generate_hash.py
"""

import bcrypt

if __name__ == "__main__":
    password = input("Masukkan password admin yang mau kamu pakai: ")
    hashed = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt())
    print("\nHash bcrypt kamu:")
    print(hashed.decode("utf-8"))
    print("\nCopy hash di atas, lalu jalankan query ini di TiDB:")
    print(f"UPDATE users SET password_hash = '{hashed.decode('utf-8')}' WHERE username = 'admin';")