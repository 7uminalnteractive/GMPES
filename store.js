const GMPES_STORE_KEY = "gmpes_products";

const GMPES_DEFAULT_PRODUCTS = [
  { id: "conmebol", name: "Patch Conmebol", cat: "Competições", price: 14.90, oldPrice: null, badge: "Disponível", img: "assets/patches/conmebol.svg" },
  { id: "europeu",  name: "Patch Europeu",  cat: "Competições", price: 14.90, oldPrice: null, badge: "Disponível", img: "assets/patches/europeu.svg" },
];

const GmpesStore = {
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
      products[idx] = product;
    } else {
      products.push(product);
    }
    this.saveProducts(products);
    return products;
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
  }
};
