/**
 * base.js
 * Dipakai di SEMUA halaman admin (dashboard, experience, projects, skills, akun).
 * Isinya:
 * 1. Auth guard - cek apakah sudah login, kalau belum redirect ke login.html
 * 2. Handler logout
 */

const API_BASE = (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
  ? "http://localhost:5000/api"
  : "/api";

async function requireAuth() {
  try {
    const res = await fetch(`${API_BASE}/admin/me`, { credentials: "include" });
    const data = await res.json();
    if (!data.logged_in) {
      window.location.href = "login.html";
      return null;
    }
    const greeting = document.getElementById("greeting");
    if (greeting) greeting.textContent = `Halo, ${data.user.username}`;
    return data.user;
  } catch (err) {
    window.location.href = "login.html";
    return null;
  }
}

function setupLogout() {
  const logoutLink = document.getElementById("logout-link");
  if (!logoutLink) return;
  logoutLink.addEventListener("click", async (e) => {
    e.preventDefault();
    try {
      await fetch(`${API_BASE}/admin/logout`, {
        method: "POST",
        credentials: "include",
      });
    } finally {
      window.location.href = "login.html";
    }
  });
}

// Jalankan otomatis di semua halaman yang memuat file ini
requireAuth();
setupLogout();