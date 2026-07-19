/**
 * profil.js
 * Logic untuk halaman admin Profil: tampilkan data saat ini, dan update via form.
 * base.js sudah dimuat sebelumnya (auth guard + API_BASE tersedia global).
 */

let profilId = null;

const fields = [
  "nama_lengkap", "nama_panggilan", "email", "telepon",
  "tempat_lahir", "tanggal_lahir", "universitas", "fakultas",
  "prodi", "semester", "alamat",
];

async function loadProfilAdmin() {
  try {
    const res = await fetch(`${API_BASE}/profil`, { credentials: "include" });
    const profil = await res.json();

    if (!profil.id) {
      document.getElementById("profil-status").textContent = "Profil belum tersedia di database.";
      return;
    }

    profilId = profil.id;

    fields.forEach((field) => {
      const el = document.getElementById(field);
      if (el && profil[field] !== null && profil[field] !== undefined) {
        el.value = profil[field];
      }
    });

    if (profil.foto_url) {
      document.getElementById("preview-foto").src = profil.foto_url;
    }
  } catch (err) {
    document.getElementById("profil-status").textContent = `Gagal memuat profil: ${err.message}`;
    document.getElementById("profil-status").classList.add("status-text--error");
  }
}

// Preview foto baru sebelum upload
document.getElementById("foto").addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (file) {
    document.getElementById("preview-foto").src = URL.createObjectURL(file);
  }
});

document.getElementById("profil-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const status = document.getElementById("profil-status");
  const btn = document.getElementById("profil-submit");
  status.textContent = "";
  status.className = "status-text";
  btn.disabled = true;
  btn.textContent = "Menyimpan...";

  const formData = new FormData();
  fields.forEach((field) => {
    const el = document.getElementById(field);
    formData.append(field, el.value);
  });

  const fotoFile = document.getElementById("foto").files[0];
  if (fotoFile) {
    formData.append("foto", fotoFile);
  }

  try {
    const res = await fetch(`${API_BASE}/profil/${profilId}`, {
      method: "PUT",
      credentials: "include",
      body: formData,
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Gagal menyimpan profil");

    status.textContent = "Profil berhasil diperbarui.";
    status.classList.add("status-text--success");
  } catch (err) {
    status.textContent = err.message;
    status.classList.add("status-text--error");
  } finally {
    btn.disabled = false;
    btn.textContent = "Simpan Perubahan";
  }
});

loadProfilAdmin();