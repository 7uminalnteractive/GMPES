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
  return Number(v).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function showPanel(){
  document.getElementById("loginScreen").style.display = "none";
  document.getElementById("adminPanel").style.display = "block";
  renderTable();
}

function showLogin(){
  document.getElementById("loginScreen").style.display = "flex";
  document.getElementById("adminPanel").style.display = "none";
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
  document.getElementById("modalOverlay").classList.add("open");
  document.getElementById("fieldName").focus();
}

function openEditModal(id){
  const products = GmpesStore.getProducts();
  const product = products.find(p => p.id === id);
  if (!product) return;

  document.getElementById("modalTitle").textContent = "Editar patch";
  document.getElementById("productId").value = product.id;
  document.getElementById("fieldName").value = product.name || "";
  document.getElementById("fieldCat").value = product.cat || "";
  document.getElementById("fieldPrice").value = product.price ?? "";
  document.getElementById("fieldOldPrice").value = product.oldPrice ?? "";
  document.getElementById("fieldBadge").value = product.badge || "";
  document.getElementById("fieldImg").value = product.img || "";
  document.getElementById("modalOverlay").classList.add("open");
}

function closeModal(){
  document.getElementById("modalOverlay").classList.remove("open");
}

let pendingDeleteId = null;

function openDeleteModal(id){
  const products = GmpesStore.getProducts();
  const product = products.find(p => p.id === id);
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
    const price = parseFloat(document.getElementById("fieldPrice").value);
    const oldPriceRaw = document.getElementById("fieldOldPrice").value;
    const oldPrice = oldPriceRaw ? parseFloat(oldPriceRaw) : null;
    const badge = document.getElementById("fieldBadge").value.trim() || null;
    const img = document.getElementById("fieldImg").value.trim() || "assets/patches/placeholder.svg";

    const product = {
      id: id || GmpesStore.slugify(name),
      name, cat, price, oldPrice, badge, img
    };

    GmpesStore.upsertProduct(product);
    closeModal();
    renderTable();
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
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  setupLogin();
  setupLogout();
  setupModal();
  setupDeleteModal();

  if (isLoggedIn()){
    showPanel();
  } else {
    showLogin();
  }
});
