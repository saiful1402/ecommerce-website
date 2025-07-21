// main.js - Shared JavaScript for TechMart

// 1. Navigation: Hamburger menu, active link highlighting, accessibility
// 2. Product Grids: Quick View modal, Add to Cart, filters, pagination
// 3. Cart: Remove item, update totals, empty state
// 4. Forms: Validation, show/hide password, notifications
// 5. Scroll to Top: Smooth scroll, accessibility
// 6. Accessibility: ARIA, keyboard navigation

// Example: Hamburger menu toggle
function setupHamburgerMenu() {
  const menu = document.getElementById('MenuItems');
  const hamburger = document.querySelector('.hamburger');
  if (menu && hamburger) {
    hamburger.addEventListener('click', () => {
      menu.classList.toggle('active');
      hamburger.classList.toggle('active');
      if (menu.classList.contains('active')) {
        menu.style.maxHeight = '300px';
      } else {
        menu.style.maxHeight = '0px';
      }
    });
    // Accessibility: close menu with Esc
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && menu.classList.contains('active')) {
        menu.classList.remove('active');
        hamburger.classList.remove('active');
        menu.style.maxHeight = '0px';
      }
    });
  }
}

// Example: Scroll to Top Button
function setupScrollToTop() {
  const btn = document.getElementById('scrollToTop');
  if (!btn) return;
  window.addEventListener('scroll', () => {
    if (window.pageYOffset > 300) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
  });
  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// Example: Set active nav link based on current page
function setActiveNavLink() {
  const navLinks = document.querySelectorAll('.nav-link');
  const path = window.location.pathname.split('/').pop();
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href && path === href) {
      navLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
    }
  });
}

// --- CART LOGIC ---
function getCartData() {
  // For demo: get cart from localStorage or use default
  const defaultCart = [
    {
      id: '1',
      name: 'OnePlus Nord CE 2 5G',
      category: 'Electronics',
      price: 400,
      image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=120&q=80',
      quantity: 1
    },
    {
      id: '2',
      name: 'Red Printed T-Shirt',
      category: 'Fashion',
      price: 50,
      image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=120&q=80',
      quantity: 2
    },
    {
      id: '3',
      name: 'Redmi Note 11 Pro + 5G',
      category: 'Electronics',
      price: 400,
      image: 'https://m.media-amazon.com/images/I/71lx0qz7rFL._UF1000,1000_QL80_.jpg',
      quantity: 1
    }
  ];
  try {
    return JSON.parse(localStorage.getItem('cart')) || defaultCart;
  } catch {
    return defaultCart;
  }
}

function setCartData(cart) {
  localStorage.setItem('cart', JSON.stringify(cart));
}

function updateCartCount() {
  const cart = getCartData();
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartCountEls = document.querySelectorAll('.cart-count');
  cartCountEls.forEach(el => el.textContent = count);
}

function renderCart() {
  const cart = getCartData();
  const tbody = document.querySelector('.cart-table tbody');
  const emptyMsg = document.querySelector('.empty-cart-message');
  if (!tbody) return;
  tbody.innerHTML = '';
  if (cart.length === 0) {
    document.querySelector('.cart-table-wrapper').style.display = 'none';
    document.querySelector('.cart-summary').style.display = 'none';
    if (emptyMsg) emptyMsg.style.display = '';
    updateCartCount();
    return;
  } else {
    document.querySelector('.cart-table-wrapper').style.display = '';
    document.querySelector('.cart-summary').style.display = '';
    if (emptyMsg) emptyMsg.style.display = 'none';
  }
  cart.forEach((item, idx) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="cart-product">
        <img src="${item.image}" alt="${item.name}">
        <div>
          <h4>${item.name}</h4>
          <span class="cart-product-meta">${item.category}</span>
        </div>
      </td>
      <td>₹${item.price.toLocaleString('en-IN')}</td>
      <td>
        <div class="cart-qty-group">
          <button class="qty-btn minus" aria-label="Decrease quantity" data-idx="${idx}">-</button>
          <input type="number" value="${item.quantity}" min="1" class="cart-qty-input" data-idx="${idx}">
          <button class="qty-btn plus" aria-label="Increase quantity" data-idx="${idx}">+</button>
        </div>
      </td>
      <td>₹${(item.price * item.quantity).toLocaleString('en-IN')}</td>
      <td><button class="remove-btn" aria-label="Remove ${item.name} from cart" data-idx="${idx}"><i class="fas fa-trash"></i></button></td>
    `;
    tbody.appendChild(tr);
  });
  updateCartSummary();
  updateCartCount();
}

function updateCartSummary() {
  const cart = getCartData();
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.0333; // Example: 3.33% tax
  const total = subtotal + tax;
  const summaryRows = document.querySelectorAll('.summary-row span:last-child');
  if (summaryRows.length >= 3) {
    summaryRows[0].textContent = `₹${subtotal.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
    summaryRows[1].textContent = `₹${tax.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
    summaryRows[2].textContent = `₹${total.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
  }
}

function showCartNotification(message, type = 'info') {
  const region = document.getElementById('cart-notification');
  if (region) {
    region.textContent = message;
    setTimeout(() => { region.textContent = ''; }, 3000);
  }
}

function setupCartEvents() {
  const cartTable = document.querySelector('.cart-table');
  if (!cartTable) return;
  cartTable.addEventListener('click', (e) => {
    if (e.target.closest('.remove-btn')) {
      const idx = +e.target.closest('.remove-btn').dataset.idx;
      const cart = getCartData();
      const item = cart[idx];
      if (confirm(`Remove ${item.name} from cart?`)) {
        cart.splice(idx, 1);
        setCartData(cart);
        renderCart();
        showCartNotification('Item removed from cart', 'info');
      }
    } else if (e.target.classList.contains('qty-btn')) {
      const idx = +e.target.dataset.idx;
      const cart = getCartData();
      if (e.target.classList.contains('minus')) {
        if (cart[idx].quantity > 1) {
          cart[idx].quantity--;
          setCartData(cart);
          renderCart();
        }
      } else if (e.target.classList.contains('plus')) {
        cart[idx].quantity++;
        setCartData(cart);
        renderCart();
      }
    }
  });
  cartTable.addEventListener('change', (e) => {
    if (e.target.classList.contains('cart-qty-input')) {
      const idx = +e.target.dataset.idx;
      let val = parseInt(e.target.value, 10);
      if (isNaN(val) || val < 1) val = 1;
      const cart = getCartData();
      cart[idx].quantity = val;
      setCartData(cart);
      renderCart();
    }
  });
}

function setupCartPage() {
  if (!document.querySelector('.cart-table')) return;
  renderCart();
  setupCartEvents();
}

// --- ADD TO CART FUNCTIONALITY ---
function getProductInfoFromCard(card) {
  const name = card.querySelector('.product-info h4')?.textContent?.trim() || '';
  const priceText = card.querySelector('.current-price')?.textContent?.replace(/[^\d]/g, '') || '0';
  const price = parseInt(priceText, 10) || 0;
  const image = card.querySelector('.product-image img')?.src || '';
  const category = card.dataset.category || '';
  return { name, price, image, category };
}

function addToCart(product) {
  let cart = getCartData();
  // Check if product already in cart (by name and price)
  const idx = cart.findIndex(item => item.name === product.name && item.price === product.price);
  if (idx !== -1) {
    cart[idx].quantity += 1;
  } else {
    cart.push({
      id: Date.now().toString(),
      name: product.name,
      price: product.price,
      image: product.image,
      category: product.category,
      quantity: 1
    });
  }
  setCartData(cart);
  updateCartCount();
}

function setupAddToCartButtons() {
  document.querySelectorAll('.add-to-cart').forEach(button => {
    button.addEventListener('click', function(e) {
      e.preventDefault();
      const card = this.closest('.product-card');
      if (!card) return;
      const product = getProductInfoFromCard(card);
      addToCart(product);
      // Animate cart icon
      const cartIcon = document.querySelector('.cart-icon');
      if (cartIcon) {
        cartIcon.style.transform = 'scale(1.2)';
        setTimeout(() => { cartIcon.style.transform = 'scale(1)'; }, 200);
      }
      showCartNotification('Product added to cart!', 'success');
    });
  });
}

// Initialize all features
window.addEventListener('DOMContentLoaded', () => {
  setupHamburgerMenu();
  setupScrollToTop();
  setActiveNavLink();
  setupCartPage();
  setupAddToCartButtons();
  // TODO: Add more feature initializations here
}); 