/**
 * skills.js
 * Logic CRUD untuk halaman Skills, sekarang dengan kategori, level, dan deskripsi.
 * base.js sudah dimuat sebelumnya (auth guard + API_BASE tersedia global).
 */

const modalOverlay = document.getElementById("modal-overlay");
const modalTitle = document.getElementById("modal-title");
const skillForm = document.getElementById("skill-form");
const skillIdInput = document.getElementById("skill-id");
const namaSkillInput = document.getElementById("nama_skill");
const kategoriInput = document.getElementById("kategori");
const levelInput = document.getElementById("level");
const levelDisplay = document.getElementById("level-display");
const deskripsiInput = document.getElementById("deskripsi");
const iconClassInput = document.getElementById("icon_class");
const skillStatus = document.getElementById("skill-status");
const skillSubmitBtn = document.getElementById("skill-submit");

levelInput.addEventListener("input", () => {
  levelDisplay.textContent = levelInput.value;
});

function openModal(mode, skill = null) {
  skillForm.reset();
  skillStatus.textContent = "";
  skillStatus.className = "status-text";

  if (mode === "edit" && skill) {
    modalTitle.textContent = "Edit Skill";
    skillIdInput.value = skill.id;
    namaSkillInput.value = skill.nama_skill;
    kategoriInput.value = skill.kategori || "Lainnya";
    levelInput.value = skill.level ?? 70;
    levelDisplay.textContent = skill.level ?? 70;
    deskripsiInput.value = skill.deskripsi || "";
    iconClassInput.value = skill.icon_class || "";
  } else {
    modalTitle.textContent = "Tambah Skill";
    skillIdInput.value = "";
    levelInput.value = 70;
    levelDisplay.textContent = 70;
  }

  modalOverlay.hidden = false;
}

function closeModal() {
  modalOverlay.hidden = true;
}

document.getElementById("btn-add-skill").addEventListener("click", () => openModal("add"));
document.getElementById("btn-cancel").addEventListener("click", closeModal);
modalOverlay.addEventListener("click", (e) => {
  if (e.target === modalOverlay) closeModal();
});

async function loadSkills() {
  const container = document.getElementById("skills-list");
  try {
    const res = await fetch(`${API_BASE}/skills`, { credentials: "include" });
    const skills = await res.json();

    if (!skills.length) {
      container.innerHTML = `<p class="empty-state">Belum ada skill. Klik "+ Tambah Skill" untuk memulai.</p>`;
      return;
    }

    container.innerHTML = skills
      .map(
        (s) => `
        <div class="skill-row">
          <div class="skill-row__info">
            <span class="skill-row__category">${s.kategori || "Lainnya"}</span>
            <h3>${s.nama_skill}</h3>
            ${s.deskripsi ? `<p class="skill-row__desc">${s.deskripsi}</p>` : ""}
            <div class="skill-row__bar-bg">
              <div class="skill-row__bar-fill" style="width: ${s.level ?? 70}%;"></div>
            </div>
            <span class="skill-row__level">${s.level ?? 70}%</span>
          </div>
          <div class="skill-row__actions">
            <button class="btn btn--ghost btn--sm" onclick='editSkill(${JSON.stringify(s)})'>Edit</button>
            <button class="btn btn--danger btn--sm" onclick="deleteSkill(${s.id})">Hapus</button>
          </div>
        </div>`
      )
      .join("");
  } catch (err) {
    container.innerHTML = `<p class="empty-state">Gagal memuat data: ${err.message}</p>`;
  }
}

function editSkill(skill) {
  openModal("edit", skill);
}

async function deleteSkill(id) {
  if (!confirm("Yakin ingin menghapus skill ini?")) return;
  try {
    const res = await fetch(`${API_BASE}/skills/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (!res.ok) throw new Error("Gagal menghapus skill");
    loadSkills();
  } catch (err) {
    alert(err.message);
  }
}

skillForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  skillSubmitBtn.disabled = true;
  skillSubmitBtn.textContent = "Menyimpan...";
  skillStatus.textContent = "";
  skillStatus.className = "status-text";

  const id = skillIdInput.value;
  const payload = {
    nama_skill: namaSkillInput.value.trim(),
    kategori: kategoriInput.value,
    level: parseInt(levelInput.value, 10),
    deskripsi: deskripsiInput.value.trim(),
    icon_class: iconClassInput.value.trim(),
  };

  try {
    const url = id ? `${API_BASE}/skills/${id}` : `${API_BASE}/skills`;
    const method = id ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Gagal menyimpan skill");

    closeModal();
    loadSkills();
  } catch (err) {
    skillStatus.textContent = err.message;
    skillStatus.classList.add("status-text--error");
  } finally {
    skillSubmitBtn.disabled = false;
    skillSubmitBtn.textContent = "Simpan";
  }
});

loadSkills();