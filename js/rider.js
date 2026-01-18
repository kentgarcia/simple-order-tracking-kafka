document.addEventListener('DOMContentLoaded', () => {
    refreshAllData();
    lucide.createIcons();
    switchRiderTab('available');
});

// Hook for shared.js
function refreshAllData() {
    renderAvailableOrders();
    renderMyDeliveries();
}

function switchRiderTab(tabId) {
    document.querySelectorAll('.rider-tab-btn').forEach(btn => {
        btn.classList.remove('bg-dark', 'text-white');
        btn.classList.add('bg-white', 'text-gray-500');
    });
    document.getElementById(`btn-rider-${tabId}`).classList.add('bg-dark', 'text-white');
    document.getElementById(`btn-rider-${tabId}`).classList.remove('bg-white', 'text-gray-500');

    document.querySelectorAll('.rider-view').forEach(v => v.classList.add('hidden'));
    document.getElementById(`view-rider-${tabId}`).classList.remove('hidden');
}

function renderAvailableOrders() {
    const list = document.getElementById('riderAvailableList');
    if(!list) return;

    // Available = Ready for pickup
    const available = orders.filter(o => o.status === 'ready');
    
    list.innerHTML = available.length === 0 ? `<div class="text-center py-20 text-gray-400"><i data-lucide="map-pin-off" class="w-12 h-12 mx-auto mb-4 opacity-50"></i><p>No orders ready for pickup.</p></div>` : 
    available.map(o => `
    <div class="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 mb-4 animate-[slideIn_0.3s]">
        <div class="flex justify-between items-start mb-4">
            <div>
                <h4 class="font-bold text-dark text-lg">Pickup Order #${o.id}</h4>
                <p class="text-gray-500 text-xs">2.4 km • 5 mins away</p>
            </div>
            <span class="bg-green-100 text-green-700 font-bold text-xs px-2 py-1 rounded-md">Ready</span>
        </div>
        <div class="bg-gray-50 p-4 rounded-xl mb-4">
            <div class="flex items-center gap-3 mb-2">
                 <div class="w-2 h-2 bg-dark rounded-full"></div>
                 <p class="text-sm font-bold text-dark">Gourmet Bites HQ</p>
            </div>
            <div class="h-4 border-l border-dashed border-gray-300 ml-[3px] my-1"></div>
            <div class="flex items-center gap-3">
                 <div class="w-2 h-2 bg-primary rounded-full"></div>
                 <p class="text-sm font-bold text-dark">${o.customer}</p>
            </div>
            <p class="text-xs text-gray-400 mt-2 ml-5">${o.items}</p>
        </div>
        <div class="flex justify-between items-center">
            <h3 class="font-bold text-xl text-dark">$8.50 <span class="text-xs font-normal text-gray-400">Earnings</span></h3>
            <button onclick="acceptDelivery(${o.id})" class="bg-dark text-white px-6 py-3 rounded-xl font-bold hover:bg-black shadow-lg transition-all">Accept</button>
        </div>
    </div>
    `).join('');
    lucide.createIcons();
}

function renderMyDeliveries() {
    const list = document.getElementById('riderMyList');
    if(!list) return;

    const myOrders = orders.filter(o => o.status === 'picked_up');
    
    list.innerHTML = myOrders.length === 0 ? `<div class="text-center py-20 text-gray-400"><p>No active deliveries.</p></div>` : 
    myOrders.map(o => `
    <div class="bg-dark text-white p-6 rounded-3xl shadow-xl mb-4 relative overflow-hidden animate-[slideIn_0.3s]">
        <div class="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10"></div>
        
        <div class="relative z-10">
            <div class="flex justify-between items-center mb-6">
                <span class="bg-white/20 px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm">In Transit</span>
                <span class="font-bold text-lg">Order #${o.id}</span>
            </div>

            <h3 class="text-2xl font-bold mb-1">${o.customer}</h3>
            <p class="text-gray-400 text-sm mb-6">Navigating to destination...</p>

            <button onclick="completeDelivery(${o.id})" class="w-full bg-primary text-white py-4 rounded-xl font-bold shadow-lg hover:bg-red-500 transition-all flex items-center justify-center gap-2">
                <i data-lucide="check-circle" class="w-5 h-5"></i> Complete Delivery
            </button>
        </div>
    </div>
    `).join('');
    lucide.createIcons();
}

function acceptDelivery(id) {
    const order = orders.find(o => o.id === id);
    if(order) {
        order.status = 'picked_up';
        saveOrders();
        refreshAllData();
        switchRiderTab('active');
    }
}

function completeDelivery(id) {
    const order = orders.find(o => o.id === id);
    if(order) {
        order.status = 'delivered';
        saveOrders();
        refreshAllData();
        // Optional: Show success feedback
    }
}

function toggleBottomProfile() {
    const sheet = document.getElementById('bottomProfileSheet');
    if (sheet.classList.contains('translate-y-full')) {
        sheet.classList.remove('hidden');
        setTimeout(() => sheet.classList.remove('translate-y-full'), 10);
    } else {
        sheet.classList.add('translate-y-full');
        setTimeout(() => sheet.classList.add('hidden'), 300);
    }
}