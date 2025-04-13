// بيانات المنتجات
const products = [
    {
        id: 1,
        name: "حليب طازج",
        category: "مشتريات الحليب",
        prices: {
            retail: 15.00,
            wholesale: 12.00,
            distribution: 10.00
        },
        image: "https://via.placeholder.com/100"
    },
    {
        id: 2,
        name: "خبز أبيض",
        category: "المخبوزات",
        prices: {
            retail: 5.00,
            wholesale: 4.00,
            distribution: 3.50
        },
        image: "https://via.placeholder.com/100"
    },
    {
        id: 3,
        name: "أرز بسمتي",
        category: "البقالة",
        prices: {
            retail: 25.00,
            wholesale: 20.00,
            distribution: 18.00
        },
        image: "https://via.placeholder.com/100"
    },
    {
        id: 4,
        name: "زيت زيتون",
        category: "البقالة",
        prices: {
            retail: 35.00,
            wholesale: 30.00,
            distribution: 28.00
        },
        image: "https://via.placeholder.com/100"
    }
];

// حالة التطبيق
let state = {
    cart: [],
    priceType: 'retail',
    discount: 0
};

// DOM Elements
const productsContainer = document.getElementById('productsContainer');
const cartItems = document.getElementById('cartItems');
const subtotalElement = document.getElementById('subtotal');
const totalElement = document.getElementById('total');
const discountInput = document.getElementById('discountInput');
const priceTypeSelect = document.getElementById('priceType');
const checkoutBtn = document.getElementById('checkoutBtn');

// Initialize the app
function init() {
    renderProducts();
    setupEventListeners();
}

// Render products based on current state
function renderProducts() {
    productsContainer.innerHTML = '';
    
    products.forEach(product => {
        const productElement = document.createElement('div');
        productElement.className = 'col-md-4 mb-3';
        productElement.innerHTML = `
            <div class="card h-100">
                <img src="${product.image}" class="card-img-top" alt="${product.name}">
                <div class="card-body">
                    <h5 class="card-title">${product.name}</h5>
                    <p class="card-text">${product.category}</p>
                    <p class="price">${product.prices[state.priceType]} ر.س</p>
                    <button class="btn btn-primary add-to-cart" data-id="${product.id}">إضافة للسلة</button>
                </div>
            </div>
        `;
        productsContainer.appendChild(productElement);
    });
}

// Render cart items
function renderCart() {
    cartItems.innerHTML = '';
    
    if (state.cart.length === 0) {
        cartItems.innerHTML = '<p class="text-center text-muted">السلة فارغة</p>';
        return;
    }
    
    state.cart.forEach(item => {
        const cartItemElement = document.createElement('div');
        cartItemElement.className = 'cart-item d-flex justify-content-between align-items-center mb-2 p-2 bg-white';
        cartItemElement.innerHTML = `
            <div class="item-info">
                <h6>${item.name}</h6>
                <small>${item.price} ر.س × ${item.quantity}</small>
            </div>
            <div class="item-actions">
                <input type="number" class="form-control form-control-sm quantity-input" 
                       value="${item.quantity}" min="1" data-id="${item.id}" style="width: 60px;">
                <button class="btn btn-sm btn-danger remove-item" data-id="${item.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        cartItems.appendChild(cartItemElement);
    });
    
    updateTotals();
}

// Update subtotal and total
function updateTotals() {
    const subtotal = state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const discountAmount = subtotal * (state.discount / 100);
    const total = subtotal - discountAmount;
    
    subtotalElement.textContent = subtotal.toFixed(2) + ' ر.س';
    totalElement.textContent = total.toFixed(2) + ' ر.س';
}

// Setup event listeners
function setupEventListeners() {
    // تغيير نوع السعر
    priceTypeSelect.addEventListener('change', (e) => {
        state.priceType = e.target.value;
        renderProducts();
        
        // تحديث أسعار العناصر في السلة
        state.cart = state.cart.map(item => {
            const product = products.find(p => p.id === item.productId);
            return {
                ...item,
                price: product.prices[state.priceType]
            };
        });
        
        renderCart();
    });
    
    // إضافة منتج للسلة
    productsContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('add-to-cart')) {
            const productId = parseInt(e.target.getAttribute('data-id'));
            const product = products.find(p => p.id === productId);
            
            const existingItem = state.cart.find(item => item.productId === productId);
            
            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                state.cart.push({
                    productId: product.id,
                    name: product.name,
                    price: product.prices[state.priceType],
                    quantity: 1
                });
            }
            
            renderCart();
        }
    });
    
    // إزالة منتج من السلة
    cartItems.addEventListener('click', (e) => {
        if (e.target.classList.contains('remove-item') || 
            e.target.parentElement.classList.contains('remove-item')) {
            const button = e.target.classList.contains('remove-item') ? 
                            e.target : e.target.parentElement;
            const productId = parseInt(button.getAttribute('data-id'));
            
            state.cart = state.cart.filter(item => item.productId !== productId);
            renderCart();
        }
    });
    
    // تغيير الكمية
    cartItems.addEventListener('change', (e) => {
        if (e.target.classList.contains('quantity-input')) {
            const productId = parseInt(e.target.getAttribute('data-id'));
            const quantity = parseInt(e.target.value);
            
            const item = state.cart.find(item => item.productId === productId);
            if (item && quantity > 0) {
                item.quantity = quantity;
                renderCart();
            }
        }
    });
    
    // تطبيق الخصم
    discountInput.addEventListener('change', (e) => {
        const discount = parseInt(e.target.value);
        if (!isNaN(discount) && discount >= 0 && discount <= 100) {
            state.discount = discount;
            updateTotals();
        }
    });
    
    // إتمام الشراء
    checkoutBtn.addEventListener('click', () => {
        if (state.cart.length === 0) {
            alert('السلة فارغة!');
            return;
        }
        
        const total = parseFloat(totalElement.textContent);
        alert(`تم إتمام عملية الشراء بنجاح!\nالمبلغ الإجمالي: ${total.toFixed(2)} ر.س`);
        
        // إعادة تعيين السلة
        state.cart = [];
        state.discount = 0;
        discountInput.value = 0;
        renderCart();
    });
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);