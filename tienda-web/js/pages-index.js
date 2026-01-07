// ===============================
// HOME - Ofertas del día
// ===============================

document.addEventListener("DOMContentLoaded", () => {
  loadFeaturedProducts();
});

async function loadFeaturedProducts() {
  const grid = document.getElementById("featuredGrid");
  if (!grid) return;

  try {
    const res = await fetch("./data/products.json");
    if (!res.ok) throw new Error("No se pudo cargar products.json");

    const data = await res.json();
    const products = data.products || [];

    const featured = products.filter(
      (p) => p.featured === true && p.active === true
    );

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
            <span>${formatPrice(p.price)}</span>
            <span>${p.unit}</span>
          </p>
          <button class="btn btn--primary featured__btn"data-id="${p.id}">
            Agregar al carrito
          </button>
        </article>
      `
      )
      .join("");
  } catch (err) {
    console.error(err);
    grid.innerHTML =
      "<p>Error cargando productos. Revisa products.json.</p>";
  }
}

function formatPrice(value) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);
}
document.addEventListener("DOMContentLoaded", () => {
  if (window.QACart) window.QACart.updateCartCount();
});
// ===== Opción C: clicks en ofertas (Home) =====
document.addEventListener("click", (e) => {
  const btn = e.target.closest(".featured__btn");
  if (!btn) return;

  const id = btn.getAttribute("data-id");
  if (!id) return;

  // Para no depender de variables internas, leemos del JSON y buscamos el producto
  fetch("./data/products.json")
    .then((r) => r.json())
    .then((data) => {
      const products = data.products || [];
      const product = products.find((p) => p.id === id);
      if (!product) return;

      if (window.QACart) {
        window.QACart.addToCart(product, 1);
        btn.textContent = "Agregado ✓";
        setTimeout(() => (btn.textContent = "Agregar al carrito"), 900);
      }
    })
    .catch(console.error);
});
