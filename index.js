// 1. Proteksi Halaman (Auth Guard)
const usernameDisplay = document.getElementById("username-display");

document.addEventListener("DOMContentLoaded", function () {
  try {
    const storedUserData = localStorage.getItem("firstName");
    if (!storedUserData) {
      alert("Anda belum login!");
      window.location.href = "login.html";
      return;
    }

    usernameDisplay.textContent = storedUserData;
  } catch (error) {
    console.error("Gagal memeriksa sesi login:", error);
    alert("Terjadi masalah. Silakan login ulang.");
    window.location.href = "login.html";
  }
});

// 2. Navigation Bar
const logoutButton = document.getElementById("logout-button");

logoutButton.addEventListener("click", function () {
  try {
    // Clear user data from localStorage
    localStorage.removeItem("firstName");
    localStorage.removeItem("lastName");
    localStorage.removeItem("email");
  } catch (error) {
    console.error("Gagal membersihkan data sesi:", error);
  } finally {
    // Redirect tetap jalan meskipun localStorage.removeItem gagal
    window.location.href = "login.html";
  }
});

// 3. Render Produk Dinamis

const PRODUCTS_API_URL = "https://dummyjson.com/products";
const productListContainer = document.getElementById("product-list");

let allProducts = [];
let displayedProducts = [];
let currentPage = 1;
const PRODUCTS_PER_PAGE = 8;

async function fetchProducts() {
  try {
    const response = await fetch(PRODUCTS_API_URL);

    if (!response.ok) {
      throw new Error(
        `Gagal mengambil data produk (status ${response.status})`,
      );
    }

    const data = await response.json();

    if (!data || !Array.isArray(data.products)) {
      throw new Error("Data produk dari server tidak sesuai.");
    }

    allProducts = data.products;
    populateCategoryFilter();
    renderProducts(allProducts);
  } catch (error) {
    // Error Handling.
    console.error(error);
    productListContainer.innerHTML = `<p class="error-message">Gagal memuat produk. Periksa koneksi internet Anda lalu muat ulang halaman.</p>`;
  }
}

function renderProducts(products) {
  displayedProducts = products;
  currentPage = 1;
  renderCurrentPage();
}

function createProductCard(product) {
  return `
        <div class="product-card" data-id="${product.id}">
            <div class="product-thumbnail">
                <img src="${product.thumbnail}" alt="${product.title}">
            </div>
            <div class="product-category">${product.category}</div>
            <h3 class="product-name">${product.title}</h3>
            <div class="product-price">$${product.price}</div>
            <div class="product-rating">⭐ ${product.rating}</div>
            <div class="product-discount">-${product.discountPercentage}%</div>
            <button class="view-detail-btn">Lihat Detail</button>
            <button class="add-to-cart-btn">Tambah ke Keranjang</button>
        </div>
    `;
}

fetchProducts();

// 4. Pencarian Real-Time (Debounce & Closures)

function debounce(callback, delay) {
  let timeoutId;

  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      callback.apply(this, args);
    }, delay);
  };
}

const handleSearchInput = debounce(function () {
  applyFiltersAndSort();
}, 400);

const searchInput = document.getElementById("search-input");
searchInput.addEventListener("input", handleSearchInput);

// 5. Keranjang Belanja (Local Storage CRUD)

const CART_STORAGE_KEY = "cart";
const cartBadge = document.getElementById("cart-badge");
const cartTotal = document.getElementById("cart-total");

function getCart() {
  try {
    const storedCart = localStorage.getItem(CART_STORAGE_KEY);
    return storedCart ? JSON.parse(storedCart) : [];
  } catch (error) {
    // Data di localStorage tidak valid.
    console.error("Gagal membaca data keranjang:", error);
    return [];
  }
}

function saveCart(cart) {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  } catch (error) {
    // Gagal jika storage penuh
    console.error("Gagal menyimpan data keranjang:", error);
    alert(
      "Gagal menyimpan perubahan keranjang. Penyimpanan browser penuh atau dinonaktifkan.",
    );
  }
}

function addToCart(productId) {
  const product = allProducts.find(function (item) {
    return item.id === productId;
  });

  if (!product) return;

  const cart = getCart();
  const existingItem = cart.find(function (item) {
    return item.id === productId;
  });

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      id: product.id,
      title: product.title,
      price: product.price,
      thumbnail: product.thumbnail,
      quantity: 1,
    });
  }

  saveCart(cart);
  updateCartSummary();
}

function removeFromCart(productId) {
  const cart = getCart().filter(function (item) {
    return item.id !== productId;
  });

  if (cart.length > 0) {
    saveCart(cart);
  } else {
    try {
      localStorage.removeItem(CART_STORAGE_KEY);
    } catch (error) {
      console.error("Gagal menghapus data keranjang:", error);
    }
  }

  updateCartSummary();
}

const cartItemsContainer = document.getElementById("cart-items");

function updateCartSummary() {
  const cart = getCart();

  const totalItems = cart.reduce(function (sum, item) {
    return sum + item.quantity;
  }, 0);

  const totalPrice = cart.reduce(function (sum, item) {
    return sum + item.price * item.quantity;
  }, 0);

  cartBadge.textContent = totalItems;
  cartTotal.textContent = `$${totalPrice.toFixed(2)}`;
  renderCartItems();
}

function createCartItemRow(item) {
  return `
        <div class="cart-item" data-id="${item.id}">
            <img src="${item.thumbnail}" alt="${item.title}">
            <span class="cart-item-title">${item.title}</span>
            <button class="decrease-qty-btn" aria-label="Kurangi jumlah">-</button>
            <span class="cart-item-qty">${item.quantity}</span>
            <button class="increase-qty-btn" aria-label="Tambah jumlah">+</button>
            <span class="cart-item-price">$${(item.price * item.quantity).toFixed(2)}</span>
            <button class="remove-item-btn" aria-label="Hapus item">🗑</button>
        </div>
    `;
}

function renderCartItems() {
  const cart = getCart();

  if (cart.length === 0) {
    cartItemsContainer.innerHTML = `<p class="cart-empty-message">Keranjang masih kosong.</p>`;
    return;
  }

  cartItemsContainer.innerHTML = cart.map(createCartItemRow).join("");
}

function changeCartQuantity(productId, delta) {
  const cart = getCart();
  const item = cart.find(function (i) {
    return i.id === productId;
  });
  if (!item) return;

  item.quantity += delta;

  if (item.quantity <= 0) {
    removeFromCart(productId);
  } else {
    saveCart(cart);
    updateCartSummary();
  }
}

// 6. Event Delegation: listener di #cart-items untuk semua tombol +/-/hapus
cartItemsContainer.addEventListener("click", function (event) {
  const cartItemEl = event.target.closest(".cart-item");
  if (!cartItemEl) return;

  const productId = Number(cartItemEl.dataset.id);

  if (event.target.closest(".remove-item-btn")) {
    removeFromCart(productId);
  } else if (event.target.closest(".increase-qty-btn")) {
    changeCartQuantity(productId, 1);
  } else if (event.target.closest(".decrease-qty-btn")) {
    changeCartQuantity(productId, -1);
  }
});

productListContainer.addEventListener("click", function (event) {
  const addToCartButton = event.target.closest(".add-to-cart-btn");
  if (!addToCartButton) return;

  const productCard = addToCartButton.closest(".product-card");
  const productId = Number(productCard.dataset.id);

  addToCart(productId);
});

updateCartSummary();

// 7. Load More / Pagination

const loadMoreButton = document.getElementById("load-more-button");

function renderCurrentPage() {
  const visibleProducts = displayedProducts.slice(
    0,
    currentPage * PRODUCTS_PER_PAGE,
  );
  productListContainer.innerHTML = visibleProducts
    .map(createProductCard)
    .join("");
  updateLoadMoreButton();
}

function updateLoadMoreButton() {
  const hasMore = currentPage * PRODUCTS_PER_PAGE < displayedProducts.length;
  loadMoreButton.style.display = hasMore ? "" : "none";
}

loadMoreButton.addEventListener("click", function () {
  currentPage += 1;
  renderCurrentPage();
});

// 8. Detail Produk Modal (Event Delegation)

const productModal = document.getElementById("product-modal");
const modalThumbnail = document.getElementById("modal-thumbnail");
const modalCategory = document.getElementById("modal-category");
const modalTitle = document.getElementById("modal-title");
const modalBrand = document.getElementById("modal-brand");
const modalPrice = document.getElementById("modal-price");
const modalRating = document.getElementById("modal-rating");
const modalStock = document.getElementById("modal-stock");
const modalDescription = document.getElementById("modal-description");
const modalCloseButton = document.getElementById("modal-close-button");
const modalAddToCartButton = document.getElementById(
  "modal-add-to-cart-button",
);

let activeModalProductId = null;

function openProductModal(productId) {
  const product = allProducts.find(function (item) {
    return item.id === productId;
  });

  if (!product) return;

  activeModalProductId = product.id;

  modalThumbnail.src = product.thumbnail;
  modalThumbnail.alt = product.title;
  modalCategory.textContent = product.category;
  modalTitle.textContent = product.title;
  modalBrand.textContent = `Brand: ${product.brand || "-"}`;
  modalPrice.textContent = `$${product.price}`;
  modalRating.textContent = `⭐ ${product.rating}`;
  modalStock.textContent = `Stok tersedia: ${product.stock}`;
  modalDescription.textContent = product.description;

  productModal.style.display = "flex";
}

function closeProductModal() {
  productModal.style.display = "none";
  activeModalProductId = null;
}

// 9. Event Delegation: listener di #product-list untuk semua kartu produk
productListContainer.addEventListener("click", function (event) {
  if (event.target.closest(".add-to-cart-btn")) return;

  const productCard = event.target.closest(".product-card");
  if (!productCard) return;

  const productId = Number(productCard.dataset.id);
  openProductModal(productId);
});

modalCloseButton.addEventListener("click", closeProductModal);

productModal.addEventListener("click", function (event) {
  if (event.target === productModal) {
    closeProductModal();
  }
});

modalAddToCartButton.addEventListener("click", function () {
  if (activeModalProductId !== null) {
    addToCart(activeModalProductId);
  }
});

// 10. Filter & Sorting (Functional Programming)

const categoryFilter = document.getElementById("category-filter");
const sortSelect = document.getElementById("sort-select");

function populateCategoryFilter() {
  const categories = [
    ...new Set(
      allProducts.map(function (product) {
        return product.category;
      }),
    ),
  ];

  const options = categories.map(function (category) {
    return `<option value="${category}">${category}</option>`;
  });

  categoryFilter.innerHTML = `<option value="all">Semua Kategori</option>${options.join("")}`;
}

function sortProducts(products, sortOption) {
  const sorted = [...products];

  switch (sortOption) {
    case "price-asc":
      return sorted.sort(function (a, b) {
        return a.price - b.price;
      });
    case "price-desc":
      return sorted.sort(function (a, b) {
        return b.price - a.price;
      });
    case "rating-asc":
      return sorted.sort(function (a, b) {
        return a.rating - b.rating;
      });
    case "rating-desc":
      return sorted.sort(function (a, b) {
        return b.rating - a.rating;
      });
    default:
      return sorted;
  }
}

function getFilteredAndSortedProducts() {
  const keyword = searchInput.value.toLowerCase().trim();
  const selectedCategory = categoryFilter.value;

  const filtered = allProducts.filter(function (product) {
    const matchesKeyword =
      product.title.toLowerCase().includes(keyword) ||
      product.category.toLowerCase().includes(keyword);
    const matchesCategory =
      selectedCategory === "all" || product.category === selectedCategory;

    return matchesKeyword && matchesCategory;
  });

  return sortProducts(filtered, sortSelect.value);
}

function applyFiltersAndSort() {
  renderProducts(getFilteredAndSortedProducts());
}

categoryFilter.addEventListener("change", applyFiltersAndSort);
sortSelect.addEventListener("change", applyFiltersAndSort);
