const usernameDisplay = document.getElementById('username-display');

document.addEventListener('DOMContentLoaded', function () {

    // check if user data is already stored in localStorage
    const storedUserData = localStorage.getItem('firstName');
    if (!storedUserData) {
        alert('Anda belum login!');
        window.location.href = 'login.html';
        return;
    }

    usernameDisplay.textContent = storedUserData;
})

const logoutButton = document.getElementById('logout-button');

logoutButton.addEventListener('click', function () {
    // Clear user data from localStorage
    localStorage.removeItem('firstName');
    localStorage.removeItem('lastName');
    localStorage.removeItem('email');

    // Redirect to login page
    window.location.href = 'login.html';
});

// ===== Render Produk Dinamis =====

const PRODUCTS_API_URL = 'https://dummyjson.com/products';
const productListContainer = document.getElementById('product-list');

let allProducts = [];
let displayedProducts = [];
let currentPage = 1;
const PRODUCTS_PER_PAGE = 8;

async function fetchProducts() {
    try {
        const response = await fetch(PRODUCTS_API_URL);

        if (!response.ok) {
            throw new Error(`Gagal mengambil data produk (status ${response.status})`);
        }

        const data = await response.json();
        allProducts = data.products;
        renderProducts(allProducts);
    } catch (error) {
        console.error(error);
        productListContainer.innerHTML = `<p class="error-message">Gagal memuat produk. Silakan coba lagi nanti.</p>`;
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
            <button class="add-to-cart-btn">Tambah ke Keranjang</button>
        </div>
    `;
}

fetchProducts();

// ===== Pencarian Real-Time (Debounce & Closures) =====

function debounce(callback, delay) {
    let timeoutId;

    return function (...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            callback.apply(this, args);
        }, delay);
    };
}

function filterProducts(keyword) {
    const lowerKeyword = keyword.toLowerCase().trim();

    const filteredProducts = allProducts.filter(function (product) {
        return product.title.toLowerCase().includes(lowerKeyword) ||
            product.category.toLowerCase().includes(lowerKeyword);
    });

    renderProducts(filteredProducts);
}

const handleSearchInput = debounce(function (event) {
    filterProducts(event.target.value);
}, 400);

const searchInput = document.getElementById('search-input');
searchInput.addEventListener('input', handleSearchInput);

// ===== Keranjang Belanja Sederhana (Local Storage CRUD) =====

const CART_STORAGE_KEY = 'cart';
const cartBadge = document.getElementById('cart-badge');
const cartTotal = document.getElementById('cart-total');

function getCart() {
    const storedCart = localStorage.getItem(CART_STORAGE_KEY);
    return storedCart ? JSON.parse(storedCart) : [];
}

function saveCart(cart) {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
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
            quantity: 1
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
        localStorage.removeItem(CART_STORAGE_KEY);
    }

    updateCartSummary();
}

function updateCartSummary() {
    const cart = getCart();

    const totalItems = cart.reduce(function (sum, item) {
        return sum + item.quantity;
    }, 0);

    const totalPrice = cart.reduce(function (sum, item) {
        return sum + (item.price * item.quantity);
    }, 0);

    cartBadge.textContent = totalItems;
    cartTotal.textContent = `$${totalPrice.toFixed(2)}`;
}

productListContainer.addEventListener('click', function (event) {
    const addToCartButton = event.target.closest('.add-to-cart-btn');
    if (!addToCartButton) return;

    const productCard = addToCartButton.closest('.product-card');
    const productId = Number(productCard.dataset.id);

    addToCart(productId);
});

updateCartSummary();

// ===== Load More / Pagination =====

const loadMoreButton = document.getElementById('load-more-button');

function renderCurrentPage() {
    const visibleProducts = displayedProducts.slice(0, currentPage * PRODUCTS_PER_PAGE);
    productListContainer.innerHTML = visibleProducts.map(createProductCard).join('');
    updateLoadMoreButton();
}

function updateLoadMoreButton() {
    const hasMore = currentPage * PRODUCTS_PER_PAGE < displayedProducts.length;
    loadMoreButton.style.display = hasMore ? '' : 'none';
}

loadMoreButton.addEventListener('click', function () {
    currentPage += 1;
    renderCurrentPage();
});