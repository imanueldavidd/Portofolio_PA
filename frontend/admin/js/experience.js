/**
 * experience.js
 * Logic CRUD untuk halaman Experience.
 * base.js sudah dimuat sebelumnya (auth guard + API_BASE tersedia global).
 */

const modalOverlay = document.getElementById("modal-overlay");
const modalTitle = document.getElementById("modal-title");
const expForm = document.getElementById("exp-form");
const expIdInput = document.getElementById("exp-id");
const posisiInput = document.getElementById("posisi");
const perusahaanInput = document.getElementById("perusahaan");
const durasiInput = document.getElementById("durasi");
const deskripsiInput = document.getElementById("deskripsi");
const expStatus = document.getElementById("exp-status");
const expSubmitBtn = document.getElementById("exp-submit");

function openModal(mode, exp = null) {
  expForm.reset();
  expStatus.textContent = "";
  expStatus.className = "status-text";

  if (mode === "edit" && exp) {
    modalTitle.textContent = "Edit Pengalaman";
    expIdInput.value = exp.id;
    posisiInput.value = exp.posisi;
    perusahaanInput.value = exp.perusahaan || "";
    durasiInput.value = exp.durasi || "";
    deskripsiInput.value = exp.deskripsi || "";
  } else {
    modalTitle.textContent = "Tambah Pengalaman";
    expIdInput.value = "";
  }

  modalOverlay.hidden = false;
}

function closeModal() {
  modalOverlay.hidden = true;
}

document.getElementById("btn-add-exp").addEventListener("click", () => openModal("add"));
document.getElementById("btn-cancel").addEventListener("click", closeModal);
modalOverlay.addEventListener("click", (e) => {
  if (e.target === modalOverlay) closeModal();
});

async function loadExperience() {
  const container = document.getElementById("experience-list");
  try {
    const res = await fetch(`${API_BASE}/experiences`, { credentials: "include" });
    const items = await res.json();

    if (!items.length) {
      container.innerHTML = `<p class="empty-state">Belum ada pengalaman. Klik "+ Tambah Pengalaman" untuk memulai.</p>`;
      return;
    }

    container.innerHTML = items
      .map(
        (exp) => `
        <div class="data-item">
          <div class="data-item__info">
            <span class="duration-tag">${exp.durasi || "-"}</span>
            <h3>${exp.posisi}</h3>
            <p>${exp.perusahaan || "-"}</p>
          </div>
          <div class="data-item__actions">
            <button class="btn btn--ghost btn--sm" onclick='editExp(${JSON.stringify(exp)})'>Edit</button>
            <button class="btn btn--danger btn--sm" onclick="deleteExp(${exp.id})">Hapus</button>
          </div>
        </div>`
      )
      .join("");
  } catch (err) {
    container.innerHTML = `<p class="empty-state">Gagal memuat data: ${err.message}</p>`;
  }
}

function editExp(exp) {
  openModal("edit", exp);
}

async function deleteExp(id) {
  if (!confirm("Yakin ingin menghapus pengalaman ini?")) return;
  try {
    const res = await fetch(`${API_BASE}/experiences/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (!res.ok) throw new Error("Gagal menghapus data");
    loadExperience();
  } catch (err) {
    alert(err.message);
  }
}

expForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  expSubmitBtn.disabled = true;
  expSubmitBtn.textContent = "Menyimpan...";
  expStatus.textContent = "";
  expStatus.className = "status-text";

  const id = expIdInput.value;
  const payload = {
    posisi: posisiInput.value.trim(),
    perusahaan: perusahaanInput.value.trim(),
    durasi: durasiInput.value.trim(),
    deskripsi: deskripsiInput.value.trim(),
  };

  try {
    const url = id ? `${API_BASE}/experiences/${id}` : `${API_BASE}/experiences`;
    const method = id ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Gagal menyimpan data");

    closeModal();
    loadExperience();
  } catch (err) {
    expStatus.textContent = err.message;
    expStatus.classList.add("status-text--error");
  } finally {
    expSubmitBtn.disabled = false;
    expSubmitBtn.textContent = "Simpan";
  }
});

loadExperience();