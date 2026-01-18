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

// --- Global State & Sync Logic ---

// Load from LocalStorage or use defaults
let orders = JSON.parse(localStorage.getItem('gourmet_orders')) || defaultOrders;

// Event Dispatcher for local updates within the same file/window
const localUpdateEvent = new Event('ordersUpdated');

// Mock Producer: Broadcast updates
function saveOrders() {
    console.log("[Kafka Mock] Producer: Sending Update");
    localStorage.setItem('gourmet_orders', JSON.stringify(orders));
    window.dispatchEvent(localUpdateEvent); // Trigger local listeners immediately
}

// Mock Consumer: Listen for updates from other services/windows
window.addEventListener('storage', (e) => {
    if (e.key === 'gourmet_orders') {
        console.log("[Kafka Mock] Consumer Event Received: State Sync");
        const newOrders = JSON.parse(e.newValue);
        
        // Check for specific events (like delivery toast)
        if (typeof checkDeliveryStatus === 'function') {
            checkDeliveryStatus(orders, newOrders);
        }

        orders = newOrders;
        if (typeof refreshAllData === 'function') {
            refreshAllData();
        }
    }
});

// Polling for robust local file sync
setInterval(() => {
    const remoteData = localStorage.getItem('gourmet_orders');
    if (remoteData) {
        if (JSON.stringify(orders) !== remoteData) {
            console.log("[Kafka Mock] Consumer: New Message Received (Polling)");
            const newOrders = JSON.parse(remoteData);
            
            if (typeof checkDeliveryStatus === 'function') {
                checkDeliveryStatus(orders, newOrders);
            }

            orders = newOrders;
            if (typeof refreshAllData === 'function') {
                refreshAllData();
            }
        }
    }
}, 500);

// --- Utilities ---
function formatDate(date) {
    // Simple helper if needed
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
