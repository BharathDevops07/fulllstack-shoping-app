const productsContainer = document.getElementById('products');
const cartCountEl = document.getElementById('cart-count');
const checkoutPanel = document.getElementById('checkout-panel');
const cartItemsEl = document.getElementById('cart-items');
const cartTotalEl = document.getElementById('cart-total');
const checkoutButton = document.getElementById('checkout-button');
const orderResultEl = document.getElementById('order-result');

let cart = [];

function formatCurrency(value) {
  return value.toFixed(2);
}

function updateCartDisplay() {
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  cartCountEl.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
  cartTotalEl.textContent = formatCurrency(total);

  if (cart.length === 0) {
    checkoutPanel.classList.add('hidden');
    cartItemsEl.innerHTML = '<p>Your cart is empty.</p>';
    return;
  }

  checkoutPanel.classList.remove('hidden');
  cartItemsEl.innerHTML = cart
    .map(
      (item) => `
      <div class="cart-item">
        <div>
          <strong>${item.name}</strong>
          <div>$${formatCurrency(item.price)} × ${item.quantity}</div>
        </div>
        <button class="btn btn-secondary" data-id="${item.id}">Remove</button>
      </div>
    `
    )
    .join('');

  cartItemsEl.querySelectorAll('button').forEach((button) => {
    button.addEventListener('click', () => {
      const id = button.dataset.id;
      cart = cart.filter((product) => product.id !== id);
      updateCartDisplay();
    });
  });
}

function renderProducts(products) {
  productsContainer.innerHTML = products
    .map(
      (product) => `
      <article class="card">
        <img src="${product.image}" alt="${product.name}" />
        <div class="card-content">
          <h3>${product.name}</h3>
          <p>${product.description}</p>
          <div><strong>$${formatCurrency(product.price)}</strong></div>
        </div>
        <div class="card-actions">
          <button class="btn" data-id="${product._id}" data-name="${product.name}" data-price="${product.price}">Add to cart</button>
          <span>${product.inventory} in stock</span>
        </div>
      </article>
    `
    )
    .join('');

  productsContainer.querySelectorAll('button').forEach((button) => {
    button.addEventListener('click', () => {
      const id = button.dataset.id;
      const name = button.dataset.name;
      const price = Number(button.dataset.price);
      const existing = cart.find((item) => item.id === id);
      if (existing) {
        existing.quantity += 1;
      } else {
        cart.push({ id, name, price, quantity: 1 });
      }
      updateCartDisplay();
    });
  });
}

async function loadProducts() {
  try {
    const response = await fetch('/api/products');
    const products = await response.json();
    renderProducts(products);
  } catch (error) {
    productsContainer.innerHTML = '<p>Unable to load products.</p>';
    console.error(error);
  }
}

checkoutButton.addEventListener('click', async () => {
  if (cart.length === 0) return;
  const order = {
    items: cart.map((item) => ({ id: item.id, name: item.name, quantity: item.quantity, price: item.price })),
    total: Number(cartTotalEl.textContent),
  };

  try {
    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order),
    });

    const result = await response.json();
    if (!response.ok) {
      orderResultEl.textContent = result.message || 'Could not place order.';
      orderResultEl.style.background = '#fee2e2';
      orderResultEl.style.color = '#991b1b';
      return;
    }

    orderResultEl.textContent = `Order accepted: ${result.order.id}`;
    orderResultEl.style.background = '#ecfdf5';
    orderResultEl.style.color = '#065f46';
    cart = [];
    updateCartDisplay();
  } catch (error) {
    orderResultEl.textContent = 'Network error placing order.';
    orderResultEl.style.background = '#fee2e2';
    orderResultEl.style.color = '#991b1b';
  }
});

loadProducts();
