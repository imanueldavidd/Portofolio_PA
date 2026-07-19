/**
 * dashboard.js
 * Mengambil data statistik dari /api/admin/dashboard dan menampilkannya.
 * Catatan: base.js sudah dimuat sebelum file ini, jadi requireAuth() sudah jalan.
 */

async function loadDashboard() {
  try {
    const res = await fetch(`${API_BASE}/admin/dashboard`, { credentials: "include" });
    if (!res.ok) throw new Error("Gagal memuat data dashboard");
    const data = await res.json();

    renderStatCards(data);
    renderRecentExperience(data.recent_experience);
    renderRecentProjects(data.recent_projects);
    renderRecentSkills(data.recent_skills);
  } catch (err) {
    document.getElementById("stat-grid").innerHTML = `<p class="empty-state">${err.message}</p>`;
  }
}

function renderStatCards(data) {
  const container = document.getElementById("stat-grid");
  container.innerHTML = `
    <div class="stat-card">
      <div class="stat-card__icon">💼</div>
      <div>
        <p class="stat-card__number">${data.total_experience}</p>
        <p class="stat-card__label">Pengalaman</p>
      </div>
    </div>
    <div class="stat-card">
      <div class="stat-card__icon">📁</div>
      <div>
        <p class="stat-card__number">${data.total_projects}</p>
        <p class="stat-card__label">Proyek</p>
      </div>
    </div>
    <div class="stat-card">
      <div class="stat-card__icon">⭐</div>
      <div>
        <p class="stat-card__number">${data.total_skills}</p>
        <p class="stat-card__label">Skills</p>
      </div>
    </div>
  `;
}

function renderRecentExperience(items) {
  const container = document.getElementById("recent-experience");
  if (!items.length) {
    container.innerHTML = `<p class="empty-state">Belum ada data.</p>`;
    return;
  }
  container.innerHTML = items
    .map(
      (item) => `
      <div class="mini-item">
        <p class="mini-item__title">${item.posisi}</p>
        <p class="mini-item__sub">${item.perusahaan || "-"} | ${item.durasi || "-"}</p>
      </div>`
    )
    .join("");
}

function renderRecentProjects(items) {
  const container = document.getElementById("recent-projects");
  if (!items.length) {
    container.innerHTML = `<p class="empty-state">Belum ada data.</p>`;
    return;
  }
  container.innerHTML = items
    .map(
      (item) => `
      <div class="mini-item">
        <p class="mini-item__title">${item.judul}</p>
        <p class="mini-item__sub">${item.link_project || "Tanpa link"}</p>
      </div>`
    )
    .join("");
}

function renderRecentSkills(items) {
  const container = document.getElementById("recent-skills");
  if (!items.length) {
    container.innerHTML = `<p class="empty-state">Belum ada data.</p>`;
    return;
  }
  container.innerHTML = items
    .map((item) => `<span class="mini-chip">${item.nama_skill}</span>`)
    .join("");
}

loadDashboard();