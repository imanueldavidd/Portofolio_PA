/**
 * projects.js
 * Logic CRUD untuk halaman Projects, termasuk upload gambar ke Cloudinary.
 * Berbeda dari skills/experience: request POST & PUT di sini pakai FormData
 * (multipart/form-data), BUKAN JSON, karena ada file gambar.
 * base.js sudah dimuat sebelumnya (auth guard + API_BASE tersedia global).
 */

const modalOverlay = document.getElementById("modal-overlay");
const modalTitle = document.getElementById("modal-title");
const projectForm = document.getElementById("project-form");
const projectIdInput = document.getElementById("project-id");
const judulInput = document.getElementById("judul");
const deskripsiInput = document.getElementById("deskripsi");
const linkInput = document.getElementById("link_project");
const gambarInput = document.getElementById("gambar");
const previewImage = document.getElementById("preview-image");
const gambarHint = document.getElementById("gambar-hint");
const projectStatus = document.getElementById("project-status");
const projectSubmitBtn = document.getElementById("project-submit");

function openModal(mode, project = null) {
  projectForm.reset();
  previewImage.style.display = "none";
  projectStatus.textContent = "";
  projectStatus.className = "status-text";

  if (mode === "edit" && project) {
    modalTitle.textContent = "Edit Proyek";
    projectIdInput.value = project.id;
    judulInput.value = project.judul;
    deskripsiInput.value = project.deskripsi || "";
    linkInput.value = project.link_project || "";
    gambarInput.required = false;
    gambarHint.textContent = "(opsional saat edit — kosongkan jika tidak ganti gambar)";
    if (project.gambar_url) {
      previewImage.src = project.gambar_url;
      previewImage.style.display = "block";
    }
  } else {
    modalTitle.textContent = "Tambah Proyek";
    projectIdInput.value = "";
    gambarInput.required = true;
    gambarHint.textContent = "(wajib diisi)";
  }

  modalOverlay.hidden = false;
}

function closeModal() {
  modalOverlay.hidden = true;
}

document.getElementById("btn-add-project").addEventListener("click", () => openModal("add"));
document.getElementById("btn-cancel").addEventListener("click", closeModal);
modalOverlay.addEventListener("click", (e) => {
  if (e.target === modalOverlay) closeModal();
});

// Preview gambar yang baru dipilih sebelum upload
gambarInput.addEventListener("change", () => {
  const file = gambarInput.files[0];
  if (file) {
    previewImage.src = URL.createObjectURL(file);
    previewImage.style.display = "block";
  }
});

async function loadProjects() {
  const container = document.getElementById("projects-list");
  try {
    const res = await fetch(`${API_BASE}/projects`, { credentials: "include" });
    const items = await res.json();

    if (!items.length) {
      container.innerHTML = `<p class="empty-state">Belum ada proyek. Klik "+ Tambah Proyek" untuk memulai.</p>`;
      return;
    }

    container.innerHTML = items
      .map(
        (p) => `
        <div class="project-admin-card">
          <img class="project-admin-card__image" src="${p.gambar_url || 'https://via.placeholder.com/400x250?text=Proyek'}" alt="${p.judul}" />
          <div class="project-admin-card__body">
            <h3 class="project-admin-card__title">${p.judul}</h3>
            <p class="project-admin-card__desc">${p.deskripsi || ""}</p>
            <div class="project-admin-card__actions">
              <button class="btn btn--ghost btn--sm" onclick='editProject(${JSON.stringify(p)})'>Edit</button>
              <button class="btn btn--danger btn--sm" onclick="deleteProject(${p.id})">Hapus</button>
            </div>
          </div>
        </div>`
      )
      .join("");
  } catch (err) {
    container.innerHTML = `<p class="empty-state">Gagal memuat data: ${err.message}</p>`;
  }
}

function editProject(project) {
  openModal("edit", project);
}

async function deleteProject(id) {
  if (!confirm("Yakin ingin menghapus proyek ini?")) return;
  try {
    const res = await fetch(`${API_BASE}/projects/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (!res.ok) throw new Error("Gagal menghapus data");
    loadProjects();
  } catch (err) {
    alert(err.message);
  }
}

projectForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  projectSubmitBtn.disabled = true;
  projectSubmitBtn.textContent = "Menyimpan...";
  projectStatus.textContent = "";
  projectStatus.className = "status-text";

  const id = projectIdInput.value;

  // Pakai FormData karena ada file gambar (bukan JSON)
  const formData = new FormData();
  formData.append("judul", judulInput.value.trim());
  formData.append("deskripsi", deskripsiInput.value.trim());
  formData.append("link_project", linkInput.value.trim());
  if (gambarInput.files[0]) {
    formData.append("gambar", gambarInput.files[0]);
  }

  try {
    const url = id ? `${API_BASE}/projects/${id}` : `${API_BASE}/projects`;
    const method = id ? "PUT" : "POST";

    // PENTING: jangan set header Content-Type manual saat pakai FormData,
    // browser akan otomatis set multipart/form-data dengan boundary yang benar.
    const res = await fetch(url, {
      method,
      credentials: "include",
      body: formData,
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Gagal menyimpan proyek");

    closeModal();
    loadProjects();
  } catch (err) {
    projectStatus.textContent = err.message;
    projectStatus.classList.add("status-text--error");
  } finally {
    projectSubmitBtn.disabled = false;
    projectSubmitBtn.textContent = "Simpan";
  }
});

loadProjects();