// ===============================
// Carrito - Render + WhatsApp
// ===============================

document.addEventListener("DOMContentLoaded", () => {
  if (window.QACart) window.QACart.updateCartCount();

  wireCartEvents();
  renderCart();
});

function wireCartEvents() {
  const btnClear = document.getElementById("btnClearCart");
  if (btnClear) {
    btnClear.addEventListener("click", () => {
      const cart = window.QACart?.getCart();
      if (!cart) return;

      cart.items = [];
      window.QACart.saveCart(cart);
      window.QACart.updateCartCount();
      renderCart();
    });
  }
}

function renderCart() {
  const cart = window.QACart?.getCart() || { items: [] };

  const listEl = document.getElementById("cartList");
  const hintEl = document.getElementById("cartHint");
  const emptyEl = document.getElementById("cartEmpty");

  const subtotalEl = document.getElementById("subtotal");
  const shippingEl = document.getElementById("shipping");
  const totalEl = document.getElementById("total");

  if (!listEl) return;

  // Empty state
  if (!cart.items.length) {
    listEl.innerHTML = "";
    if (hintEl) hintEl.textContent = "No hay productos en el carrito.";
    if (emptyEl) emptyEl.hidden = false;

    const zero = formatCOP(0);
    if (subtotalEl) subtotalEl.textContent = zero;
    if (shippingEl) shippingEl.textContent = zero;
    if (totalEl) totalEl.textContent = zero;

    setWhatsAppLink([]);
    return;
  }

  if (emptyEl) emptyEl.hidden = true;
  if (hintEl) hintEl.textContent = `${cart.items.length} producto(s) en el carrito`;

  // Render items
  listEl.innerHTML = cart.items
    .map((it) => {
      const lineTotal = Number(it.price || 0) * Number(it.qty || 0);
      return `
        <article class="cart-item" data-id="${it.id}">
          <img class="cart-item__img" src="${it.image || "./assets/producto-placeholder.jpg"}" alt="${escapeHtml(it.name)}" />
          <div class="cart-item__info">
            <h3 class="cart-item__title">${escapeHtml(it.name)}</h3>
            <p class="cart-item__meta">
              <span class="cart-item__price">${formatCOP(it.price || 0)}</span>
              <span class="cart-item__unit">${escapeHtml(it.unit || "")}</span>
            </p>

            <div class="cart-item__controls">
              <div class="qty">
                <button class="qty__btn" data-action="minus" type="button" aria-label="Restar">−</button>
                <input class="qty__input" type="number" min="1" value="${Number(it.qty || 1)}" />
                <button class="qty__btn" data-action="plus" type="button" aria-label="Sumar">+</button>
              </div>

              <button class="btn btn--outline cart-item__remove" data-action="remove" type="button">
                Eliminar
              </button>

              <span class="cart-item__total">${formatCOP(lineTotal)}</span>
            </div>
          </div>
        </article>
      `;
    })
    .join("");

  // Totals
  const subtotal = cart.items.reduce((acc, it) => acc + Number(it.price || 0) * Number(it.qty || 0), 0);

  const shipping = 0; // si luego quieres envío, aquí se calcula
  const total = subtotal + shipping;

  if (subtotalEl) subtotalEl.textContent = formatCOP(subtotal);
  if (shippingEl) shippingEl.textContent = formatCOP(shipping);
  if (totalEl) totalEl.textContent = formatCOP(total);

  // Events per item
  listEl.querySelectorAll(".cart-item").forEach((row) => {
    const id = row.getAttribute("data-id");
    const input = row.querySelector(".qty__input");

    row.querySelectorAll(".qty__btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const action = btn.getAttribute("data-action");
        let qty = Number(input?.value || 1);

        if (action === "plus") qty += 1;
        if (action === "minus") qty = Math.max(1, qty - 1);

        updateQty(id, qty);
      });
    });

    if (input) {
      input.addEventListener("change", () => {
        const qty = Math.max(1, Number(input.value || 1));
        updateQty(id, qty);
      });
    }

    const removeBtn = row.querySelector('[data-action="remove"]');
    if (removeBtn) {
      removeBtn.addEventListener("click", () => {
        removeItem(id);
      });
    }
  });

  setWhatsAppLink(cart.items);
}

function updateQty(id, qty) {
  const cart = window.QACart?.getCart();
  if (!cart) return;

  const item = cart.items.find((it) => it.id === id);
  if (!item) return;

  item.qty = qty;
  window.QACart.saveCart(cart);
  window.QACart.updateCartCount();
  renderCart();
}

function removeItem(id) {
  const cart = window.QACart?.getCart();
  if (!cart) return;

  cart.items = cart.items.filter((it) => it.id !== id);
  window.QACart.saveCart(cart);
  window.QACart.updateCartCount();
  renderCart();
}

async function setWhatsAppLink(items) {
  const btn = document.getElementById("btnWhatsApp");
  if (!btn) return;

  // Intentar tomar whatsapp desde products.json (si existe)
  let phone = "573000000000"; // fallback (cámbialo cuando quieras)
  try {
    const res = await fetch("./data/products.json");
    if (res.ok) {
      const data = await res.json();
      const fromJson = data?.store?.whatsapp || "";
      if (fromJson) phone = fromJson.replace(/\D/g, ""); // solo números
    }
  } catch {}

  if (!items.length) {
    btn.href = "#";
    btn.setAttribute("aria-disabled", "true");
    btn.style.opacity = "0.6";
    btn.style.pointerEvents = "none";
    return;
  }

  btn.removeAttribute("aria-disabled");
  btn.style.opacity = "1";
  btn.style.pointerEvents = "auto";

  const subtotal = items.reduce((acc, it) => acc + Number(it.price || 0) * Number(it.qty || 0), 0);

  const lines = items.map((it) => {
    const lineTotal = Number(it.price || 0) * Number(it.qty || 0);
    return `- ${it.name} x${it.qty} = ${formatCOP(lineTotal)}`;
  });

  const msg =
    `Hola, Químicos Alquimia 👋\n\n` +
    `Quiero realizar este pedido:\n` +
    `${lines.join("\n")}\n\n` +
    `Subtotal: ${formatCOP(subtotal)}\n` +
    `Gracias.`;

  btn.href = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
}

function formatCOP(value) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
