// ===============================
// Productos - Catálogo + filtros
// ===============================

let ALL_PRODUCTS = [];
let ORIGINAL_ORDER = [];

document.addEventListener("DOMContentLoaded", () => {
  initFromUrl();
  wireEvents();
  loadProducts();
});

function wireEvents() {
  const searchForm = document.getElementById("searchForm");
  const q = document.getElementById("q");
  const filterCategory = document.getElementById("filterCategory");
  const sortBy = document.getElementById("sortBy");
  const onlyStock = document.getElementById("onlyStock");
  const btnClear = document.getElementById("btnClear");

  if (searchForm) {
    searchForm.addEventListener("submit", (e) => {
      e.preventDefault();
      render();
    });
  }

  [q, filterCategory, sortBy, onlyStock].forEach((el) => {
    if (!el) return;
    el.addEventListener("input", render);
    el.addEventListener("change", render);
  });

  if (btnClear) {
    btnClear.addEventListener("click", () => {
      if (q) q.value = "";
      if (filterCategory) filterCategory.value = "all";
      if (sortBy) sortBy.value = "relevance";
      if (onlyStock) onlyStock.checked = false;

      // limpia query params
      const url = new URL(window.location.href);
      url.searchParams.delete("cat");
      window.history.replaceState({}, "", url.toString());

      render();
    });
  }
}

function initFromUrl() {
  const url = new URL(window.location.href);
  const cat = url.searchParams.get("cat");
  const filterCategory = document.getElementById("filterCategory");
  if (cat && filterCategory) {
    filterCategory.value = cat;
  }
}

async function loadProducts() {
  const grid = document.getElementById("productsGrid");
  const countEl = document.getElementById("resultsCount");

  try {
    const res = await fetch("./data/products.json");
    if (!res.ok) throw new Error("No se pudo cargar products.json");

    const data = await res.json();
    const products = Array.isArray(data.products) ? data.products : [];

    // solo activos
    ALL_PRODUCTS = products.filter((p) => p.active === true);
    ORIGINAL_ORDER = [...ALL_PRODUCTS];

    render();
  } catch (err) {
    console.error(err);
    if (grid) grid.innerHTML = `<div class="skeleton">Error cargando productos. Revisa data/products.json</div>`;
    if (countEl) countEl.textContent = "Error cargando productos.";
  }
}

function render() {
  const q = document.getElementById("q");
  const filterCategory = document.getElementById("filterCategory");
  const sortBy = document.getElementById("sortBy");
  const onlyStock = document.getElementById("onlyStock");

  const query = (q?.value || "").trim().toLowerCase();
  const cat = filterCategory?.value || "all";
  const sort = sortBy?.value || "relevance";
  const stockOnly = !!onlyStock?.checked;

  let list = [...ALL_PRODUCTS];

  // filtro por categoría
  if (cat !== "all") {
    list = list.filter((p) => (p.category || "").toLowerCase() === cat);
  }

  // solo disponibles
  if (stockOnly) {
    list = list.filter((p) => Number(p.stock || 0) > 0);
  }

  // búsqueda
  if (query) {
    list = list.filter((p) => {
      const name = (p.name || "").toLowerCase();
      const desc = (p.shortDescription || "").toLowerCase();
      const tags = Array.isArray(p.tags) ? p.tags.join(" ").toLowerCase() : "";
      return name.includes(query) || desc.includes(query) || tags.includes(query);
    });
  }

  // orden
  if (sort === "priceAsc") list.sort((a, b) => (a.price || 0) - (b.price || 0));
  if (sort === "priceDesc") list.sort((a, b) => (b.price || 0) - (a.price || 0));
  if (sort === "nameAsc") list.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
  if (sort === "relevance") {
    // “relevancia”: mantiene el orden original del JSON
    const order = new Map(ORIGINAL_ORDER.map((p, idx) => [p.id, idx]));
    list.sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0));
  }

  paint(list);
}
function getQtyInCart(productId) {
  const cart = window.QACart?.getCart?.();
  if (!cart || !cart.items) return 0;
  const item = cart.items.find((it) => it.id === productId);
  return item ? Number(item.qty || 0) : 0;
}
function getQtyInCart(productId) {
  const cart = window.QACart?.getCart?.();
  if (!cart || !cart.items) return 0;
  const item = cart.items.find((it) => it.id === productId);
  return item ? Number(item.qty || 0) : 0;
}

function paint(list) {
  const grid = document.getElementById("productsGrid");
  const countEl = document.getElementById("resultsCount");
  if (!grid) return;

  if (countEl) countEl.textContent = `${list.length} producto(s)`;

  if (list.length === 0) {
    grid.innerHTML = `<div class="skeleton">No hay productos que coincidan con los filtros.</div>`;
    return;
  }

  grid.innerHTML = list
    .map((p) => {
      const inCart = getQtyInCart(p.id);
      const available = Math.max(0, Number(p.stock || 0) - inCart);
      const out = available <= 0;

      return `
        <article class="product-card">
          <img class="product-card__img" src="${p.image || "./assets/producto-placeholder.jpg"}" alt="${escapeHtml(p.name)}" />
          <h3 class="product-card__title">${escapeHtml(p.name)}</h3>
          <p class="product-card__desc">${escapeHtml(p.shortDescription || "")}</p>

          <div class="product-card__meta">
            <span class="product-card__price">${formatPrice(p.price || 0)}</span>
            <span>${escapeHtml(p.unit || "")}</span>
          </div>

          <div class="product-card__badge ${out ? "product-card__badge--out" : ""}">
            ${out ? "Sin stock" : `Disponible: ${available} (en carrito: ${inCart})`}
          </div>

          <div class="product-card__actions">
            <button class="btn btn--primary product-card__btn" data-id="${p.id}" ${out ? "disabled" : ""}>
              Agregar al carrito
            </button>
          </div>
        </article>
      `;
    })
    .join("");
}

function formatPrice(value) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
document.addEventListener("DOMContentLoaded", () => {
  if (window.QACart) window.QACart.updateCartCount();
});
// ===== Opción C: clicks en catálogo (Productos) =====
document.addEventListener("click", (e) => {
  const btn = e.target.closest(".product-card__btn");
  if (!btn) return;

  const id = btn.getAttribute("data-id");
  if (!id || btn.disabled) return;

  // Aquí sí usamos ALL_PRODUCTS si existe; si no, leemos JSON
  const useAll = typeof ALL_PRODUCTS !== "undefined" && Array.isArray(ALL_PRODUCTS);

  const add = (product) => {
    if (product && window.QACart) {
      window.QACart.addToCart(product, 1);
      window.QACart.updateCartCount();
      btn.textContent = "Agregado ✓";
      setTimeout(() => (btn.textContent = "Agregar al carrito"), 900);
    }
  };

  if (useAll) {
    add(ALL_PRODUCTS.find((p) => p.id === id));
  } else {
    fetch("./data/products.json")
      .then((r) => r.json())
      .then((data) => add((data.products || []).find((p) => p.id === id)))
      .catch(console.error);
  }
});
