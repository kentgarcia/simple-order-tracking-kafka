let cart = [];
let currentCategory = 'all';

document.addEventListener('DOMContentLoaded', () => {
    renderCategories();
    renderFoodItems();
    refreshAllData();
    lucide.createIcons();
    
    // Check if we need to show a specific view based on URL hash or default
    navigateTo('view-customer-home'); 
});

// --- Navigation ---
function navigateTo(viewId, btnElement) {
    document.querySelectorAll('.page-view').forEach(el => el.classList.add('hidden'));
    document.getElementById(viewId).classList.remove('hidden');

    if (btnElement) {
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('text-primary');
            btn.classList.add('text-gray-400');
        });
        btnElement.classList.remove('text-gray-400');
        btnElement.classList.add('text-primary');
    } else if (viewId === 'view-customer-home') {
            const btns = document.querySelectorAll('.nav-btn');
            if(btns.length) {
            btns[0].classList.add('text-primary');
            btns[0].classList.remove('text-gray-400');
            }
    } else if (viewId === 'view-customer-track') {
        const btns = document.querySelectorAll('.nav-btn');
            if(btns.length >= 2) {
            btns[1].classList.add('text-primary');
            btns[1].classList.remove('text-gray-400');
            }
    }
    refreshAllData();
}

function refreshAllData() {
    renderCustomerHistory();
    renderCustomerTrack();
}

// --- Ordering Logic ---
function renderCategories() {
    const list = document.getElementById('categoryList');
    if(!list) return;
    list.innerHTML = categories.map(cat => 
        `<button onclick="setCategory('${cat.id}')" class="flex flex-col items-center gap-1 min-w-[70px] ${currentCategory === cat.id ? 'text-primary' : 'text-gray-400 opacity-60'}">
            <div class="w-14 h-14 rounded-full flex items-center justify-center ${currentCategory === cat.id ? 'bg-primary text-white shadow-lg' : 'bg-white text-gray-400 shadow-sm'}"><i data-lucide="${cat.icon}" class="w-6 h-6"></i></div>
            <span class="text-xs font-medium">${cat.name}</span>
        </button>`).join('');
    lucide.createIcons();
}

function setCategory(id) { currentCategory = id; renderCategories(); renderFoodItems(); }

function renderFoodItems() {
    const grid = document.getElementById('foodGrid');
    if(!grid) return;
    const filtered = currentCategory === 'all' ? foodItems : foodItems.filter(i => i.category === currentCategory);
    grid.innerHTML = filtered.map(item => `
        <div class="bg-white rounded-3xl p-3 shadow-sm hover:shadow-md transition-all flex gap-4 items-center">
            <div class="h-24 w-24 rounded-2xl overflow-hidden flex-shrink-0"><img src="${item.image}" class="w-full h-full object-cover"></div>
            <div class="flex-1">
                <h3 class="font-bold text-dark leading-tight mb-1">${item.name}</h3>
                <p class="text-xs text-gray-400 line-clamp-1 mb-2">${item.desc}</p>
                <div class="flex items-center justify-between">
                    <span class="font-bold text-dark">$${item.price}</span>
                    <button onclick="addToCart(${item.id})" class="bg-dark text-white p-2 rounded-xl shadow-lg hover:bg-primary transition-colors"><i data-lucide="plus" class="w-4 h-4"></i></button>
                </div>
            </div>
        </div>
    `).join('');
    lucide.createIcons();
}

function addToCart(id) {
    const item = foodItems.find(i => i.id === id);
    const existing = cart.find(i => i.id === id);
    existing ? existing.quantity++ : cart.push({...item, quantity: 1});
    renderCart();
    document.getElementById('cartSidebar').classList.add('cart-open');
    document.getElementById('cartOverlay').classList.remove('hidden');
    setTimeout(() => document.getElementById('cartOverlay').classList.add('opacity-100'), 10);
}

function renderCart() {
    const container = document.getElementById('cartItemsContainer');
    if(cart.length === 0) {
        container.innerHTML = `<div class="flex flex-col items-center justify-center h-full text-center opacity-50"><i data-lucide="shopping-cart" class="w-12 h-12 mb-4 text-gray-300"></i><p>Your cart is empty</p></div>`;
        document.getElementById('totalPrice').innerText = '$0.00';
    } else {
        const total = cart.reduce((acc, i) => acc + (i.price * i.quantity), 0);
        document.getElementById('totalPrice').innerText = `$${total.toFixed(2)}`;
        container.innerHTML = cart.map(item => `
            <div class="flex gap-4 items-center animate-[slideIn_0.3s_ease-out]">
                <img src="${item.image}" class="w-16 h-16 rounded-xl object-cover">
                <div class="flex-1">
                    <h4 class="font-bold text-sm text-dark">${item.name}</h4>
                    <p class="text-primary text-sm font-bold">$${(item.price * item.quantity).toFixed(2)}</p>
                        <div class="flex items-center gap-2 mt-1"><span class="text-xs text-gray-500">Qty: ${item.quantity}</span></div>
                </div>
            </div>
        `).join('');
    }
    lucide.createIcons();
}

function toggleCart() {
    const sb = document.getElementById('cartSidebar');
    const ov = document.getElementById('cartOverlay');
    if(sb.classList.contains('cart-open')) {
        sb.classList.remove('cart-open');
        ov.classList.remove('opacity-100');
        setTimeout(() => ov.classList.add('hidden'), 300);
    } else {
        ov.classList.remove('hidden');
        setTimeout(() => ov.classList.add('opacity-100'), 10);
        sb.classList.add('cart-open');
    }
}

function checkout() {
    if(cart.length > 0) {
        const newOrder = {
            id: Math.floor(Math.random()*1000) + 2000, 
            customer: 'Alex Johnson', 
            items: cart.map(i => i.name).join(', '), 
            total: cart.reduce((acc, i) => acc + (i.price * i.quantity), 0), 
            status: 'pending', 
            time: 'Just now'
        };
        
        orders.unshift(newOrder);
        saveOrders(); // Calls shared.js logic
        
        cart = [];
        renderCart();
        toggleCart();
        openModal('orderSuccessModal');
    }
}

// --- Tracking Logic ---
function renderCustomerTrack() {
    const activeOrder = orders.find(o => 
        (o.status === 'pending' || o.status === 'preparing' || o.status === 'ready' || o.status === 'picked_up') 
        && o.customer === 'Alex Johnson'
    );

    const container = document.getElementById('track-order-content');
    const emptyState = document.getElementById('track-order-empty');
    if (!container || !emptyState) return;

    if (!activeOrder) {
        container.classList.add('hidden');
        emptyState.classList.remove('hidden');
        return;
    }

    container.classList.remove('hidden');
    emptyState.classList.add('hidden');

    document.getElementById('track-order-id').innerText = `Order #${activeOrder.id}`;
    document.getElementById('track-order-items').innerText = activeOrder.items;
    
    // Animation
    const imgEl = document.getElementById('track-animation');
    const statusText = document.getElementById('track-status-text');
    const stepsContainer = document.getElementById('track-steps');
    
    const anims = {
        pending: './anim/confirmed.gif', 
        preparing: './anim/cooking.gif',
        ready: './anim/ready.gif',
        picked_up: './anim/onway.gif',
        delivered: './anim/delivered.gif'
    };

    const descriptions = {
        pending: 'Restaurant is confirming your order...',
        preparing: 'Chef is cooking your meal!',
        ready: 'Order packed and waiting for rider.',
        picked_up: 'Rider is on the way!',
        delivered: 'Delivered! Enjoy your meal.'
    };

    if (imgEl && statusText) {
        const newSrc = anims[activeOrder.status] || anims['pending'];
        if (imgEl.getAttribute('src') !== newSrc) {
                imgEl.setAttribute('src', newSrc);
        }
        statusText.innerText = descriptions[activeOrder.status];
    }

    // Steps
    const steps = [
        { id: 'pending', label: 'Confirmed', sub: 'Order received' },
        { id: 'preparing', label: 'Cooking', sub: 'Chef is working' },
        { id: 'ready', label: 'Ready', sub: 'Waiting for pickup' },
        { id: 'picked_up', label: 'On Way', sub: 'Rider picked up' },
        { id: 'delivered', label: 'Delivered', sub: 'Enjoy!' }
    ];
    const currentIndex = ['pending', 'preparing', 'ready', 'picked_up', 'delivered'].indexOf(activeOrder.status);

    stepsContainer.innerHTML = steps.map((step, index) => {
        const isActive = index <= currentIndex;
        const isCurrent = index === currentIndex;
        return `
        <div class="relative ${isActive ? '' : 'opacity-40'}">
            <div class="absolute -left-[21px] top-0 w-4 h-4 rounded-full border-2 border-white shadow-sm transition-all duration-300 ${isActive ? 'bg-primary border-primary' : 'bg-gray-200 border-white'}"></div>
            <h4 class="text-sm ${isCurrent ? 'font-bold text-dark' : 'text-gray-500'}">${step.label}</h4>
            <p class="text-xs text-gray-400">${step.sub}</p>
        </div>
    `}).join('');
}

// --- History Logic ---
function renderCustomerHistory() {
        const listEl = document.getElementById('customerHistoryList');
        if(!listEl) return;

        const myHistory = orders.filter(o => (['delivered', 'declined'].includes(o.status)) && o.customer === 'Alex Johnson');
        
        // Ensure we always have some history for demo
        const demoHistory = orders.filter(o => o.id === 104);
        const allHistory = [...myHistory, ...demoHistory]; 
        // Uniquify by ID
        const uniqueHistory = Array.from(new Map(allHistory.map(item => [item.id, item])).values());

        listEl.innerHTML = uniqueHistory.length === 0 ? `<p class="text-center text-gray-400 py-10">No past orders.</p>` :
        uniqueHistory.map(o => `
        <button onclick="openOrderDetails(${o.id})" class="w-full bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center hover:shadow-md transition-all text-left group">
            <div class="flex items-center gap-4">
                <div class="h-12 w-12 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                    <i data-lucide="receipt" class="w-6 h-6"></i>
                </div>
                <div>
                    <h4 class="font-bold text-dark text-base">Order #${o.id}</h4>
                    <p class="text-xs text-gray-400 mt-1 max-w-[150px] truncate">${o.items}</p>
                    <p class="text-[10px] text-gray-400 mt-1">${o.time}</p>
                </div>
            </div>
            <div class="flex flex-col items-end gap-2">
                <span class="font-bold text-dark text-lg">$${o.total.toFixed(2)}</span>
                <span class="px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${o.status === 'delivered' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}">
                    ${o.status.replace('_', ' ')}
                </span>
            </div>
        </button>
        `).join('');
        lucide.createIcons();
}

// --- Modal/Ui Helpers ---
function toggleBottomProfile() {
    const sheet = document.getElementById('bottomProfileSheet');
    const overlay = document.getElementById('cartOverlay');
    if (sheet.classList.contains('translate-y-full')) {
        sheet.classList.remove('hidden');
        setTimeout(() => sheet.classList.remove('translate-y-full'), 10);
        overlay.classList.remove('hidden');
        setTimeout(() => overlay.classList.add('opacity-100'), 10);
        const closeHandler = () => { toggleBottomProfile(); overlay.removeEventListener('click', closeHandler); overlay.onclick = toggleCart; };
        overlay.onclick = closeHandler;
    } else {
        sheet.classList.add('translate-y-full');
        overlay.classList.remove('opacity-100');
        setTimeout(() => { sheet.classList.add('hidden'); overlay.classList.add('hidden'); overlay.onclick = toggleCart; }, 300);
    }
}

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    const content = modal.querySelector('div[id$="Content"]');
    const backdrop = modal.querySelector('div[id$="Backdrop"]');
    modal.classList.remove('hidden');
    setTimeout(() => { backdrop.classList.remove('opacity-0'); content.classList.remove('opacity-0', 'scale-95'); content.classList.add('scale-100'); }, 10);
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    const content = modal.querySelector('div[id$="Content"]');
    const backdrop = modal.querySelector('div[id$="Backdrop"]');
    backdrop.classList.add('opacity-0'); content.classList.remove('scale-100'); content.classList.add('opacity-0', 'scale-95');
    setTimeout(() => modal.classList.add('hidden'), 300);
}

function openOrderDetails(id) {
    const order = orders.find(o => o.id === id);
    if(!order) return;
    document.getElementById('modalOrderId').innerText = `Order #${order.id}`;
    document.getElementById('modalOrderItems').innerText = order.items;
    document.getElementById('modalOrderDate').innerText = order.time;
    document.getElementById('modalOrderTotal').innerText = `$${order.total.toFixed(2)}`;
    const statusEl = document.getElementById('modalOrderStatus');
    statusEl.innerText = `Status: ${order.status.toUpperCase().replace('_', ' ')}`;
    statusEl.className = `p-4 rounded-xl text-center font-bold text-sm ${order.status === 'delivered' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`;
    openModal('orderDetailsModal');
}

function checkDeliveryStatus(oldOrders, newOrders) {
    // Toast Logic
    newOrders.forEach(newOrder => {
        const oldOrder = oldOrders.find(o => o.id === newOrder.id);
        if (oldOrder && oldOrder.status !== 'delivered' && newOrder.status === 'delivered' && newOrder.customer === 'Alex Johnson') {
            showToast('Order Delivered!', `Your delicious meal (Order #${newOrder.id}) has arrived!`);
        }
    });
}

function showToast(title, message) {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = 'bg-white p-6 rounded-3xl shadow-2xl border border-gray-100 flex items-center gap-6 transform translate-y-[-20px] opacity-0 transition-all duration-300 pointer-events-auto w-full max-w-xl';
    toast.innerHTML = `<div class="bg-green-100 text-green-600 p-4 rounded-full flex-shrink-0"><i data-lucide="check" class="w-10 h-10"></i></div><div class="flex-1"><h4 class="font-bold text-dark text-2xl mb-1">${title}</h4><p class="text-base text-gray-500 font-medium">${message}</p></div>`;
    container.appendChild(toast);
    lucide.createIcons({ root: toast });
    requestAnimationFrame(() => toast.classList.remove('translate-y-[-20px]', 'opacity-0'));
    setTimeout(() => { toast.classList.add('translate-y-[-20px]', 'opacity-0'); setTimeout(() => toast.remove(), 300); }, 4000);
}