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
    productListContainer.innerHTML = products.map(createProductCard).join('');
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