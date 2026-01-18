// --- Data Models ---
const categories = [
    { id: 'all', name: 'All', icon: 'utensils' },
    { id: 'burger', name: 'Burger', icon: 'sandwich' },
    { id: 'pizza', name: 'Pizza', icon: 'pizza' },
    { id: 'asian', name: 'Asian', icon: 'soup' },
    { id: 'drinks', name: 'Drinks', icon: 'coffee' },
    { id: 'dessert', name: 'Dessert', icon: 'ice-cream' },
];

const foodItems = [
    { id: 1, name: 'Double Cheeseburger', category: 'burger', price: 12.99, rating: 4.8, time: '20m', calories: '450', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', desc: 'Two beef patties, cheddar cheese, lettuce, tomato.' },
    { id: 2, name: 'Spicy Pepperoni Pizza', category: 'pizza', price: 15.49, rating: 4.9, time: '30m', calories: '800', image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', desc: 'Classic pepperoni with chili flakes and mozzarella.' },
    { id: 3, name: 'Chicken Ramen Bowl', category: 'asian', price: 14.00, rating: 4.7, time: '25m', calories: '380', image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', desc: 'Rich broth, tender chicken, egg, and green onions.' },
    { id: 6, name: 'Margherita Pizza', category: 'pizza', price: 11.99, rating: 4.7, time: '30m', calories: '600', image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', desc: 'Fresh basil, tomato sauce, and mozzarella cheese.' },
    { id: 7, name: 'Salmon Poke Bowl', category: 'asian', price: 16.99, rating: 4.9, time: '20 min', calories: '420 kcal', image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', desc: 'Fresh salmon, avocado, edamame, and rice.'},
    { id: 8, name: 'Chocolate Lava Cake', category: 'dessert', price: 8.99, rating: 5.0, time: '15 min', calories: '450 kcal', image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', desc: 'Warm chocolate cake with a molten center.'},
    { id: 4, name: 'Fresh Berry Smoothie', category: 'drinks', price: 6.50, rating: 4.6, time: '10 min', calories: '120 kcal', image: 'https://images.unsplash.com/photo-1505252585461-04db1eb84625?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', desc: 'Mixed berries, yogurt, and a hint of honey.'},
    { id: 5, name: 'Mushroom Swiss Burger', category: 'burger', price: 13.49, rating: 4.5, time: '25 min', calories: '520 kcal', image: 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', desc: 'Sautéed mushrooms, swiss cheese, caramelized onions.'}
];

const defaultOrders = [
    { id: 101, customer: 'Alex Johnson', items: '2x Double Cheeseburger', total: 25.98, status: 'pending', time: 'Just now' },
    { id: 102, customer: 'Sarah Smith', items: '1x Margherita Pizza', total: 11.99, status: 'preparing', time: '10m ago' },
    { id: 103, customer: 'Mike Ross', items: '3x Chicken Ramen', total: 42.00, status: 'ready', time: '15m ago' },
    { id: 104, customer: 'Jane Doe', items: '1x Spicy Pepperoni', total: 15.49, status: 'delivered', time: 'Yesterday' }
];

// ═══════════════════════════════════════════════════════════════════════════════
// ███  REAL KAFKA INTEGRATION  ███
// Connects to actual Apache Kafka via WebSocket backend
// ═══════════════════════════════════════════════════════════════════════════════

const KafkaClient = {
    // Configuration
    WS_URL: 'ws://localhost:3001',
    TOPICS: {
        ORDERS: 'gourmet-orders',
        STATUS: 'order-status',
        NOTIFICATIONS: 'notifications'
    },
    
    // State
    ws: null,
    isConnected: false,
    reconnectAttempts: 0,
    maxReconnectAttempts: 10,
    messageLog: [],
    broker: 'localhost:9092',
    
    // Get current service name
    getServiceName() {
        const path = window.location.pathname;
        if (path.includes('customer')) return 'Customer-Service';
        if (path.includes('restaurant')) return 'Restaurant-Service';
        if (path.includes('rider')) return 'Rider-Service';
        return 'Unknown-Service';
    },
    
    // Connect to WebSocket server
    connect() {
        try {
            this.ws = new WebSocket(this.WS_URL);
            
            this.ws.onopen = () => {
                console.log('%c[KAFKA] Connected to backend', 'color: #22c55e; font-weight: bold;');
                this.isConnected = true;
                this.reconnectAttempts = 0;
                this.updateConnectionStatus(true);
            };
            
            this.ws.onmessage = (event) => {
                const data = JSON.parse(event.data);
                this.handleMessage(data);
            };
            
            this.ws.onclose = () => {
                console.log('%c[KAFKA] Disconnected', 'color: #ef4444; font-weight: bold;');
                this.isConnected = false;
                this.updateConnectionStatus(false);
                this.attemptReconnect();
            };
            
            this.ws.onerror = (err) => {
                console.log('%c[KAFKA] Connection error - is the server running?', 'color: #f59e0b;');
                this.updateConnectionStatus(false, 'Server offline');
            };
        } catch (err) {
            console.error('WebSocket error:', err);
        }
    },
    
    attemptReconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`[KAFKA] Reconnecting... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
            setTimeout(() => this.connect(), 2000);
        }
    },
    
    // Handle incoming messages
    handleMessage(data) {
        switch(data.type) {
            case 'CONNECTED':
                this.broker = data.broker;
                console.log(`%c[KAFKA] Broker: ${data.broker}`, 'color: #a855f7;');
                console.log(`%c[KAFKA] Topics: ${data.topics.join(', ')}`, 'color: #a855f7;');
                break;
                
            case 'HISTORY':
                this.messageLog = data.messages;
                this.renderMessageLog();
                break;
                
            case 'KAFKA_MESSAGE':
                // Don't process our own messages
                if (data.message.producer === this.getServiceName()) return;
                
                this.messageLog.unshift({ ...data.message, direction: data.direction });
                if (this.messageLog.length > 50) this.messageLog.pop();
                this.renderMessageLog();
                
                // Update app state
                if (data.message.payload && data.direction === 'consumed') {
                    const oldOrders = [...orders];
                    orders = data.message.payload;
                    localStorage.setItem('gourmet_orders', JSON.stringify(orders));
                    
                    if (typeof checkDeliveryStatus === 'function') {
                        checkDeliveryStatus(oldOrders, orders);
                    }
                    if (typeof refreshAllData === 'function') {
                        refreshAllData();
                    }
                }
                break;
        }
    },
    
    // PRODUCER: Send message to Kafka
    produce(topic, payload, action = 'UPDATE') {
        const message = {
            type: 'PRODUCE',
            topic: topic,
            action: action,
            producer: this.getServiceName(),
            payload: payload
        };
        
        if (this.ws && this.isConnected) {
            this.ws.send(JSON.stringify(message));
            console.log(`%c[KAFKA PRODUCER] ${this.getServiceName()} → ${topic}`, 'color: #22c55e; font-weight: bold;', action);
            
            // Optimistically add to local log
            const logEntry = {
                id: `msg-${Date.now()}`,
                topic,
                action,
                producer: this.getServiceName(),
                timestamp: new Date().toISOString(),
                direction: 'produced'
            };
            this.messageLog.unshift(logEntry);
            this.renderMessageLog();
        } else {
            console.log('%c[KAFKA] Not connected - using local storage fallback', 'color: #f59e0b;');
            // Fallback to localStorage
            localStorage.setItem('gourmet_orders', JSON.stringify(payload));
        }
    },
    
    // Update connection indicator
    updateConnectionStatus(connected, message = '') {
        const indicator = document.getElementById('kafka-status-indicator');
        const statusText = document.getElementById('kafka-status-text');
        if (indicator) {
            indicator.className = `w-3 h-3 rounded-full ${connected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`;
        }
        if (statusText) {
            statusText.textContent = message || (connected ? 'Connected to Kafka' : 'Disconnected');
        }
    },
    
    // Render message log in UI
    renderMessageLog() {
        const container = document.getElementById('kafka-log-container');
        if (!container) return;
        
        container.innerHTML = this.messageLog.slice(0, 15).map(msg => `
            <div class="p-2 rounded-lg text-xs font-mono animate-[slideIn_0.3s] ${msg.direction === 'produced' ? 'bg-green-500/20 border-l-2 border-green-500' : 'bg-blue-500/20 border-l-2 border-blue-500'}">
                <div class="flex justify-between items-center mb-1">
                    <span class="font-bold ${msg.direction === 'produced' ? 'text-green-400' : 'text-blue-400'}">${msg.direction === 'produced' ? '📤 PRODUCE' : '📥 CONSUME'}</span>
                    <span class="text-gray-500 text-[10px]">${new Date(msg.timestamp).toLocaleTimeString()}</span>
                </div>
                <div class="text-gray-300"><span class="text-gray-500">Topic:</span> ${msg.topic}</div>
                <div class="text-gray-300"><span class="text-gray-500">Action:</span> ${msg.action}</div>
                <div class="text-gray-300 truncate"><span class="text-gray-500">From:</span> ${msg.producer}</div>
            </div>
        `).join('') || '<p class="text-gray-600 text-center text-xs py-4">Waiting for messages...</p>';
    },
    
    // Initialize the monitor UI
    initMonitor() {
        // Create floating button
        const btn = document.createElement('button');
        btn.id = 'kafka-monitor-btn';
        btn.className = 'fixed bottom-4 right-4 z-[100] bg-gray-900 text-white p-3 rounded-full shadow-lg hover:bg-gray-800 transition-all hover:scale-110 group';
        btn.innerHTML = `
            <div class="absolute -top-1 -right-1 w-4 h-4 rounded-full ${this.isConnected ? 'bg-green-500' : 'bg-red-500'} border-2 border-gray-900" id="kafka-btn-indicator"></div>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20v-6M6 20V10M18 20V4"/></svg>
        `;
        btn.onclick = () => this.toggleMonitor();
        document.body.appendChild(btn);
        
        // Create monitor panel
        const panel = document.createElement('div');
        panel.id = 'kafka-monitor-panel';
        panel.className = 'fixed bottom-20 right-4 z-[100] w-80 bg-gray-900 text-white rounded-2xl shadow-2xl overflow-hidden hidden border border-gray-700';
        panel.innerHTML = `
            <div class="bg-gray-800 p-4 border-b border-gray-700">
                <div class="flex items-center justify-between mb-2">
                    <div class="flex items-center gap-2">
                        <div id="kafka-status-indicator" class="w-3 h-3 bg-red-500 rounded-full"></div>
                        <h3 class="font-bold text-sm">Apache Kafka</h3>
                    </div>
                    <span class="text-[10px] bg-green-500/20 text-green-400 px-2 py-1 rounded-full font-bold">REAL</span>
                </div>
                <p id="kafka-status-text" class="text-[10px] text-gray-500">Connecting...</p>
                <p class="text-[10px] text-gray-500">Service: <span class="text-white">${this.getServiceName()}</span></p>
            </div>
            <div class="p-3 bg-gray-800/50 border-b border-gray-700">
                <p class="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-2">Topics</p>
                <div class="flex flex-wrap gap-1">
                    <span class="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full">${this.TOPICS.ORDERS}</span>
                    <span class="text-[10px] bg-yellow-500/20 text-yellow-300 px-2 py-0.5 rounded-full">${this.TOPICS.STATUS}</span>
                    <span class="text-[10px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-full">${this.TOPICS.NOTIFICATIONS}</span>
                </div>
            </div>
            <div class="p-3">
                <p class="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-2">Live Message Stream</p>
                <div id="kafka-log-container" class="space-y-2 max-h-60 overflow-y-auto pr-1">
                    <p class="text-gray-600 text-center text-xs py-4">Connecting to Kafka...</p>
                </div>
            </div>
            <div class="p-3 bg-gray-800/50 border-t border-gray-700">
                <p class="text-[10px] text-gray-500">Broker: <span class="text-gray-300">${this.broker}</span></p>
            </div>
        `;
        document.body.appendChild(panel);
    },
    
    toggleMonitor() {
        const panel = document.getElementById('kafka-monitor-panel');
        if (panel) panel.classList.toggle('hidden');
    }
};

// ═══════════════════════════════════════════════════════════════════════════════
// ███  APPLICATION STATE & SYNC  ███
// ═══════════════════════════════════════════════════════════════════════════════

// Load from LocalStorage or use defaults
let orders = JSON.parse(localStorage.getItem('gourmet_orders')) || defaultOrders;

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    KafkaClient.initMonitor();
    KafkaClient.connect();
});

// PRODUCER: Save orders and publish to Kafka
function saveOrders(action = 'ORDER_UPDATE') {
    localStorage.setItem('gourmet_orders', JSON.stringify(orders));
    KafkaClient.produce(KafkaClient.TOPICS.ORDERS, orders, action);
}

// FALLBACK: Listen for localStorage changes (works even without Kafka)
window.addEventListener('storage', (e) => {
    if (e.key === 'gourmet_orders') {
        const newOrders = JSON.parse(e.newValue);
        if (typeof checkDeliveryStatus === 'function') {
            checkDeliveryStatus(orders, newOrders);
        }
        orders = newOrders;
        if (typeof refreshAllData === 'function') {
            refreshAllData();
        }
    }
});

// Polling fallback
setInterval(() => {
    const remoteData = localStorage.getItem('gourmet_orders');
    if (remoteData && JSON.stringify(orders) !== remoteData) {
        const newOrders = JSON.parse(remoteData);
        if (typeof checkDeliveryStatus === 'function') {
            checkDeliveryStatus(orders, newOrders);
        }
        orders = newOrders;
        if (typeof refreshAllData === 'function') {
            refreshAllData();
        }
    }
}, 1000);

// --- Utilities ---
function formatDate(date) {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
