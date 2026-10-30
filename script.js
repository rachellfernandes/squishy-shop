/* =========================================================
   Squishy Daze - script.js
   Everything runs in the browser. No backend needed.
   Want to add a product? Add a new object to the PRODUCTS list
   below and drop its pictures in the "images" folder.
   ========================================================= */

/* ---------- 1. PRODUCT DATA ---------- */
// images[0] is the main photo. images[1] (optional) shows on hover.
const PRODUCTS = [
  {
    id: "bear-bun",
    name: "Bear Bun",
    category: "bread",
    price: 65,
    description: "A golden-brown bear bun with a chocolate scarf and tiny paw pads. Super soft and slow to rise.",
    images: ["images/bear-bun-1.jpg"]
  },
  {
    id: "cat-bun",
    name: "Cat Bun",
    category: "bread",
    price: 65,
    description: "A fluffy toasted cat bun with little whiskers and a pink nose. Made for squeezing.",
    images: ["images/cat-bun-1.jpg"]
  },
  {
    id: "shiba-bun",
    name: "Shiba Bun",
    category: "bread",
    price: 65,
    description: "A shiba-shaped bun with a golden crust and a happy face. It smells like bakery dreams.",
    images: ["images/shiba-bun-1.jpg"]
  },
  {
    id: "puppy-baguette",
    name: "Puppy Baguette",
    category: "bread",
    price: 100,
    description: "A sleepy puppy tucked inside a crusty baguette. Big, chunky and extra slow to rise.",
    images: ["images/puppy-baguette-1.jpg", "images/puppy-baguette-2.jpg"]
  },
  {
    id: "duo-fried-dough-stick",
    name: "Duo Fried Dough Stick",
    category: "bread",
    price: 100,
    description: "Two golden dough sticks stuck together with sleepy little faces. Twice the squish!",
    images: ["images/duo-fried-dough-stick-1.jpg", "images/duo-fried-dough-stick-2.jpg"]
  },
  {
    id: "pink-toast",
    name: "Pink Toast",
    category: "toast",
    price: 75,
    description: "A pillowy pink toast with a soft strawberry blush. Sweet to look at, softer to hold.",
    images: ["images/pink-toast-1.jpg", "images/pink-toast-2.jpg"]
  },
  {
    id: "yellow-toast",
    name: "Yellow Toast",
    category: "toast",
    price: 75,
    description: "A sunny yellow toast with a lightly toasted top. Your cheeriest desk buddy.",
    images: ["images/yellow-toast-1.jpg", "images/yellow-toast-2.jpg"]
  },
  {
    id: "bow-toast",
    name: "Bow Toast",
    category: "toast",
    price: 65,
    description: "A cute toast slice with a sleepy face peeking out and a tiny red bow on top.",
    images: ["images/bow-toast-1.jpg"]
  },
  {
    id: "apple-calabash",
    name: "Apple-Shaped Calabash",
    category: "fruit",
    price: 65,
    description: "A pastel-yellow apple with a little green leaf and the sweetest closed-eye smile.",
    images: ["images/apple-calabash-1.jpg", "images/apple-calabash-2.jpg"]
  },
  {
    id: "strawberry-ichigo",
    name: "Strawberry (Ichigo)",
    category: "fruit",
    price: 100,
    description: "A peachy-pink ichigo with a leafy green top and a shy little face.",
    images: ["images/strawberry-ichigo-1.jpg", "images/strawberry-ichigo-2.jpg"]
  },
  {
    id: "pink-rice-ball",
    name: "Pink Rice Ball",
    category: "rice",
    price: 90,
    description: "A pink onigiri with a seaweed wrap and a tiny flower. Round, soft and so cute.",
    images: ["images/pink-rice-ball-1.jpg", "images/pink-rice-ball-2.jpg"]
  },
  {
    id: "tofu-seal",
    name: "Tofu Seal",
    category: "rice",
    price: 50,
    description: "A squishy white tofu cube with a tiny seal face. Our most affordable cutie.",
    images: ["images/tofu-seal-1.jpg", "images/tofu-seal-2.jpg"]
  },
  {
    id: "bread-set-4pcs",
    name: "Bread Squishy Set (4 pcs)",
    category: "set",
    price: 200,
    description: "A set of four mini bread friends: shiba bun, toast, bear bun and cat bun. Great for gifting.",
    images: ["images/bread-set-4pcs-1.jpg"]
  }
];

const CATEGORIES = [
  { id: "all",   label: "All" },
  { id: "bread", label: "Bread & Buns" },
  { id: "toast", label: "Toast" },
  { id: "fruit", label: "Fruits" },
  { id: "rice",  label: "Rice & Tofu" },
  { id: "set",   label: "Sets" }
];

const PLACEHOLDER = "images/placeholder.svg";
const CART_KEY = "squishyDazeCart";

/* ---------- 2. SMALL HELPERS ---------- */
const $ = (selector) => document.querySelector(selector);

// 65 -> "₱65", 1250 -> "₱1,250"
const peso = (amount) => "₱" + amount.toLocaleString("en-PH");

const categoryLabel = (id) => (CATEGORIES.find((c) => c.id === id) || {}).label || "";
const findProduct = (id) => PRODUCTS.find((p) => p.id === id);

// If a picture is missing, show the placeholder instead.
function useFallback(img) {
  img.addEventListener("error", () => {
    img.onerror = null;
    img.src = PLACEHOLDER;
  }, { once: true });
}

/* ---------- 3. STATE ---------- */
let cart = loadCart();           // { productId: quantity }
let activeCategory = "all";
let searchText = "";
let sortBy = "featured";
let modalProductId = null;
let lastFocused = null;
let toastTimer = null;

function loadCart() {
  try {
    const saved = JSON.parse(localStorage.getItem(CART_KEY)) || {};
    const clean = {};
    Object.keys(saved).forEach((id) => {
      const qty = parseInt(saved[id], 10);
      if (findProduct(id) && qty > 0) clean[id] = Math.min(qty, 99);
    });
    return clean;
  } catch (e) {
    return {};
  }
}

function saveCart() {
  try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch (e) { /* storage may be blocked */ }
}

/* ---------- 4. PRODUCT CATALOG ---------- */
function renderFilters() {
  $("#filters").innerHTML = CATEGORIES.map((c) => `
    <button type="button" class="chip${c.id === activeCategory ? " active" : ""}"
            data-category="${c.id}" aria-pressed="${c.id === activeCategory}">${c.label}</button>
  `).join("");
}

function getVisibleProducts() {
  const term = searchText.trim().toLowerCase();

  let list = PRODUCTS.filter((p) => {
    const matchesCategory = activeCategory === "all" || p.category === activeCategory;
    const haystack = (p.name + " " + p.description + " " + categoryLabel(p.category)).toLowerCase();
    return matchesCategory && (term === "" || haystack.includes(term));
  });

  if (sortBy === "price-asc")  list = list.slice().sort((a, b) => a.price - b.price);
  if (sortBy === "price-desc") list = list.slice().sort((a, b) => b.price - a.price);
  if (sortBy === "name")       list = list.slice().sort((a, b) => a.name.localeCompare(b.name));

  return list;
}

function renderProducts() {
  const list = getVisibleProducts();
  const grid = $("#product-grid");

  grid.innerHTML = list.map((p) => {
    const hasAlt = p.images.length > 1;
    return `
      <article class="card">
        <button type="button" class="card-media${hasAlt ? " has-alt" : ""}" data-action="view" data-id="${p.id}"
                aria-label="See details for ${p.name}">
          <img class="img-a" src="${p.images[0]}" alt="${p.name} squishy toy" width="800" height="800" loading="lazy">
          ${hasAlt ? `<img class="img-b" src="${p.images[1]}" alt="" aria-hidden="true" width="800" height="800" loading="lazy">` : ""}
          <span class="tag">${categoryLabel(p.category)}</span>
        </button>
        <div class="card-body">
          <h3>${p.name}</h3>
          <p>${p.description}</p>
          <div class="card-foot">
            <span class="price">${peso(p.price)}</span>
            <button type="button" class="btn btn-primary btn-small" data-action="add" data-id="${p.id}">Add to cart</button>
          </div>
        </div>
      </article>`;
  }).join("");

  grid.querySelectorAll("img").forEach(useFallback);

  $("#empty-state").hidden = list.length > 0;
  grid.hidden = list.length === 0;
  $("#result-count").textContent =
    list.length === 1 ? "Showing 1 squishy" : "Showing " + list.length + " squishies";
}

/* ---------- 5. CART ---------- */
function cartCount() {
  return Object.values(cart).reduce((sum, qty) => sum + qty, 0);
}

function cartTotal() {
  return Object.keys(cart).reduce((sum, id) => sum + findProduct(id).price * cart[id], 0);
}

function addToCart(id, amount = 1) {
  cart[id] = Math.min((cart[id] || 0) + amount, 99);
  saveCart();
  renderCart();
  bumpCounter();
}

function changeQty(id, change) {
  if (!cart[id]) return;
  cart[id] += change;
  if (cart[id] <= 0) delete cart[id];
  if (cart[id] > 99) cart[id] = 99;
  saveCart();
  renderCart();
}

function removeFromCart(id) {
  const name = findProduct(id).name;
  delete cart[id];
  saveCart();
  renderCart();
  showToast(name + " removed from cart");
}

function clearCart() {
  cart = {};
  saveCart();
  renderCart();
}

function bumpCounter() {
  const badge = $("#cart-count");
  badge.classList.remove("bump");
  void badge.offsetWidth; // restart the animation
  badge.classList.add("bump");
}

function renderCart() {
  const ids = Object.keys(cart);
  const count = cartCount();

  // Counter badge on the cart icon
  const badge = $("#cart-count");
  badge.textContent = count;
  badge.hidden = count === 0;
  $("#cart-open").setAttribute("aria-label", "Open cart, " + count + (count === 1 ? " item" : " items"));

  // Cart items
  const body = $("#cart-items");
  if (ids.length === 0) {
    body.innerHTML = `
      <div class="cart-empty">
        <img src="${PLACEHOLDER}" alt="" width="120" height="120">
        <strong>Your cart is empty</strong>
        Add a squishy and it will show up here.
      </div>`;
  } else {
    body.innerHTML = ids.map((id) => {
      const p = findProduct(id);
      const qty = cart[id];
      return `
        <div class="cart-item">
          <img src="${p.images[0]}" alt="${p.name}" width="72" height="72">
          <div>
            <div class="ci-name">${p.name}</div>
            <div class="ci-each">${peso(p.price)} each</div>
            <div class="ci-controls">
              <div class="qty">
                <button type="button" data-action="dec" data-id="${id}" aria-label="Decrease quantity of ${p.name}">&minus;</button>
                <span aria-live="polite">${qty}</span>
                <button type="button" data-action="inc" data-id="${id}" aria-label="Increase quantity of ${p.name}">+</button>
              </div>
            </div>
          </div>
          <div class="ci-side">
            <span class="ci-line">${peso(p.price * qty)}</span>
            <button type="button" class="ci-remove" data-action="remove" data-id="${id}" aria-label="Remove ${p.name} from cart">
              <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 1.8h6a2 2 0 0 0 2-1.8l1-12M9 7V4h6v3"/></svg>
            </button>
          </div>
        </div>`;
    }).join("");
    body.querySelectorAll("img").forEach(useFallback);
  }

  // Total price
  $("#cart-total").textContent = peso(cartTotal());
  $("#cart-foot").hidden = ids.length === 0;
}

/* Open / close the cart drawer */
function openCart() {
  lastFocused = document.activeElement;
  $("#overlay").hidden = false;
  const drawer = $("#cart-drawer");
  drawer.classList.add("open");
  drawer.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  $("#cart-close").focus();
}

function closeCart() {
  $("#overlay").hidden = true;
  const drawer = $("#cart-drawer");
  drawer.classList.remove("open");
  drawer.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
  if (lastFocused) lastFocused.focus();
}

const isCartOpen = () => $("#cart-drawer").classList.contains("open");

/* ---------- 6. QUICK VIEW MODAL ---------- */
function openModal(id) {
  const p = findProduct(id);
  if (!p) return;
  modalProductId = id;
  lastFocused = document.activeElement;

  $("#modal-title").textContent = p.name;
  $("#modal-desc").textContent = p.description;
  $("#modal-price").textContent = peso(p.price);
  $("#modal-cat").textContent = categoryLabel(p.category);

  const thumbs = $("#modal-thumbs");
  thumbs.innerHTML = p.images.length > 1
    ? p.images.map((src, i) => `
        <button type="button" class="thumb${i === 0 ? " active" : ""}" data-src="${src}" aria-label="Show photo ${i + 1} of ${p.name}">
          <img src="${src}" alt="" width="64" height="64">
        </button>`).join("")
    : "";
  thumbs.querySelectorAll("img").forEach(useFallback);

  setModalImage(p.images[0], p.name);

  const modal = $("#modal");
  modal.hidden = false;
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  $("#modal-close").focus();
}

function setModalImage(src, name) {
  const img = $("#modal-img");
  img.alt = name + " squishy toy";
  img.src = src;
  useFallback(img);
}

function closeModal() {
  const modal = $("#modal");
  modal.hidden = true;
  modal.setAttribute("aria-hidden", "true");
  modalProductId = null;
  document.body.style.overflow = isCartOpen() ? "hidden" : "";
  if (lastFocused) lastFocused.focus();
}

/* ---------- 7. TOAST MESSAGE ---------- */
function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2200);
}

/* ---------- 8. EVENTS ---------- */

// Filters (category chips)
$("#filters").addEventListener("click", (e) => {
  const chip = e.target.closest("[data-category]");
  if (!chip) return;
  activeCategory = chip.dataset.category;
  renderFilters();
  renderProducts();
});

// Search + sort
$("#search").addEventListener("input", (e) => {
  searchText = e.target.value;
  renderProducts();
});
$("#sort").addEventListener("change", (e) => {
  sortBy = e.target.value;
  renderProducts();
});

// Reset button in the "no results" box
$("#reset-filters").addEventListener("click", () => {
  activeCategory = "all";
  searchText = "";
  $("#search").value = "";
  renderFilters();
  renderProducts();
});

// Product cards: "Add to cart" and "view details"
$("#product-grid").addEventListener("click", (e) => {
  const target = e.target.closest("[data-action]");
  if (!target) return;
  const id = target.dataset.id;

  if (target.dataset.action === "add") {
    addToCart(id);
    showToast(findProduct(id).name + " added to cart");
    // Little button feedback
    const original = target.textContent;
    target.textContent = "Added!";
    setTimeout(() => { target.textContent = original; }, 900);
  }
  if (target.dataset.action === "view") openModal(id);
});

// Cart buttons (+, -, remove)
$("#cart-items").addEventListener("click", (e) => {
  const target = e.target.closest("[data-action]");
  if (!target) return;
  const id = target.dataset.id;
  if (target.dataset.action === "inc") changeQty(id, 1);
  if (target.dataset.action === "dec") changeQty(id, -1);
  if (target.dataset.action === "remove") removeFromCart(id);
});

$("#cart-open").addEventListener("click", openCart);
$("#cart-close").addEventListener("click", closeCart);
$("#overlay").addEventListener("click", closeCart);

$("#clear-cart").addEventListener("click", () => {
  clearCart();
  showToast("Cart cleared");
});

// Checkout is a demo. No real payment happens.
$("#checkout-btn").addEventListener("click", () => {
  if (cartCount() === 0) return;
  const total = peso(cartTotal());
  clearCart();
  closeCart();
  showToast("Thank you! Demo order of " + total + " (no real payment).");
});

// Modal
$("#modal-close").addEventListener("click", closeModal);
$("#modal").addEventListener("click", (e) => {
  if (e.target.id === "modal") closeModal(); // click on the dark background
});
$("#modal-thumbs").addEventListener("click", (e) => {
  const thumb = e.target.closest(".thumb");
  if (!thumb) return;
  document.querySelectorAll("#modal-thumbs .thumb").forEach((t) => t.classList.remove("active"));
  thumb.classList.add("active");
  setModalImage(thumb.dataset.src, findProduct(modalProductId).name);
});
$("#modal-add").addEventListener("click", () => {
  if (!modalProductId) return;
  addToCart(modalProductId);
  showToast(findProduct(modalProductId).name + " added to cart");
});

// Escape key closes whatever is open
document.addEventListener("keydown", (e) => {
  if (e.key !== "Escape") return;
  if (!$("#modal").hidden) closeModal();
  else if (isCartOpen()) closeCart();
  else closeMenu();
});

// Mobile menu
const menuBtn = $("#menu-toggle");
const nav = $("#main-nav");

function closeMenu() {
  nav.classList.remove("open");
  menuBtn.setAttribute("aria-expanded", "false");
  menuBtn.setAttribute("aria-label", "Open menu");
}

menuBtn.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  menuBtn.setAttribute("aria-expanded", String(open));
  menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
});
nav.addEventListener("click", (e) => {
  if (e.target.tagName === "A") closeMenu();
});

/* ---------- 9. HERO SQUISH PLAYGROUND ---------- */
// Press and hold to squish. Let go and it rises back slowly.
document.querySelectorAll(".squish").forEach((el) => {
  const press = () => {
    el.classList.remove("rising");
    el.classList.add("pressed");
  };
  const release = () => {
    if (!el.classList.contains("pressed")) return;
    el.classList.remove("pressed");
    void el.offsetWidth; // restart the animation
    el.classList.add("rising");
  };

  el.addEventListener("pointerdown", press);
  ["pointerup", "pointerleave", "pointercancel"].forEach((evt) => el.addEventListener(evt, release));

  // Keyboard: hold Space or Enter
  el.addEventListener("keydown", (e) => {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      if (!e.repeat) press();
    }
  });
  el.addEventListener("keyup", (e) => {
    if (e.key === " " || e.key === "Enter") release();
  });
  el.addEventListener("blur", release);
  el.addEventListener("animationend", () => el.classList.remove("rising"));
  useFallback(el.querySelector("img"));
});

/* ---------- 10. CONTACT FORM (front-end only) ---------- */
const form = $("#contact-form");

function setError(inputId, message) {
  const input = $("#" + inputId);
  const field = input.closest(".field");
  field.classList.toggle("invalid", Boolean(message));
  field.querySelector(".error").textContent = message;
  input.setAttribute("aria-invalid", message ? "true" : "false");
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = $("#c-name").value.trim();
  const email = $("#c-email").value.trim();
  const message = $("#c-message").value.trim();
  let valid = true;

  if (name.length < 2) { setError("c-name", "Please enter your name."); valid = false; }
  else setError("c-name", "");

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError("c-email", "Please enter a valid email, like name@email.com."); valid = false; }
  else setError("c-email", "");

  if (message.length < 10) { setError("c-message", "Please write at least 10 characters."); valid = false; }
  else setError("c-message", "");

  const status = $("#form-status");
  if (!valid) {
    status.textContent = "";
    return;
  }

  // No server here, so we just show a thank-you message.
  status.textContent = "Thanks, " + name.split(" ")[0] + "! Your message is ready to send (demo only).";
  form.reset();
});

/* ---------- 11. START ---------- */
$("#year").textContent = new Date().getFullYear();
renderFilters();
renderProducts();
renderCart();
