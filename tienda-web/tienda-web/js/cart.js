// ===============================
// Carrito (localStorage) - QA
// ===============================

const CART_KEY = "qa_cart_v1";

function getCart() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : { items: [] };
  } catch {
    return { items: [] };
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function getCartCount() {
  const cart = getCart();
  return cart.items.reduce((acc, it) => acc + Number(it.qty || 0), 0);
}

function updateCartCount() {
  const count = String(getCartCount());

  // Soporta id="cartCount"
  const el = document.getElementById("cartCount");
  if (el) el.textContent = count;

  // Soporta data-cart-count (recomendado)
  document.querySelectorAll("[data-cart-count]").forEach((node) => {
    node.textContent = count;
  });
}

function addToCart(product, qty = 1) {
  const cart = getCart();
  const id = product.id;

  const found = cart.items.find((it) => it.id === id);
  if (found) {
    found.qty += qty;
  } else {
    cart.items.push({
      id: product.id,
      name: product.name,
      price: Number(product.price || 0),
      unit: product.unit || "",
      image: product.image || "./assets/producto-placeholder.jpeg",
      qty: qty,
    });
  }

  saveCart(cart);
  updateCartCount();
}

// Exponer a window (para usar desde otros JS)
window.QACart = {
  getCart,
  saveCart,
  addToCart,
  updateCartCount,
  getCartCount,
};
