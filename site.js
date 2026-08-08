const CART_KEY = '9thstreet_cart';
let activeProduct = null;

function formatCurrency(value) {
  return `K ${Number(value).toLocaleString()}`;
}

function getCart() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function getCartCount() {
  return getCart().reduce((total, item) => total + item.qty, 0);
}

function updateCartBadge() {
  const badge = document.getElementById('cartCount');
  if (badge) {
    badge.textContent = getCartCount();
  }
}

function openCart() {
  const drawer = document.getElementById('cartDrawer');
  const overlay = document.getElementById('cartOverlay');
  if (drawer) drawer.classList.add('open');
  if (overlay) overlay.classList.add('open');
}

function closeCart() {
  const drawer = document.getElementById('cartDrawer');
  const overlay = document.getElementById('cartOverlay');
  if (drawer) drawer.classList.remove('open');
  if (overlay) overlay.classList.remove('open');
}

function renderCart() {
  const container = document.getElementById('cartItems');
  const subtotal = document.getElementById('cartSubtotal');
  if (!container) return;

  const cart = getCart();
  if (!cart.length) {
    container.innerHTML = '<div class="empty-cart">Your cart is empty.</div>';
    if (subtotal) subtotal.textContent = formatCurrency(0);
    updateCartBadge();
    return;
  }

  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  if (subtotal) subtotal.textContent = formatCurrency(total);

  container.innerHTML = cart.map((item) => `
    <div class="cart-item">
      <img src="${item.image}" alt="${item.name}">
      <div class="cart-item-info">
        <div class="cart-item-title">${item.name}</div>
        <div class="cart-item-price">${formatCurrency(item.price)}</div>
        <div class="cart-item-actions">
          <button class="qty-btn" data-action="decrease" data-name="${item.name}">−</button>
          <span>${item.qty}</span>
          <button class="qty-btn" data-action="increase" data-name="${item.name}">+</button>
          <button class="remove-btn" data-action="remove" data-name="${item.name}">Remove</button>
        </div>
      </div>
    </div>
  `).join('');

  updateCartBadge();
}

function addToCart(product) {
  const cart = getCart();
  const existing = cart.find((item) => item.name === product.name);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({
      name: product.name,
      price: Number(product.price),
      image: product.image,
      qty: 1
    });
  }
  saveCart(cart);
  renderCart();
  openCart();
}

function changeQty(name, delta) {
  const cart = getCart();
  const updated = cart
    .map((item) => item.name === name ? { ...item, qty: item.qty + delta } : item)
    .filter((item) => item.qty > 0);
  saveCart(updated);
  renderCart();
}

function removeItem(name) {
  const updated = getCart().filter((item) => item.name !== name);
  saveCart(updated);
  renderCart();
}

function getCheckoutDetails() {
  const nameInput = document.getElementById('customerName');
  const phoneInput = document.getElementById('customerPhone');
  return {
    name: nameInput ? nameInput.value.trim() : '',
    phone: phoneInput ? phoneInput.value.trim() : ''
  };
}

function checkoutCart() {
  const cart = getCart();
  if (!cart.length) return;

  const details = getCheckoutDetails();
  const customerInfo = details.name || details.phone
    ? `Customer: ${details.name || 'Guest'}${details.phone ? ` | ${details.phone}` : ''}`
    : 'Customer details pending';
  const message = cart.map((item) => `${item.qty} x ${item.name}`).join(', ');
  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const url = `https://wa.me/260772848591?text=${encodeURIComponent(`Hello, I would like to place an order for: ${message}. Total: ${formatCurrency(total)}. ${customerInfo}`)}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}

function openProductModal(product) {
  const overlay = document.getElementById('productModalOverlay');
  const modal = document.getElementById('productModal');
  const image = document.getElementById('modalImage');
  const title = document.getElementById('modalTitle');
  const description = document.getElementById('modalDescription');
  const price = document.getElementById('modalPrice');
  const category = document.getElementById('modalCategory');

  if (!overlay || !modal || !image || !title || !description || !price || !category) return;

  activeProduct = product;
  image.src = product.image;
  image.alt = product.name;
  title.textContent = product.name;
  description.textContent = product.description || 'Premium curated piece selected for our latest collection.';
  price.textContent = formatCurrency(product.price);
  category.textContent = product.category || 'Featured';
  overlay.classList.add('open');
  modal.classList.add('open');
}

function closeProductModal() {
  const overlay = document.getElementById('productModalOverlay');
  const modal = document.getElementById('productModal');
  if (overlay) overlay.classList.remove('open');
  if (modal) modal.classList.remove('open');
}

function bindCartEvents() {
  const openButtons = document.querySelectorAll('.cart-toggle');
  openButtons.forEach((button) => button.addEventListener('click', openCart));

  const closeButton = document.getElementById('closeCartBtn');
  if (closeButton) closeButton.addEventListener('click', closeCart);

  const overlay = document.getElementById('cartOverlay');
  if (overlay) overlay.addEventListener('click', closeCart);

  const checkoutButton = document.getElementById('checkoutBtn');
  if (checkoutButton) checkoutButton.addEventListener('click', checkoutCart);

  const closeModalButton = document.getElementById('closeProductModal');
  if (closeModalButton) closeModalButton.addEventListener('click', closeProductModal);

  const modalOverlay = document.getElementById('productModalOverlay');
  if (modalOverlay) modalOverlay.addEventListener('click', closeProductModal);

  const modalAddToCart = document.getElementById('modalAddToCart');
  if (modalAddToCart) {
    modalAddToCart.addEventListener('click', () => {
      if (activeProduct) {
        addToCart(activeProduct);
        closeProductModal();
      }
    });
  }

  const modalOrderWhatsApp = document.getElementById('modalOrderWhatsApp');
  if (modalOrderWhatsApp) {
    modalOrderWhatsApp.addEventListener('click', () => {
      if (!activeProduct) return;
      const details = getCheckoutDetails();
      const customerInfo = details.name || details.phone
        ? `Customer: ${details.name || 'Guest'}${details.phone ? ` | ${details.phone}` : ''}`
        : 'Customer details pending';
      const url = `https://wa.me/260772848591?text=${encodeURIComponent(`Hello, I would like to order ${activeProduct.name}. Total: ${formatCurrency(activeProduct.price)}. ${customerInfo}`)}`;
      window.open(url, '_blank', 'noopener,noreferrer');
      closeProductModal();
    });
  }

  document.addEventListener('click', (event) => {
    const button = event.target.closest('.qty-btn');
    if (button) {
      const action = button.getAttribute('data-action');
      const name = button.getAttribute('data-name');
      if (action === 'increase') changeQty(name, 1);
      if (action === 'decrease') changeQty(name, -1);
    }

    const removeButton = event.target.closest('.remove-btn');
    if (removeButton) {
      removeItem(removeButton.getAttribute('data-name'));
    }
  });

  document.addEventListener('click', (event) => {
    const button = event.target.closest('.add-to-cart-btn');
    if (!button) return;
    const product = {
      name: button.getAttribute('data-name'),
      price: Number(button.getAttribute('data-price')),
      image: button.getAttribute('data-image')
    };
    addToCart(product);
  });

  document.addEventListener('click', (event) => {
    const button = event.target.closest('.details-btn');
    if (!button) return;
    const product = {
      name: button.getAttribute('data-name'),
      price: Number(button.getAttribute('data-price')),
      image: button.getAttribute('data-image'),
      description: button.getAttribute('data-description') || 'Premium curated piece selected for our latest collection.',
      category: button.getAttribute('data-category') || 'Featured'
    };
    openProductModal(product);
  });
}

window.addToCartFromProduct = function (product) {
  addToCart(product);
};

document.addEventListener('DOMContentLoaded', () => {
  bindCartEvents();
  renderCart();
});
