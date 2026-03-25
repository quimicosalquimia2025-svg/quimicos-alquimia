// ===============================
// HOME - Ofertas del día
// ===============================

document.addEventListener("DOMContentLoaded", () => {
  loadFeaturedProducts();
  if (window.QACart) window.QACart.updateCartCount();
});

async function loadFeaturedProducts() {
  const grid = document.getElementById("featuredGrid");
  if (!grid) return;

  try {
    const res = await fetch("./data/products.json");
    if (!res.ok) throw new Error("No se pudo cargar products.json");

    const data = await res.json();
    const products = data.products || [];

    const featured = products
      .filter((p) => p.featured === true && p.active === true)
      .sort((a, b) => (a.featuredOrder ?? 9999) - (b.featuredOrder ?? 9999))
      .slice(0, 6);

    if (featured.length === 0) {
      grid.innerHTML = "<p>No hay ofertas destacadas por ahora.</p>";
      return;
    }

    grid.innerHTML = featured
      .map(
        (p) => `
          <article class="featured__item">
            <h3 class="featured__title">${p.name}</h3>
            <p class="featured__meta">
              <span>${formatPrice(p.price || 0)}</span>
              <span>${p.unit || ""}</span>
            </p>
            <button class="btn btn--primary featured__btn" data-id="${p.id}">
              Agregar al carrito
            </button>
          </article>
        `
      )
      .join("");
  } catch (err) {
    console.error(err);
    grid.innerHTML = "<p>No hay ofertas disponibles en este momento.</p>";
  }
}

function formatPrice(value) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);
}

// ===== Opción C: clicks en ofertas (Home) =====
document.addEventListener("click", (e) => {
  const btn = e.target.closest(".featured__btn");
  if (!btn) return;

  const id = btn.getAttribute("data-id");
  if (!id) return;

  fetch("./data/products.json")
    .then((r) => r.json())
    .then((data) => {
      const products = data.products || [];
      const product = products.find((p) => p.id === id);
      if (!product) return;

      if (window.QACart) {
        window.QACart.addToCart(product, 1);
        window.QACart.updateCartCount?.();
        btn.textContent = "Agregado ✓";
        setTimeout(() => (btn.textContent = "Agregar al carrito"), 900);
      }
    })
    .catch(console.error);
});