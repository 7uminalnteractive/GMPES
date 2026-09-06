const ADMIN_PASSWORD_KEY = "gmpes_admin_pw";
const ADMIN_SESSION_KEY = "gmpes_admin_session";
const DEFAULT_ADMIN_PASSWORD = "gmpes2026";

function getAdminPassword(){
  return localStorage.getItem(ADMIN_PASSWORD_KEY) || DEFAULT_ADMIN_PASSWORD;
}

function isLoggedIn(){
  return sessionStorage.getItem(ADMIN_SESSION_KEY) === "true";
}

function money(v){
  return Number(v || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function timeAgo(iso){
  const now = new Date();
  const then = new Date(iso);
  const diffMs = now - then;
  const diffMin = Math.round(diffMs / 60000);
  if (diffMin < 60) return `há ${diffMin} min`;
  const diffH = Math.round(diffMin / 60);
  if (diffH < 24) return `há ${diffH}h`;
  const diffD = Math.round(diffH / 24);
  return `há ${diffD}d`;
}

function showPanel(){
  document.getElementById("loginScreen").style.display = "none";
  document.getElementById("adminPanel").style.display = "block";
  renderDashboard();
  renderTable();
}

function showLogin(){
  document.getElementById("loginScreen").style.display = "flex";
  document.getElementById("adminPanel").style.display = "none";
}

function setupTabs(){
  const tabs = document.querySelectorAll(".admin-tab");
  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      tabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      document.getElementById("tabDashboard").style.display = tab.dataset.tab === "dashboard" ? "block" : "none";
      document.getElementById("tabProducts").style.display = tab.dataset.tab === "products" ? "block" : "none";
      if (tab.dataset.tab === "dashboard") renderDashboard();
    });
  });
}

function setupEditorTabs(){
  const tabs = document.querySelectorAll(".admin-editor-tab");
  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      tabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      document.querySelectorAll(".admin-editor-panel").forEach(panel => {
        panel.style.display = panel.dataset.epanel === tab.dataset.etab ? "flex" : "none";
      });
    });
  });
}

function resetEditorTabs(){
  document.querySelectorAll(".admin-editor-tab").forEach((t, i) => t.classList.toggle("active", i === 0));
  document.querySelectorAll(".admin-editor-panel").forEach((p, i) => {
    p.style.display = i === 0 ? "flex" : "none";
  });
}

function renderDashboard(){
  const products = GmpesStore.getProducts();
  const summary = GmpesStore.getSalesSummary();

  document.getElementById("kpiRevenue").textContent = money(summary.total);
  document.getElementById("kpiSalesCount").textContent = summary.count;
  document.getElementById("kpiProductsCount").textContent = products.length;
  document.getElementById("kpiAvgTicket").textContent = money(summary.count ? summary.total / summary.count : 0);

  const salesList = document.getElementById("salesList");
  const sortedSales = [...summary.sales].sort((a, b) => new Date(b.date) - new Date(a.date));
  if (sortedSales.length === 0){
    salesList.innerHTML = `<p style="color:var(--text-faint); font-size:13px;">Nenhuma venda registrada ainda.</p>`;
  } else {
    salesList.innerHTML = sortedSales.slice(0, 8).map(s => `
      <div class="admin-sale-row">
        <div class="admin-sale-main">
          <div class="admin-sale-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 6h15l-1.5 9h-12L6 6Z"/><path d="M6 6 5 2H2"/><circle cx="9.5" cy="20" r="1.4" fill="currentColor" stroke="none"/><circle cx="17.5" cy="20" r="1.4" fill="currentColor" stroke="none"/></svg>
          </div>
          <div class="admin-sale-info">
            <div class="admin-sale-product">${s.productName}</div>
            <div class="admin-sale-buyer">${s.buyer}</div>
          </div>
        </div>
        <div class="admin-sale-right">
          <div class="admin-sale-amount">${money(s.amount)}</div>
          <div class="admin-sale-date">${timeAgo(s.date)}</div>
        </div>
      </div>
    `).join("");
  }

  const topList = document.getElementById("topProductsList");
  const counts = Object.entries(summary.byProduct)
    .map(([productId, count]) => {
      const product = products.find(p => p.id === productId);
      return { name: product ? product.name : productId, count };
    })
    .sort((a, b) => b.count - a.count);

  if (counts.length === 0){
    topList.innerHTML = `<p style="color:var(--text-faint); font-size:13px;">Sem dados ainda.</p>`;
  } else {
    const maxCount = counts[0].count;
    topList.innerHTML = counts.slice(0, 5).map((c, i) => `
      <div class="admin-top-row">
        <div class="admin-top-rank">${i + 1}</div>
        <div class="admin-top-info">
          <div class="admin-top-name">${c.name}</div>
          <div class="admin-top-bar-track">
            <div class="admin-top-bar-fill" style="width:${(c.count / maxCount) * 100}%"></div>
          </div>
        </div>
        <div class="admin-top-count">${c.count}x</div>
      </div>
    `).join("");
  }
}

function renderTable(){
  const products = GmpesStore.getProducts();
  const tbody = document.getElementById("adminTableBody");
  const empty = document.getElementById("adminEmpty");

  if (products.length === 0){
    tbody.innerHTML = "";
    empty.style.display = "block";
    return;
  }
  empty.style.display = "none";

  tbody.innerHTML = products.map(p => `
    <tr>
      <td><img class="admin-thumb" src="${p.img || ''}" alt="" onerror="this.style.opacity=0.2"></td>
      <td data-meta="${p.cat || ''} · ${money(p.price)}">${p.name}</td>
      <td>${p.cat || "—"}</td>
      <td>
        <span class="admin-row-price">${money(p.price)}</span>
        ${p.oldPrice ? `<span class="admin-row-old">${money(p.oldPrice)}</span>` : ""}
      </td>
      <td>${p.badge ? `<span class="admin-badge-pill">${p.badge}</span>` : "—"}</td>
      <td>
        <div class="admin-row-actions">
          <button class="admin-icon-action" data-action="edit" data-id="${p.id}" aria-label="Editar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
          </button>
          <button class="admin-icon-action danger" data-action="delete" data-id="${p.id}" aria-label="Remover">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
          </button>
        </div>
      </td>
    </tr>
  `).join("");

  tbody.querySelectorAll('[data-action="edit"]').forEach(btn => {
    btn.addEventListener("click", () => openEditModal(btn.dataset.id));
  });
  tbody.querySelectorAll('[data-action="delete"]').forEach(btn => {
    btn.addEventListener("click", () => openDeleteModal(btn.dataset.id));
  });
}

function openNewModal(){
  document.getElementById("modalTitle").textContent = "Novo patch";
  document.getElementById("productForm").reset();
  document.getElementById("productId").value = "";
  document.getElementById("previewLink").style.display = "none";
  resetEditorTabs();
  document.getElementById("modalOverlay").classList.add("open");
  document.getElementById("fieldName").focus();
}

function openEditModal(id){
  const product = GmpesStore.getProduct(id);
  if (!product) return;

  document.getElementById("modalTitle").textContent = "Editar patch";
  document.getElementById("productId").value = product.id;
  document.getElementById("fieldName").value = product.name || "";
  document.getElementById("fieldCat").value = product.cat || "";
  document.getElementById("fieldShortDesc").value = product.shortDesc || "";
  document.getElementById("fieldPrice").value = product.price ?? "";
  document.getElementById("fieldOldPrice").value = product.oldPrice ?? "";
  document.getElementById("fieldBadge").value = product.badge || "";
  document.getElementById("fieldVersion").value = product.version || "";
  document.getElementById("fieldUpdatedAt").value = product.updatedAt || "";
  document.getElementById("fieldImg").value = product.img || "";
  document.getElementById("fieldDescription").value = product.description || "";
  document.getElementById("fieldTrailer").value = product.trailerUrl || "";
  document.getElementById("fieldScreenshots").value = (product.screenshots || []).join("\n");

  const previewLink = document.getElementById("previewLink");
  previewLink.href = `patch.html?id=${encodeURIComponent(product.id)}`;
  previewLink.style.display = "inline-flex";

  resetEditorTabs();
  document.getElementById("modalOverlay").classList.add("open");
}

function closeModal(){
  document.getElementById("modalOverlay").classList.remove("open");
}

let pendingDeleteId = null;

function openDeleteModal(id){
  const product = GmpesStore.getProduct(id);
  if (!product) return;
  pendingDeleteId = id;
  document.getElementById("deleteProductName").textContent = product.name;
  document.getElementById("deleteOverlay").classList.add("open");
}

function closeDeleteModal(){
  pendingDeleteId = null;
  document.getElementById("deleteOverlay").classList.remove("open");
}

function setupLogin(){
  const loginBtn = document.getElementById("loginBtn");
  const input = document.getElementById("adminPassword");
  const error = document.getElementById("loginError");

  function attemptLogin(){
    if (input.value === getAdminPassword()){
      sessionStorage.setItem(ADMIN_SESSION_KEY, "true");
      error.textContent = "";
      showPanel();
    } else {
      error.textContent = "Senha incorreta. Tente novamente.";
    }
  }

  loginBtn.addEventListener("click", attemptLogin);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") attemptLogin();
  });
}

function setupLogout(){
  document.getElementById("logoutBtn").addEventListener("click", () => {
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
    showLogin();
  });
}

function setupModal(){
  document.getElementById("newProductBtn").addEventListener("click", openNewModal);
  document.getElementById("modalClose").addEventListener("click", closeModal);
  document.getElementById("cancelBtn").addEventListener("click", closeModal);
  document.getElementById("modalOverlay").addEventListener("click", (e) => {
    if (e.target.id === "modalOverlay") closeModal();
  });

  document.getElementById("productForm").addEventListener("submit", (e) => {
    e.preventDefault();

    const id = document.getElementById("productId").value;
    const name = document.getElementById("fieldName").value.trim();
    const cat = document.getElementById("fieldCat").value.trim();
    const shortDesc = document.getElementById("fieldShortDesc").value.trim();
    const price = parseFloat(document.getElementById("fieldPrice").value);
    const oldPriceRaw = document.getElementById("fieldOldPrice").value;
    const oldPrice = oldPriceRaw ? parseFloat(oldPriceRaw) : null;
    const badge = document.getElementById("fieldBadge").value.trim() || null;
    const version = document.getElementById("fieldVersion").value.trim() || "1.0";
    const updatedAt = document.getElementById("fieldUpdatedAt").value || null;
    const img = document.getElementById("fieldImg").value.trim() || "assets/patches/placeholder.svg";
    const description = document.getElementById("fieldDescription").value.trim();
    const trailerUrl = document.getElementById("fieldTrailer").value.trim();
    const screenshots = document.getElementById("fieldScreenshots").value
      .split("\n")
      .map(s => s.trim())
      .filter(Boolean);

    const product = {
      id: id || GmpesStore.slugify(name),
      name, cat, shortDesc, price, oldPrice, badge, version, updatedAt,
      img, description, trailerUrl, screenshots
    };

    GmpesStore.upsertProduct(product);
    closeModal();
    renderTable();
    renderDashboard();
  });
}

function setupDeleteModal(){
  document.getElementById("deleteModalClose").addEventListener("click", closeDeleteModal);
  document.getElementById("deleteCancelBtn").addEventListener("click", closeDeleteModal);
  document.getElementById("deleteOverlay").addEventListener("click", (e) => {
    if (e.target.id === "deleteOverlay") closeDeleteModal();
  });
  document.getElementById("deleteConfirmBtn").addEventListener("click", () => {
    if (pendingDeleteId){
      GmpesStore.deleteProduct(pendingDeleteId);
      closeDeleteModal();
      renderTable();
      renderDashboard();
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  setupLogin();
  setupLogout();
  setupTabs();
  setupEditorTabs();
  setupModal();
  setupDeleteModal();

  if (isLoggedIn()){
    showPanel();
  } else {
    showLogin();
  }
});
