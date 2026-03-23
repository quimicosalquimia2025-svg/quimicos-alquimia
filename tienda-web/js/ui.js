// js/ui.js
// Helpers de UI (render de productos y utilidades)
// Compatible con imagenes locales (/assets/...) o URLs completas (Cloudinary)

export function moneyCOP(value) {
  const n = Number(value || 0);
  return n.toLocaleString("es-CO");
}

export function getImageSrc(p) {
  // Si viene una URL completa (Cloudinary) se usa tal cual
  // Si viene vacío -> placeholder local
  const fallback = "/assets/producto-placeholder.jpeg";

  if (!p || !p.image) return fallback;

  const img = String(p.image).trim();

  if (!img) return fallback;
  if (img.startsWith("http://") || img.startsWith("https://")) return img;

  // Si es ruta relativa, la normalizamos con /assets/
  if (img.startsWith("/")) return img;

  return `/assets/${img}`;
}

export function productCardHTML(p) {
  const imgSrc = getImageSrc(p);

  return `
    <article class="product-card" data-id="${p.id}">
      <div class="product-card__media">
        <img
          class="product-card__img"
          src="${imgSrc}"
          alt="${(p.name || "Producto").replaceAll('"', "&quot;")}"
          loading="lazy"
        />
      </div>

      <div class="product-card__body">
        <h3 class="product-card__title">${p.name || "Producto"}</h3>

        <div class="product-card__meta">
          <span class="product-card__price">$ ${moneyCOP(p.price)}</span>
          <span class="product-card__unit">${p.unit ? p.unit : ""}</span>
        </div>

        <div class="product-card__actions">
          <button class="btn btn--primary" data-add-to-cart data-id="${p.id}">
            Agregar al carrito
          </button>
        </div>
      </div>
    </article>
  `;
}

export function paintProductsGrid({ gridId, products = [] }) {
  const grid = document.getElementById(gridId);
  if (!grid) return;

  if (!Array.isArray(products) || products.length === 0) {
    grid.innerHTML = `<div class="skeleton">No hay productos para mostrar.</div>`;
    return;
  }

  grid.innerHTML = products.map(productCardHTML).join("");
}
