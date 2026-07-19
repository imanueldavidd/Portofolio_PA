from flask import Flask
from flask_cors import CORS
from config import Config, validate_config
from model import init_cloudinary
from backend.profil.profil import profil_bp
from backend.admin.login import login_bp
from backend.admin.skills import skills_bp
from backend.admin.experience import experience_bp
from backend.admin.projects import projects_bp
from backend.profil.kontak import kontak_bp
from backend.admin.dashboard import dashboard_bp
from backend.admin.akun import akun_bp
from backend.admin.social_links import social_links_bp
 
 
def create_app():
    app = Flask(__name__)
    app.config["SECRET_KEY"] = Config.SECRET_KEY
 
    # Izinkan frontend (dibuka lewat file:// atau live server berbeda port)
    # untuk mengakses API ini, termasuk kirim cookie session (admin login)
    CORS(app, supports_credentials=True)
 
    # Cek konfigurasi environment saat aplikasi start
    validate_config()
 
    # Inisialisasi Cloudinary sekali saat aplikasi start
    init_cloudinary()
 
    # Daftarkan blueprint
    app.register_blueprint(profil_bp)
    app.register_blueprint(login_bp)
    app.register_blueprint(skills_bp)
    app.register_blueprint(experience_bp)
    app.register_blueprint(projects_bp)
    app.register_blueprint(kontak_bp)
    app.register_blueprint(dashboard_bp)
    app.register_blueprint(akun_bp)
    app.register_blueprint(social_links_bp)
 
    @app.route("/")
    def index():
        return {"message": "Portfolio API is running"}
 
    return app
 
 
if __name__ == "__main__":
    app = create_app()
    app.run(debug=Config.DEBUG, port=5000)