// ===========================================================
// GMPES — dados do catálogo (placeholder)
// Troque "img" pelas artes reais dos seus patches quando tiver.
// ===========================================================
const PRODUCTS = [
  { id: "p1",  name: "Brasil Retrô 94",        cat: "Seleções",     price: 14.90, oldPrice: null,  badge: "Popular",  img: "assets/patches/p1.svg" },
  { id: "p2",  name: "Seleção Argentina",       cat: "Seleções",     price: 14.90, oldPrice: null,  badge: null,       img: "assets/patches/p2.svg" },
  { id: "p3",  name: "Champions Elite",         cat: "Champions & Libertadores", price: 19.90, oldPrice: 24.90, badge: "Oferta", img: "assets/patches/p3.svg" },
  { id: "p4",  name: "Premier Classic",         cat: "Ligas nacionais", price: 17.90, oldPrice: null, badge: "Novo", img: "assets/patches/p4.svg" },
  { id: "p5",  name: "Bundesliga Pro",          cat: "Ligas nacionais", price: 16.90, oldPrice: null, badge: null, img: "assets/patches/p5.svg" },
  { id: "p6",  name: "Libertadores Gold",       cat: "Champions & Libertadores", price: 19.90, oldPrice: null, badge: null, img: "assets/patches/p6.svg" },
  { id: "p7",  name: "Serie A Storm",           cat: "Ligas nacionais", price: 16.90, oldPrice: null, badge: null, img: "assets/patches/p7.svg" },
  { id: "p8",  name: "Copa Nacional",           cat: "Seleções",     price: 14.90, oldPrice: null, badge: null, img: "assets/patches/p8.svg" },
  { id: "p9",  name: "Eredivisie Fox",          cat: "Ligas nacionais", price: 15.90, oldPrice: null, badge: null, img: "assets/patches/p9.svg" },
  { id: "p10", name: "MLS United",              cat: "Ligas nacionais", price: 15.90, oldPrice: null, badge: null, img: "assets/patches/p10.svg" },
  { id: "p11", name: "Liga Retrô 98",           cat: "Retrô",        price: 18.90, oldPrice: 22.90, badge: "Oferta", img: "assets/patches/p11.svg" },
  { id: "p12", name: "World Cup Edition",       cat: "Seleções",     price: 21.90, oldPrice: null, badge: "Popular", img: "assets/patches/p12.svg" },
];

const CATEGORY_LABELS = ["Todos", "Seleções", "Ligas nacionais", "Champions & Libertadores", "Retrô", "Uniformes avulsos"];

function money(v){
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function cardTemplate(p){
  const badge = p.badge
    ? `<span class="card-badge">${p.badge}</span>`
    : "";
  const oldPrice = p.oldPrice
    ? `<span class="price-old">${money(p.oldPrice)}</span>`
    : "";
  return `
    <article class="card" data-cat="${p.cat}">
      <div class="card-media">
        ${badge}
        <button class="card-fav" aria-label="Favoritar ${p.name}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20.5s-7.5-4.6-9.8-9A5.4 5.4 0 0 1 12 6.2a5.4 5.4 0 0 1 9.8 5.3c-2.3 4.4-9.8 9-9.8 9Z"/></svg>
        </button>
        <img src="${p.img}" alt="Patch ${p.name}" loading="lazy">
      </div>
      <div class="card-body">
        <div class="card-cat">${p.cat}</div>
        <div class="card-title">${p.name}</div>
        <div class="card-foot">
          <div class="price">
            <span class="price-now">${money(p.price)}</span>
            ${oldPrice}
          </div>
          <button class="add-btn" aria-label="Adicionar ${p.name}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 5v14M5 12h14"/></svg>
          </button>
        </div>
      </div>
    </article>
  `;
}

function renderGrid(filter){
  const grid = document.getElementById("productGrid");
  if (!grid) return;
  const items = filter && filter !== "Todos"
    ? PRODUCTS.filter(p => p.cat === filter)
    : PRODUCTS;
  grid.innerHTML = items.map(cardTemplate).join("");
}

// ---- category chips ----
function setupChips(){
  const chips = document.querySelectorAll(".chip");
  chips.forEach(chip => {
    chip.addEventListener("click", () => {
      chips.forEach(c => c.classList.remove("active"));
      chip.classList.add("active");
      renderGrid(chip.textContent.trim());
    });
  });
}

// ---- mobile sidebar ----
function setupMobileNav(){
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("overlay");
  const toggle = document.getElementById("menuToggle");
  if (!sidebar || !overlay || !toggle) return;

  function open(){
    sidebar.classList.add("open");
    overlay.classList.add("open");
  }
  function close(){
    sidebar.classList.remove("open");
    overlay.classList.remove("open");
  }
  toggle.addEventListener("click", open);
  overlay.addEventListener("click", close);
  sidebar.querySelectorAll(".nav-link").forEach(link => {
    link.addEventListener("click", close);
  });
}

// ---- active nav link on scroll ----
function setupScrollSpy(){
  const sections = ["inicio","catalogo","como-funciona","compatibilidade","comunidade"]
    .map(id => document.getElementById(id))
    .filter(Boolean);
  const links = document.querySelectorAll(".nav-link");

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting){
        const id = entry.target.id;
        links.forEach(link => {
          link.classList.toggle("active", link.getAttribute("href") === `#${id}`);
        });
      }
    });
  }, { rootMargin: "-40% 0px -50% 0px" });

  sections.forEach(s => observer.observe(s));
}

document.addEventListener("DOMContentLoaded", () => {
  renderGrid("Todos");
  setupChips();
  setupMobileNav();
  setupScrollSpy();
});
