/**
 * akun.js
 * Logic untuk halaman Akun: tampilkan info akun, update username, update password.
 * base.js sudah dimuat sebelumnya (auth guard + API_BASE tersedia global).
 */

async function loadAkun() {
  const container = document.getElementById("akun-info");
  try {
    const res = await fetch(`${API_BASE}/admin/akun`, { credentials: "include" });
    const user = await res.json();

    container.innerHTML = `
      <div class="akun-info__row">
        <span class="akun-info__label">username</span>
        <span>${user.username}</span>
      </div>
      <div class="akun-info__row">
        <span class="akun-info__label">role</span>
        <span>${user.role}</span>
      </div>
    `;

    document.getElementById("username_baru").placeholder = user.username;
  } catch (err) {
    container.innerHTML = `<p class="empty-state">Gagal memuat data akun: ${err.message}</p>`;
  }
}

document.getElementById("username-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const status = document.getElementById("username-status");
  const btn = document.getElementById("username-submit");
  status.textContent = "";
  status.className = "status-text";
  btn.disabled = true;
  btn.textContent = "Menyimpan...";

  const usernameBaru = document.getElementById("username_baru").value.trim();

  try {
    const res = await fetch(`${API_BASE}/admin/akun`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ username: usernameBaru }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Gagal update username");

    status.textContent = "Username berhasil diubah.";
    status.classList.add("status-text--success");
    document.getElementById("username-form").reset();
    loadAkun();
  } catch (err) {
    status.textContent = err.message;
    status.classList.add("status-text--error");
  } finally {
    btn.disabled = false;
    btn.textContent = "Simpan Username";
  }
});

document.getElementById("password-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const status = document.getElementById("password-status");
  const btn = document.getElementById("password-submit");
  status.textContent = "";
  status.className = "status-text";
  btn.disabled = true;
  btn.textContent = "Menyimpan...";

  const passwordLama = document.getElementById("password_lama").value;
  const passwordBaru = document.getElementById("password_baru").value;

  try {
    const res = await fetch(`${API_BASE}/admin/akun`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ password_lama: passwordLama, password_baru: passwordBaru }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Gagal update password");

    status.textContent = "Password berhasil diubah.";
    status.classList.add("status-text--success");
    document.getElementById("password-form").reset();
  } catch (err) {
    status.textContent = err.message;
    status.classList.add("status-text--error");
  } finally {
    btn.disabled = false;
    btn.textContent = "Simpan Password";
  }
});

loadAkun();