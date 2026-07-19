// =====================================================
// KONFIGURASI
// =====================================================
const API_BASE = (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
  ? "http://localhost:5000/api"
  : "/api";

// =====================================================
// UTIL
// =====================================================
async function fetchJSON(url, options = {}) {
  const res = await fetch(url, options);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Request gagal (${res.status})`);
  }
  return res.json();
}

// =====================================================
// PROFIL
// =====================================================
async function loadProfil() {
  const container = document.getElementById("about-content");
  try {
    const profil = await fetchJSON(`${API_BASE}/profil`);

    container.innerHTML = `
      <img class="about__photo" src="${profil.foto_url || 'https://via.placeholder.com/400x500?text=Foto+Profil'}" alt="Foto ${profil.nama_lengkap}" />
      <div class="about__desc">
        <p>Halo, saya <strong>${profil.nama_lengkap || ""}</strong>${profil.nama_panggilan ? ` (biasa dipanggil ${profil.nama_panggilan})` : ""}. Saat ini menempuh studi di <strong>${profil.universitas || "-"}</strong>, program studi <strong>${profil.prodi || "-"}</strong>.</p>
        <p>${profil.alamat ? `Berdomisili di ${profil.alamat}.` : ""}</p>
        <div class="about__meta">
          <div class="about__meta-item">
            <span class="about__meta-label">email</span>
            <span class="about__meta-value">${profil.email || "-"}</span>
          </div>
          <div class="about__meta-item">
            <span class="about__meta-label">telepon</span>
            <span class="about__meta-value">${profil.telepon || "-"}</span>
          </div>
          <div class="about__meta-item">
            <span class="about__meta-label">fakultas</span>
            <span class="about__meta-value">${profil.fakultas || "-"}</span>
          </div>
          <div class="about__meta-item">
            <span class="about__meta-label">semester</span>
            <span class="about__meta-value">${profil.semester || "-"}</span>
          </div>
        </div>
        <div class="social-links" id="social-links">
          <!-- diisi otomatis lewat loadSocialLinks() -->
        </div>
      </div>
    `;

    loadSocialLinks();
  } catch (err) {
    container.innerHTML = `<p class="loading-text">Gagal memuat profil: ${err.message}</p>`;
  }
}

// =====================================================
// SOCIAL LINKS
// =====================================================
async function loadSocialLinks() {
  const container = document.getElementById("social-links");
  if (!container) return;
  try {
    const links = await fetchJSON(`${API_BASE}/social-links`);
    if (!links.length) {
      container.innerHTML = "";
      return;
    }
    container.innerHTML = links
      .map(
        (link, i) => `
        <a class="social-link" href="${link.url}" target="_blank" rel="noopener" title="${link.nama_platform}">
          <i class="${link.icon_class || ''}"></i>
          <span>${link.nama_platform}</span>
        </a>`
      )
      .join("");
  } catch (err) {
    container.innerHTML = "";
  }
}

// =====================================================
// SKILLS
// =====================================================
async function loadSkills() {
  const container = document.getElementById("skills-content");
  try {
    const skills = await fetchJSON(`${API_BASE}/skills`);
    if (!skills.length) {
      container.innerHTML = `<p class="loading-text">Belum ada data skill.</p>`;
      return;
    }

    // Kelompokkan skill berdasarkan kategori
    const grouped = {};
    skills.forEach((s) => {
      const kategori = s.kategori || "Lainnya";
      if (!grouped[kategori]) grouped[kategori] = [];
      grouped[kategori].push(s);
    });

    container.innerHTML = Object.entries(grouped)
      .map(
        ([kategori, items]) => `
        <div class="skill-category">
          <h3 class="skill-category__title">${kategori}</h3>
          <div class="skill-category__items">
            ${items
              .map(
                (s, i) => `
              <div class="skill-bar-item">
                <div class="skill-bar-item__head">
                  <span class="skill-bar-item__name">
                    <i class="${s.icon_class || ""}"></i> ${s.nama_skill}
                  </span>
                  <span class="skill-bar-item__level">${s.level ?? 70}%</span>
                </div>
                <div class="skill-bar-item__track">
                  <div class="skill-bar-item__fill" style="width: ${s.level ?? 70}%;"></div>
                </div>
                ${s.deskripsi ? `<p class="skill-bar-item__desc">${s.deskripsi}</p>` : ""}
              </div>`
              )
              .join("")}
          </div>
        </div>`
      )
      .join("");
  } catch (err) {
    container.innerHTML = `<p class="loading-text">Gagal memuat skill: ${err.message}</p>`;
  }
}

// =====================================================
// EXPERIENCE
// =====================================================
async function loadExperience() {
  const container = document.getElementById("experience-content");
  try {
    const experiences = await fetchJSON(`${API_BASE}/experiences`);
    if (!experiences.length) {
      container.innerHTML = `<p class="loading-text">Belum ada data pengalaman.</p>`;
      return;
    }
    container.innerHTML = experiences
      .map(
        (exp) => `
        <div class="timeline-item">
          <p class="timeline-item__duration">${exp.durasi || ""}</p>
          <h3 class="timeline-item__title">${exp.posisi}</h3>
          <p class="timeline-item__company">${exp.perusahaan || ""}</p>
          <p class="timeline-item__desc">${exp.deskripsi || ""}</p>
        </div>`
      )
      .join("");
  } catch (err) {
    container.innerHTML = `<p class="loading-text">Gagal memuat pengalaman: ${err.message}</p>`;
  }
}

// =====================================================
// PROJECTS
// =====================================================
async function loadProjects() {
  const container = document.getElementById("projects-content");
  try {
    const projects = await fetchJSON(`${API_BASE}/projects`);
    if (!projects.length) {
      container.innerHTML = `<p class="loading-text">Belum ada data proyek.</p>`;
      return;
    }
    container.innerHTML = projects
      .map(
        (p) => `
        <div class="project-card">
          <img class="project-card__image" src="${p.gambar_url || 'https://via.placeholder.com/400x250?text=Proyek'}" alt="${p.judul}" />
          <div class="project-card__body">
            <h3 class="project-card__title">${p.judul}</h3>
            <p class="project-card__desc">${p.deskripsi || ""}</p>
            ${p.link_project ? `<a class="project-card__link" href="${p.link_project}" target="_blank" rel="noopener">Lihat proyek &rarr;</a>` : ""}
          </div>
        </div>`
      )
      .join("");
  } catch (err) {
    container.innerHTML = `<p class="loading-text">Gagal memuat proyek: ${err.message}</p>`;
  }
}

// =====================================================
// CONTACT FORM
// =====================================================
function setupContactForm() {
  const form = document.getElementById("contact-form");
  const status = document.getElementById("form-status");
  const submitBtn = document.getElementById("contact-submit");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    status.textContent = "";
    status.className = "form-status";
    submitBtn.disabled = true;
    submitBtn.textContent = "Mengirim...";

    const payload = {
      nama: document.getElementById("nama").value.trim(),
      email: document.getElementById("email").value.trim(),
      pesan: document.getElementById("pesan").value.trim(),
    };

    try {
      await fetchJSON(`${API_BASE}/kontak`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      status.textContent = "Pesan berhasil dikirim. Terima kasih!";
      status.classList.add("form-status--success");
      form.reset();
    } catch (err) {
      status.textContent = `Gagal mengirim pesan: ${err.message}`;
      status.classList.add("form-status--error");
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Kirim Pesan";
    }
  });
}

// =====================================================
// THEME TOGGLE (Dark / Light Mode)
// =====================================================
function setupThemeToggle() {
  const toggleBtn = document.getElementById("theme-toggle");
  const root = document.documentElement;

  // Ambil preferensi tersimpan, atau ikuti preferensi sistem
  const saved = localStorage.getItem("portfolio-theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const initialTheme = saved || (prefersDark ? "dark" : "light");

  applyTheme(initialTheme);

  toggleBtn.addEventListener("click", () => {
    const current = root.getAttribute("data-theme") === "dark" ? "dark" : "light";
    const next = current === "dark" ? "light" : "dark";
    applyTheme(next);
    localStorage.setItem("portfolio-theme", next);
  });

  function applyTheme(theme) {
    if (theme === "dark") {
      root.setAttribute("data-theme", "dark");
      toggleBtn.textContent = "☀️";
    } else {
      root.removeAttribute("data-theme");
      toggleBtn.textContent = "🌙";
    }
  }
}

// =====================================================
// SCROLL REVEAL ANIMATION
// =====================================================
function setupScrollReveal() {
  const targets = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window)) {
    targets.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  targets.forEach((el) => observer.observe(el));
}

// =====================================================
// INIT
// =====================================================
document.addEventListener("DOMContentLoaded", () => {
  setupThemeToggle();
  setupScrollReveal();
  loadProfil();
  loadSkills();
  loadExperience();
  loadProjects();
  setupContactForm();
});