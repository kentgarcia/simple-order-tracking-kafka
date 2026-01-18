document.addEventListener('DOMContentLoaded', () => {
    refreshAllData();
    lucide.createIcons();
    
    // Default Tab
    switchResTab('incoming');
});

// Hook for shared.js
function refreshAllData() {
    renderIncoming();
    renderKitchen();
    renderRestaurantHistory();
}

function switchResTab(tabId) {
    // Buttons
    document.querySelectorAll('.res-tab-btn').forEach(btn => {
        btn.classList.remove('bg-dark', 'text-white', 'shadow-md');
        btn.classList.add('bg-white', 'text-gray-500', 'border-gray-200');
    });
    const activeBtn = document.getElementById(`btn-${tabId}`);
    if(activeBtn) {
        activeBtn.classList.add('bg-dark', 'text-white', 'shadow-md');
        activeBtn.classList.remove('bg-white', 'text-gray-500', 'border-gray-200');
    }

    // Views
    document.querySelectorAll('.res-view').forEach(v => v.classList.add('hidden'));
    document.getElementById(`view-res-${tabId}`).classList.remove('hidden');
}


function renderIncoming() {
    const list = document.getElementById('resIncomingList');
    if(!list) return;

    const incoming = orders.filter(o => o.status === 'pending');
    list.innerHTML = incoming.length === 0 ? `<div class="text-center py-20 text-gray-400"><i data-lucide="bell-off" class="w-12 h-12 mx-auto mb-4 opacity-50"></i><p>No incoming orders.</p></div>` : 
    incoming.map(o => `
    <div class="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-6 animate-[slideIn_0.3s]">
        <div class="flex-1">
            <div class="flex justify-between items-start mb-2">
                <h4 class="font-bold text-dark text-lg">Order #${o.id}</h4>
                <span class="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-md">New</span>
            </div>
            <p class="text-gray-500 text-sm mb-4"><span class="font-bold text-dark">${o.customer}</span> • ${o.items}</p>
            <div class="flex gap-2">
                <button onclick="updateStatus(${o.id}, 'preparing')" class="flex-1 bg-dark text-white py-3 rounded-xl font-bold shadow-lg hover:bg-black transition-all">Accept & Cook</button>
                <button onclick="updateStatus(${o.id}, 'declined')" class="px-4 py-3 rounded-xl font-bold text-gray-500 border border-gray-200 hover:bg-gray-50">Decline</button>
            </div>
        </div>
    </div>
    `).join('');
    lucide.createIcons();
}

function renderKitchen() {
    const list = document.getElementById('resKitchenList');
    if(!list) return;

    const cooking = orders.filter(o => o.status === 'preparing');
    list.innerHTML = cooking.length === 0 ? `<div class="text-center py-20 text-gray-400"><i data-lucide="chef-hat" class="w-12 h-12 mx-auto mb-4 opacity-50"></i><p>Kitchen is quiet.</p></div>` : 
    cooking.map(o => `
    <div class="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col gap-4 animate-[slideIn_0.3s] border-l-4 border-l-yellow-400">
        <div class="flex justify-between items-center">
            <h4 class="font-bold text-dark">Order #${o.id}</h4>
            <span class="bg-yellow-100 text-yellow-700 font-bold text-xs px-2 py-1 rounded-md animate-pulse">Cooking</span>
        </div>
        <div class="p-3 bg-gray-50 rounded-xl">
             <p class="text-sm font-medium text-dark">${o.items}</p>
        </div>
        <button onclick="updateStatus(${o.id}, 'ready')" class="w-full bg-primary text-white py-3 rounded-xl font-bold shadow-soft hover:shadow-lg transition-all">Mark Ready</button>
    </div>
    `).join('');
}

function renderRestaurantHistory() {
    const list = document.getElementById('resHistoryList');
    if(!list) return;

    // Show ready, passed, delivered
    const history = orders.filter(o => ['ready', 'picked_up', 'delivered', 'declined'].includes(o.status));
    list.innerHTML = history.length === 0 ? `<p class="text-center text-gray-400 py-10">No order history.</p>` :
    history.map(o => `
    <div class="flex justify-between items-center p-4 bg-white rounded-2xl border border-gray-100 opacity-80 hover:opacity-100 transition-opacity">
        <div>
            <h4 class="font-bold text-sm text-dark">#${o.id} - ${o.customer}</h4>
            <span class="text-xs ${o.status === 'ready' ? 'text-green-600 font-bold' : 'text-gray-400'}">${o.status.toUpperCase()}</span>
        </div>
        <span class="text-sm font-bold text-dark">$${o.total.toFixed(2)}</span>
    </div>
    `).join('');
}

function updateStatus(id, newStatus) {
    const order = orders.find(o => o.id === id);
    if(order) {
        order.status = newStatus;
        saveOrders(); // Broadcast
        refreshAllData();
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