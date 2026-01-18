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
    const btns = document.querySelectorAll('.rider-tab-btn');
    btns.forEach(btn => {
        btn.classList.remove('bg-white', 'text-primary', 'shadow-lg');
        btn.classList.add('text-white/80', 'hover:text-white');
    });
    
    const activeBtn = document.getElementById(`btn-rider-${tabId}`);
    activeBtn.classList.remove('text-white/80', 'hover:text-white');
    activeBtn.classList.add('bg-white', 'text-primary', 'shadow-lg');

    document.querySelectorAll('.rider-view').forEach(v => v.classList.add('hidden'));
    document.getElementById(`view-rider-${tabId}`).classList.remove('hidden');
}

function renderAvailableOrders() {
    const list = document.getElementById('riderAvailableList');
    if(!list) return;

    const available = orders.filter(o => o.status === 'ready');
    
    list.innerHTML = available.length === 0 ? `
        <div class="text-center py-20 animate-float opacity-50">
            <div class="w-24 h-24 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <i data-lucide="map" class="w-10 h-10 text-primary"></i>
            </div>
            <p class="font-bold text-gray-500 text-lg">No orders nearby</p>
            <p class="text-xs text-gray-400">Relax, we'll notify you.</p>
        </div>` : 
    available.map(o => `
    <div class="bg-white rounded-[2rem] shadow-soft mb-6 overflow-hidden animate-[slideIn_0.4s] border border-gray-100 group">
        <!-- Clean Gradient Header instead of Map Image -->
        <div class="h-24 w-full bg-gradient-to-r from-pink-500 to-pink-600 relative overflow-hidden flex items-end p-6">
             <div class="absolute top-0 left-0 w-full h-full opacity-10" style="background-image: radial-gradient(#fff 1px, transparent 1px); background-size: 10px 10px;"></div>
             <div class="flex items-center gap-2 text-white relative z-10">
                <span class="bg-white/20 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1">
                    <i data-lucide="navigation-2" class="w-3 h-3"></i> 2.4 km
                </span>
                <span class="bg-white/20 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">~15 min</span>
             </div>
        </div>

        <div class="p-6 pt-4 relative">
            <div class="flex justify-between items-start mb-6">
                <div>
                    <h4 class="font-extrabold text-2xl text-dark">Order #${o.id}</h4>
                    <p class="text-gray-400 text-xs font-bold uppercase tracking-wider">Pickup Request</p>
                </div>
                <div class="text-right">
                     <h3 class="font-black text-2xl text-primary">$8.50</h3>
                     <p class="text-xs text-gray-400 font-bold">Includ. Tips</p>
                </div>
            </div>

            <!-- Route visual -->
            <div class="relative pl-4 border-l-2 border-gray-100 space-y-6 mb-8">
                 <div class="relative">
                     <div class="absolute -left-[21px] top-1 w-4 h-4 bg-primary rounded-full border-4 border-white shadow-sm ring-1 ring-gray-100"></div>
                     <h5 class="text-sm font-bold text-dark">Gourmet Bites HQ</h5>
                     <p class="text-xs text-gray-400">123 Food Street, Downtown</p>
                 </div>
                 <div class="relative">
                     <div class="absolute -left-[21px] top-1 w-4 h-4 bg-dark rounded-full border-4 border-white shadow-sm ring-1 ring-gray-100"></div>
                     <h5 class="text-sm font-bold text-dark">${o.customer}</h5>
                     <p class="text-xs text-gray-400 truncate max-w-[200px]">${o.items}</p>
                 </div>
            </div>

            <button onclick="acceptDelivery(${o.id})" class="w-full bg-dark text-white py-4 rounded-xl font-bold shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all flex items-center justify-center gap-3 active:scale-95">
                <span>Accept Delivery</span>
                <i data-lucide="chevron-right" class="w-5 h-5 bg-white/20 rounded-full p-0.5"></i>
            </button>
        </div>
    </div>
    `).join('');
    lucide.createIcons();
}

function renderMyDeliveries() {
    const list = document.getElementById('riderMyList');
    if(!list) return;

    const myOrders = orders.filter(o => o.status === 'picked_up');
    
    list.innerHTML = myOrders.length === 0 ? `
        <div class="text-center py-20 opacity-60">
            <div class="w-32 h-32 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                 <i data-lucide="bike" class="w-16 h-16 text-gray-300"></i>
            </div>
            <p class="text-gray-400 font-medium">You are currently offline.</p>
        </div>` : 
    myOrders.map(o => `
    <div class="relative w-full h-[60vh] bg-dark rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white flex flex-col justify-end">
        <!-- Abstract Dark Background -->
        <div class="absolute inset-0 bg-dark">
            <div class="absolute inset-0 opacity-10" style="background-image: radial-gradient(#333 1px, transparent 1px); background-size: 20px 20px;"></div>
            <div class="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/20 rounded-full blur-3xl"></div>
        </div>

        <!-- Top Status -->
        <div class="absolute top-6 left-6 right-6 flex justify-between items-start z-10">
            <div class="bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/10">
                <span class="text-xs font-bold text-white/50 block mb-1">NAVIGATING TO</span>
                <h4 class="font-bold text-white flex items-center gap-2 text-lg"><i data-lucide="user" class="w-4 h-4 text-primary"></i> ${o.customer}</h4>
            </div>
            <div class="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center shadow-lg animate-pulse">
                <i data-lucide="navigation" class="w-6 h-6 fill-current"></i>
            </div>
        </div>

        <!-- Animation Center -->
        <div class="absolute inset-0 flex items-center justify-center z-0 opacity-20 pointer-events-none">
             <div class="w-48 h-48 border border-white rounded-full animate-[ping_3s_linear_infinite]"></div>
             <div class="w-32 h-32 border border-white rounded-full animate-[ping_3s_linear_infinite_1s] absolute"></div>
        </div>

        <!-- Bottom Action Card -->
        <div class="relative z-10 p-6 pb-8 bg-white rounded-t-[2.5rem] animate-[slideIn_0.5s]">
            <div class="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6"></div>
            
            <div class="flex items-center gap-4 mb-8">
                 <div class="w-14 h-14 rounded-2xl bg-pink-50 text-primary flex items-center justify-center font-bold text-2xl border border-pink-100">
                    12
                 </div>
                 <div>
                     <p class="text-xs font-bold text-gray-400 uppercase">Estimated Arrival</p>
                     <h2 class="text-3xl font-black text-dark">15 min</h2>
                 </div>
            </div>

            <div class="bg-gray-50 p-4 rounded-xl border border-gray-100 mb-6">
                <p class="text-xs text-gray-500 font-medium leading-relaxed">
                    <span class="font-bold text-dark">Details:</span> ${o.items}
                </p>
            </div>

            <button onclick="completeDelivery(${o.id})" class="w-full bg-primary text-white py-5 rounded-2xl font-bold text-lg shadow-[0_10px_30px_-5px_rgba(255,0,102,0.4)] hover:shadow-primary/50 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 group relative overflow-hidden">
                <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                <i data-lucide="check-circle-2" class="w-6 h-6"></i>
                Drop-off Complete
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