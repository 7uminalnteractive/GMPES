const GMPES_STORE_KEY = "gmpes_products";
const GMPES_SALES_KEY = "gmpes_sales";

const GMPES_DEFAULT_PRODUCTS = [
  {
    id: "conmebol",
    name: "Patch Conmebol",
    cat: "Competições",
    price: 14.90,
    oldPrice: null,
    badge: "Disponível",
    img: "assets/patches/conmebol-capa.jpg",
    shortDesc: "Libertadores e Sul-Americana completas no seu PES 2014.",
    description: "Patch completo com a Conmebol Libertadores e a Conmebol Sul-Americana atualizadas para a temporada, incluindo escudos, taças e telas de competição adaptadas para o PES 2014 no PSP.",
    version: "1.0",
    updatedAt: "2026-08-01",
    trailerUrl: "",
    screenshots: []
  },
  {
    id: "europeu",
    name: "Patch Europeu",
    cat: "Competições",
    price: 14.90,
    oldPrice: null,
    badge: "Disponível",
    img: "assets/patches/europeu.svg",
    shortDesc: "Champions League e Europa League no seu PES 2014.",
    description: "Patch completo com as competições europeias atualizadas, incluindo fase de grupos, mata-mata e taças oficiais adaptadas para o PES 2014 no PSP.",
    version: "1.0",
    updatedAt: "2026-08-01",
    trailerUrl: "",
    screenshots: []
  },
];

const GMPES_DEFAULT_SALES = [
  { id: "s1", productId: "conmebol", productName: "Patch Conmebol", amount: 14.90, buyer: "cliente_87x", date: "2026-09-05T14:32:00" },
  { id: "s2", productId: "europeu",  productName: "Patch Europeu",  amount: 14.90, buyer: "joao_psp",   date: "2026-09-05T11:10:00" },
  { id: "s3", productId: "conmebol", productName: "Patch Conmebol", amount: 14.90, buyer: "retro_fan",  date: "2026-09-04T20:45:00" },
  { id: "s4", productId: "conmebol", productName: "Patch Conmebol", amount: 14.90, buyer: "lucas.c",    date: "2026-09-03T09:15:00" },
  { id: "s5", productId: "europeu",  productName: "Patch Europeu",  amount: 14.90, buyer: "mari_f",     date: "2026-09-02T18:02:00" },
];

const GmpesStore = {
  isStorageAvailable(){
    try {
      const testKey = "__gmpes_test__";
      localStorage.setItem(testKey, "1");
      localStorage.removeItem(testKey);
      return true;
    } catch (e) {
      return false;
    }
  },

  getProducts(){
    try {
      const raw = localStorage.getItem(GMPES_STORE_KEY);
      if (!raw) {
        this.saveProducts(GMPES_DEFAULT_PRODUCTS);
        return [...GMPES_DEFAULT_PRODUCTS];
      }
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) throw new Error("invalid shape");
      return parsed;
    } catch (e) {
      console.error("GmpesStore.getProducts failed, falling back to defaults", e);
      return [...GMPES_DEFAULT_PRODUCTS];
    }
  },

  getProduct(id){
    return this.getProducts().find(p => p.id === id) || null;
  },

  saveProducts(products){
    try {
      localStorage.setItem(GMPES_STORE_KEY, JSON.stringify(products));
      return true;
    } catch (e) {
      console.error("GmpesStore.saveProducts failed", e);
      return false;
    }
  },

  upsertProduct(product){
    const products = this.getProducts();
    const idx = products.findIndex(p => p.id === product.id);
    if (idx >= 0) {
      products[idx] = { ...products[idx], ...product };
    } else {
      products.push(product);
    }
    const ok = this.saveProducts(products);
    return ok ? products : false;
  },

  deleteProduct(id){
    const products = this.getProducts().filter(p => p.id !== id);
    this.saveProducts(products);
    return products;
  },

  slugify(name){
    return name
      .toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || `patch-${Date.now()}`;
  },

  getSales(){
    try {
      const raw = localStorage.getItem(GMPES_SALES_KEY);
      if (!raw) {
        this.saveSales(GMPES_DEFAULT_SALES);
        return [...GMPES_DEFAULT_SALES];
      }
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) throw new Error("invalid shape");
      return parsed;
    } catch (e) {
      console.error("GmpesStore.getSales failed, falling back to defaults", e);
      return [...GMPES_DEFAULT_SALES];
    }
  },

  saveSales(sales){
    try {
      localStorage.setItem(GMPES_SALES_KEY, JSON.stringify(sales));
      return true;
    } catch (e) {
      console.error("GmpesStore.saveSales failed", e);
      return false;
    }
  },

  getSalesSummary(){
    const sales = this.getSales();
    const total = sales.reduce((sum, s) => sum + s.amount, 0);
    const count = sales.length;
    const byProduct = {};
    sales.forEach(s => {
      byProduct[s.productId] = (byProduct[s.productId] || 0) + 1;
    });
    return { total, count, byProduct, sales };
  }
};
