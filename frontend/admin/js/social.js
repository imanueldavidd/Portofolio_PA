/**
 * social.js
 * Logic CRUD untuk halaman Social Links.
 * base.js sudah dimuat sebelumnya (auth guard + API_BASE tersedia global).
 */

const modalOverlay = document.getElementById("modal-overlay");
const modalTitle = document.getElementById("modal-title");
const socialForm = document.getElementById("social-form");
const socialIdInput = document.getElementById("social-id");
const namaPlatformInput = document.getElementById("nama_platform");
const urlInput = document.getElementById("url");
const iconClassInput = document.getElementById("icon_class");
const socialStatus = document.getElementById("social-status");
const socialSubmitBtn = document.getElementById("social-submit");

function openModal(mode, link = null) {
  socialForm.reset();
  socialStatus.textContent = "";
  socialStatus.className = "status-text";

  if (mode === "edit" && link) {
    modalTitle.textContent = "Edit Link Sosial Media";
    socialIdInput.value = link.id;
    namaPlatformInput.value = link.nama_platform;
    urlInput.value = link.url;
    iconClassInput.value = link.icon_class || "";
  } else {
    modalTitle.textContent = "Tambah Link Sosial Media";
    socialIdInput.value = "";
  }

  modalOverlay.hidden = false;
}

function closeModal() {
  modalOverlay.hidden = true;
}

document.getElementById("btn-add-social").addEventListener("click", () => openModal("add"));
document.getElementById("btn-cancel").addEventListener("click", closeModal);
modalOverlay.addEventListener("click", (e) => {
  if (e.target === modalOverlay) closeModal();
});

async function loadSocialLinks() {
  const container = document.getElementById("social-list");
  try {
    const res = await fetch(`${API_BASE}/social-links`, { credentials: "include" });
    const items = await res.json();

    if (!items.length) {
      container.innerHTML = `<p class="empty-state">Belum ada link sosial media. Klik "+ Tambah Link" untuk memulai.</p>`;
      return;
    }

    container.innerHTML = items
      .map(
        (link) => `
        <div class="data-item">
          <div class="data-item__info">
            <span class="platform-badge">${link.nama_platform}</span>
            <h3>${link.url}</h3>
          </div>
          <div class="data-item__actions">
            <button class="btn btn--ghost btn--sm" onclick='editSocial(${JSON.stringify(link)})'>Edit</button>
            <button class="btn btn--danger btn--sm" onclick="deleteSocial(${link.id})">Hapus</button>
          </div>
        </div>`
      )
      .join("");
  } catch (err) {
    container.innerHTML = `<p class="empty-state">Gagal memuat data: ${err.message}</p>`;
  }
}

function editSocial(link) {
  openModal("edit", link);
}

async function deleteSocial(id) {
  if (!confirm("Yakin ingin menghapus link ini?")) return;
  try {
    const res = await fetch(`${API_BASE}/social-links/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (!res.ok) throw new Error("Gagal menghapus data");
    loadSocialLinks();
  } catch (err) {
    alert(err.message);
  }
}

socialForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  socialSubmitBtn.disabled = true;
  socialSubmitBtn.textContent = "Menyimpan...";
  socialStatus.textContent = "";
  socialStatus.className = "status-text";

  const id = socialIdInput.value;
  const payload = {
    nama_platform: namaPlatformInput.value.trim(),
    url: urlInput.value.trim(),
    icon_class: iconClassInput.value.trim(),
  };

  try {
    const url = id ? `${API_BASE}/social-links/${id}` : `${API_BASE}/social-links`;
    const method = id ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Gagal menyimpan link");

    closeModal();
    loadSocialLinks();
  } catch (err) {
    socialStatus.textContent = err.message;
    socialStatus.classList.add("status-text--error");
  } finally {
    socialSubmitBtn.disabled = false;
    socialSubmitBtn.textContent = "Simpan";
  }
});

loadSocialLinks();