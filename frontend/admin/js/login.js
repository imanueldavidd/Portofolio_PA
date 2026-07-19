const API_BASE = (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
  ? "http://localhost:5000/api"
  : "/api";

// Kalau sudah login, langsung redirect ke dashboard
(async function checkExistingSession() {
  try {
    const res = await fetch(`${API_BASE}/admin/me`, { credentials: "include" });
    const data = await res.json();
    if (data.logged_in) {
      window.location.href = "dashboard.html";
    }
  } catch (err) {
    // biarkan, tetap di halaman login kalau gagal cek
  }
})();

document.getElementById("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const status = document.getElementById("login-status");
  const submitBtn = document.getElementById("login-submit");
  status.textContent = "";
  status.className = "login-status";
  submitBtn.disabled = true;
  submitBtn.textContent = "Memproses...";

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;

  try {
    const res = await fetch(`${API_BASE}/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // penting: supaya cookie session tersimpan
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Login gagal");
    }

    status.textContent = "Login berhasil, mengarahkan...";
    status.classList.add("login-status--success");

    setTimeout(() => {
      window.location.href = "dashboard.html";
    }, 600);
  } catch (err) {
    status.textContent = err.message;
    status.classList.add("login-status--error");
    submitBtn.disabled = false;
    submitBtn.textContent = "Masuk";
  }
});