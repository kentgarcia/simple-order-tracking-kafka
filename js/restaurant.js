document.addEventListener('DOMContentLoaded', () => {
    refreshAllData();
    lucide.createIcons();
    switchResTab('incoming');
});

// Hook for shared.js
function refreshAllData() {
    renderIncoming();
    renderKitchen();
    renderRestaurantHistory();
}

function switchResTab(tabId) {
    document.querySelectorAll('.res-tab-btn').forEach(btn => {
        btn.classList.remove('bg-dark', 'text-white', 'shadow-md');
        btn.classList.add('bg-white', 'text-gray-500', 'border-gray-200');
    });
    const activeBtn = document.getElementById(`btn-${tabId}`);
    if(activeBtn) {
        activeBtn.classList.add('bg-dark', 'text-white', 'shadow-md');
        activeBtn.classList.remove('bg-white', 'text-gray-500', 'border-gray-200');
    }
    document.querySelectorAll('.res-view').forEach(v => v.classList.add('hidden'));
    document.getElementById(`view-res-${tabId}`).classList.remove('hidden');
}


function renderIncoming() {
    const list = document.getElementById('resIncomingList');
    if(!list) return;

    const incoming = orders.filter(o => o.status === 'pending');
    list.innerHTML = incoming.length === 0 ? `<div class="text-center py-20 text-gray-400"><i data-lucide="bell-off" class="w-12 h-12 mx-auto mb-4 opacity-50"></i><p>No incoming orders.</p></div>` : 
    incoming.map(o => {
        const firstItemName = o.items.split(',')[0].replace(/^\d+x\s*/, '').trim();
        const food = foodItems.find(f => f.name === firstItemName);
        const image = food ? food.image : 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'; // Fallback

        return `
    <div class="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden animate-[slideIn_0.3s] max-w-2xl mx-auto relative group hover:shadow-lg transition-all">
        <div class="flex flex-col md:flex-row">
            <div class="w-full md:w-1/3 h-48 md:h-auto overflow-hidden relative">
                <img src="${image}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700">
                <div class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent md:bg-gradient-to-r"></div>
                <div class="absolute bottom-4 left-4 text-white font-bold md:hidden">#${o.id}</div> 
            </div>
            
            <div class="p-8 flex-1">
                <div class="flex justify-between items-start mb-4">
                     <div>
                        <h4 class="text-2xl font-bold text-dark mb-1 hidden md:block">Order #${o.id}</h4>
                        <p class="text-gray-400 text-sm font-medium flex items-center gap-2"><i data-lucide="clock" class="w-4 h-4"></i> ${o.time}</p>
                     </div>
                     <div class="bg-primary/10 text-primary px-3 py-1 rounded-lg font-bold text-xs animate-pulse">New Order</div>
                </div>
                
                <div class="flex items-center gap-3 mb-6">
                    <div class="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-dark font-bold text-sm border border-gray-200">${o.customer.charAt(0)}</div>
                    <div><h5 class="font-bold text-dark text-sm">${o.customer}</h5></div>
                </div>

                <div class="mb-6 bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <ul class="space-y-2">
                        ${o.items.split(', ').map(item => `
                            <li class="flex items-start gap-2 text-sm text-dark font-medium leading-tight">
                                <i data-lucide="chevron-right" class="w-4 h-4 text-gray-400 mt-0.5"></i>
                                <span>${item}</span>
                            </li>
                        `).join('')}
                    </ul>
                </div>

                <div class="flex items-center justify-between pt-4 border-t border-gray-100 mb-6">
                    <span class="text-gray-400 text-xs font-bold uppercase">Total</span>
                    <span class="text-xl font-bold text-dark">$${o.total.toFixed(2)}</span>
                </div>

                <div class="flex gap-3">
                    <button onclick="updateStatus(${o.id}, 'declined')" class="px-5 py-3 rounded-xl font-bold text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all border border-gray-200 hover:border-red-100 text-sm">Decline</button>
                    <button onclick="updateStatus(${o.id}, 'preparing')" class="flex-1 bg-dark text-white py-3 rounded-xl font-bold shadow-lg hover:bg-black hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-sm">
                        Accept & Cook
                    </button>
                </div>
            </div>
        </div>
    </div>
    `}).join('');
    lucide.createIcons();
}

function renderKitchen() {
    const list = document.getElementById('resKitchenList');
    if(!list) return;

    const cooking = orders.filter(o => o.status === 'preparing');
    list.innerHTML = cooking.length === 0 ? `<div class="text-center py-20 text-gray-400 col-span-full"><i data-lucide="chef-hat" class="w-12 h-12 mx-auto mb-4 opacity-50"></i><p>Kitchen is quiet.</p></div>` : 
    cooking.map(o => `
    <div id="kitchen-card-${o.id}" class="bg-white p-0 shadow-lg flex flex-col animate-[slideIn_0.3s] relative h-full font-mono transform rotate-0 hover:rotate-1 transition-transform duration-300" style="filter: drop-shadow(0 4px 6px rgba(0,0,0,0.1));">
        <!-- Hole Punch -->
        <div class="w-4 h-4 bg-gray-50 rounded-full absolute -top-2 left-1/2 transform -translate-x-1/2 shadow-inner border border-gray-200 z-10"></div>
        
        <div class="p-6 pb-4 border-b-2 border-dashed border-gray-300 relative">
             <div class="flex justify-between items-start mb-4">
                <div>
                     <span class="block text-xs font-bold text-gray-400 mb-1">TABLE / ORDER</span>
                     <h4 class="text-4xl font-black text-dark">#${o.id}</h4>
                </div>
                <div class="text-right">
                     <span class="block text-xs font-bold text-gray-400 mb-1">TIME</span>
                     <span class="text-lg font-bold text-dark">${o.time}</span>
                </div>
             </div>
             <div class="w-full h-px bg-dark my-2"></div>
             <div class="flex justify-between items-center">
                 <span class="text-xs font-bold uppercase">Customer</span>
                 <span class="font-bold truncate max-w-[150px]">${o.customer}</span>
             </div>
        </div>
        
        <div class="p-6 flex-1 bg-white relative">
             <ul class="space-y-4">
                 ${o.items.split(', ').map(item => `
                    <li class="text-lg font-bold text-dark leading-snug flex items-start gap-2">
                        <span class="w-4 h-4 border-2 border-dark rounded-sm mt-1 flex-shrink-0"></span>
                        ${item}
                    </li>
                `).join('')}
             </ul>
             
             <!-- Special Instructions Demo -->
             <div class="mt-6 pt-4 border-t-2 border-dotted border-gray-300">
                <p class="text-xs font-bold text-gray-400 uppercase mb-1">Notes</p>
                <p class="text-sm font-bold text-red-600 italic">"Extra spicy!"</p>
             </div>
             
             <!-- Stamp element (hidden by default) -->
            <div id="stamp-${o.id}" class="absolute inset-0 flex items-center justify-center opacity-0 pointer-events-none hidden">
                <div class="border-[6px] border-green-600 text-green-600 font-black text-5xl px-4 py-2 rounded-lg uppercase tracking-widest opacity-80" style="transform: rotate(-15deg);">READY</div>
            </div>
        </div>

        <div class="p-4 bg-gray-50 border-t-2 border-dashed border-gray-300">
            <button onclick="markReadyWithAnimation(${o.id})" class="w-full bg-dark text-white py-4 font-bold shadow-lg hover:bg-black transition-all uppercase tracking-wider text-sm flex items-center justify-center gap-2">
                Serve Order
            </button>
        </div>
    </div>
    `).join('');
    lucide.createIcons();
}

function markReadyWithAnimation(id) {
    const stamp = document.getElementById(`stamp-${id}`);
    if(stamp) {
        stamp.classList.remove('hidden');
        stamp.classList.add('stamp-animate'); // Trigger CSS animation
        
        // Wait for animation, then update
        setTimeout(() => {
            updateStatus(id, 'ready');
        }, 800);
    } else {
        updateStatus(id, 'ready');
    }
}

function renderRestaurantHistory() {
    const list = document.getElementById('resHistoryList');
    if(!list) return;

    const history = orders.filter(o => ['ready', 'picked_up', 'delivered', 'declined'].includes(o.status));
    list.innerHTML = history.length === 0 ? `<p class="text-center text-gray-400 py-10">No order history.</p>` :
    history.map(o => `
    <button onclick="openResOrderDetails(${o.id})" class="w-full bg-white p-5 rounded-2xl border border-gray-100 flex justify-between items-center hover:shadow-md hover:border-primary/20 transition-all text-left group">
        <div class="flex items-center gap-4">
             <div class="w-12 h-12 rounded-full ${o.status === 'delivered' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'} flex items-center justify-center font-bold text-lg group-hover:scale-110 transition-transform">
                ${o.status === 'delivered' ? '<i data-lucide="check" class="w-6 h-6"></i>' : '#'}
             </div>
             <div>
                <h4 class="font-bold text-dark group-hover:text-primary transition-colors">Order #${o.id}</h4>
                <p class="text-sm text-gray-400">${o.customer} • ${o.items.length > 30 ? o.items.substring(0, 30) + '...' : o.items}</p>
             </div>
        </div>
        <div class="flex flex-col items-end gap-1">
             <span class="font-bold text-dark">$${o.total.toFixed(2)}</span>
             <span class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-gray-100 text-gray-500">
                ${o.status.replace('_', ' ')}
             </span>
        </div>
    </button>
    `).join('');
    lucide.createIcons();
}

function updateStatus(id, newStatus) {
    const order = orders.find(o => o.id === id);
    if(order) {
        order.status = newStatus;
        saveOrders(); // Broadcast
        refreshAllData();
    }
}

// --- Modal Logic --
function openResOrderDetails(id) {
    const order = orders.find(o => o.id === id);
    if(!order) return;
    
    document.getElementById('resModalOrderId').innerText = `Order #${order.id}`;
    document.getElementById('resModalCustomer').innerText = order.customer;
    document.getElementById('resModalAvatar').innerText = order.customer.charAt(0);
    
    // Parse items into a nice list
    document.getElementById('resModalItems').innerHTML = order.items.split(', ').map(i => 
        `<div class="flex items-center gap-2"><div class="w-1.5 h-1.5 bg-gray-300 rounded-full"></div><span>${i}</span></div>`
    ).join('');
    
    document.getElementById('resModalTime').innerText = order.time;
    document.getElementById('resModalTotal').innerText = `$${order.total.toFixed(2)}`;
    
    const statusEl = document.getElementById('resModalStatus');
    statusEl.innerText = `Status: ${order.status.toUpperCase().replace('_', ' ')}`;
    
    // Status styling
    let statusClass = 'bg-gray-100 text-gray-500';
    if(order.status === 'delivered') statusClass = 'bg-green-100 text-green-700';
    else if(order.status === 'declined') statusClass = 'bg-red-100 text-red-700';
    else if(order.status === 'ready') statusClass = 'bg-blue-100 text-blue-700';
    
    statusEl.className = `p-4 rounded-xl text-center font-bold text-sm ${statusClass}`;

    openResModal();
}

function openResModal() {
    const modal = document.getElementById('resOrderDetailsModal');
    const content = document.getElementById('resDetailsModalContent');
    const backdrop = document.getElementById('resDetailsModalBackdrop');
    
    modal.classList.remove('hidden');
    setTimeout(() => {
        backdrop.classList.remove('opacity-0');
        content.classList.remove('opacity-0', 'scale-95');
        content.classList.add('scale-100');
    }, 10);
}

function closeResModal() {
    const modal = document.getElementById('resOrderDetailsModal');
    const content = document.getElementById('resDetailsModalContent');
    const backdrop = document.getElementById('resDetailsModalBackdrop');
    
    backdrop.classList.add('opacity-0');
    content.classList.remove('scale-100');
    content.classList.add('opacity-0', 'scale-95');
    
    setTimeout(() => modal.classList.add('hidden'), 300);
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