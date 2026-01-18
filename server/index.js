/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * ███  GOURMET BITES - REAL KAFKA BACKEND  ███
 * Simple Node.js server connecting frontend to Apache Kafka
 * For School Demo
 * ═══════════════════════════════════════════════════════════════════════════════
 */

const { Kafka } = require('kafkajs');
const WebSocket = require('ws');
const express = require('express');
const cors = require('cors');

// ═══════════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════

const KAFKA_BROKER = process.env.KAFKA_BROKER || 'localhost:9092';
const WS_PORT = process.env.WS_PORT || 3001;
const HTTP_PORT = process.env.HTTP_PORT || 3000;

const TOPICS = {
    ORDERS: 'gourmet-orders',
    STATUS: 'order-status',
    NOTIFICATIONS: 'notifications'
};

// ═══════════════════════════════════════════════════════════════════════════════
// KAFKA SETUP
// ═══════════════════════════════════════════════════════════════════════════════

const kafka = new Kafka({
    clientId: 'gourmet-bites-server',
    brokers: [KAFKA_BROKER],
    retry: {
        initialRetryTime: 300,
        retries: 10
    }
});

const producer = kafka.producer();
const consumer = kafka.consumer({ groupId: 'gourmet-group' });
const admin = kafka.admin();

// Store connected WebSocket clients
const clients = new Set();

// Message history for new connections
const messageHistory = [];
const MAX_HISTORY = 50;

// ═══════════════════════════════════════════════════════════════════════════════
// WEBSOCKET SERVER
// ═══════════════════════════════════════════════════════════════════════════════

const wss = new WebSocket.Server({ port: WS_PORT });

console.log(`\n🔌 WebSocket Server running on ws://localhost:${WS_PORT}`);

wss.on('connection', (ws) => {
    console.log('✅ New client connected');
    clients.add(ws);
    
    // Send connection confirmation
    ws.send(JSON.stringify({
        type: 'CONNECTED',
        broker: KAFKA_BROKER,
        topics: Object.values(TOPICS),
        timestamp: new Date().toISOString()
    }));
    
    // Send message history
    if (messageHistory.length > 0) {
        ws.send(JSON.stringify({
            type: 'HISTORY',
            messages: messageHistory
        }));
    }
    
    // Handle incoming messages from frontend
    ws.on('message', async (data) => {
        try {
            const message = JSON.parse(data.toString());
            console.log(`📨 Received from client:`, message);
            
            if (message.type === 'PRODUCE') {
                await produceMessage(message.topic, message.payload, message.action, message.producer);
            }
        } catch (err) {
            console.error('Error processing message:', err);
        }
    });
    
    ws.on('close', () => {
        console.log('❌ Client disconnected');
        clients.delete(ws);
    });
});

// Broadcast to all connected clients
function broadcast(message) {
    const data = JSON.stringify(message);
    clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(data);
        }
    });
}

// ═══════════════════════════════════════════════════════════════════════════════
// KAFKA PRODUCER
// ═══════════════════════════════════════════════════════════════════════════════

async function produceMessage(topic, payload, action, producerName) {
    const kafkaMessage = {
        id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        topic: topic,
        partition: 0,
        timestamp: new Date().toISOString(),
        producer: producerName || 'Unknown',
        action: action || 'UPDATE',
        payload: payload
    };
    
    try {
        await producer.send({
            topic: topic,
            messages: [
                { 
                    key: kafkaMessage.id,
                    value: JSON.stringify(kafkaMessage)
                }
            ]
        });
        
        console.log(`📤 [KAFKA PRODUCER] → ${topic}:`, action);
        
        // Add to history
        messageHistory.unshift({ ...kafkaMessage, direction: 'produced' });
        if (messageHistory.length > MAX_HISTORY) messageHistory.pop();
        
        // Broadcast to all clients
        broadcast({
            type: 'KAFKA_MESSAGE',
            direction: 'produced',
            message: kafkaMessage
        });
        
    } catch (err) {
        console.error('Kafka produce error:', err);
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// KAFKA CONSUMER
// ═══════════════════════════════════════════════════════════════════════════════

async function startConsumer() {
    await consumer.connect();
    console.log('📥 Kafka Consumer connected');
    
    // Subscribe to all topics
    for (const topic of Object.values(TOPICS)) {
        await consumer.subscribe({ topic, fromBeginning: false });
        console.log(`   └─ Subscribed to: ${topic}`);
    }
    
    await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
            try {
                const kafkaMessage = JSON.parse(message.value.toString());
                console.log(`📥 [KAFKA CONSUMER] ← ${topic}:`, kafkaMessage.action);
                
                // Add to history
                messageHistory.unshift({ ...kafkaMessage, direction: 'consumed' });
                if (messageHistory.length > MAX_HISTORY) messageHistory.pop();
                
                // Broadcast to all frontend clients
                broadcast({
                    type: 'KAFKA_MESSAGE',
                    direction: 'consumed',
                    message: kafkaMessage
                });
                
            } catch (err) {
                console.error('Error processing Kafka message:', err);
            }
        }
    });
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPRESS HTTP SERVER (for health checks & REST API)
// ═══════════════════════════════════════════════════════════════════════════════

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.json({
        service: 'Gourmet Bites Kafka Server',
        status: 'running',
        kafka: KAFKA_BROKER,
        websocket: `ws://localhost:${WS_PORT}`,
        topics: TOPICS,
        connectedClients: clients.size
    });
});

app.get('/health', (req, res) => {
    res.json({ status: 'healthy' });
});

app.get('/messages', (req, res) => {
    res.json(messageHistory);
});

// REST API to produce messages (alternative to WebSocket)
app.post('/produce', async (req, res) => {
    const { topic, payload, action, producer } = req.body;
    await produceMessage(topic, payload, action, producer);
    res.json({ success: true });
});

app.listen(HTTP_PORT, () => {
    console.log(`🌐 HTTP Server running on http://localhost:${HTTP_PORT}`);
});

// ═══════════════════════════════════════════════════════════════════════════════
// STARTUP
// ═══════════════════════════════════════════════════════════════════════════════

async function start() {
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('   🍔 GOURMET BITES - KAFKA BACKEND SERVER');
    console.log('   School Demo - Real Apache Kafka Integration');
    console.log('═══════════════════════════════════════════════════════════\n');
    
    try {
        // Connect Admin to create topics explicitly
        console.log('🔧 Connecting to Kafka Admin...');
        await admin.connect();
        const existingTopics = await admin.listTopics();
        const topicsToCreate = Object.values(TOPICS).filter(t => !existingTopics.includes(t));

        if (topicsToCreate.length > 0) {
            console.log(`🔨 Creating topics: ${topicsToCreate.join(', ')}`);
            await admin.createTopics({
                topics: topicsToCreate.map(topic => ({
                    topic,
                    numPartitions: 1,
                    replicationFactor: 1
                }))
            });
            console.log('✅ Topics created successfully');
        } else {
            console.log('✅ Topics already exist');
        }
        await admin.disconnect();

        // Connect producer
        await producer.connect();
        console.log('📤 Kafka Producer connected to', KAFKA_BROKER);
        
        // Start consumer
        await startConsumer();
        
        console.log('\n✅ Server ready! Open your browser apps now.\n');
        console.log('═══════════════════════════════════════════════════════════\n');
        
    } catch (err) {
        console.error('\n❌ Failed to connect to Kafka:', err.message);
        console.log('\n💡 Make sure Kafka is running!');
        console.log('   Run: docker-compose up -d\n');
        
        // Keep server running for demo without Kafka
        console.log('⚠️  Running in demo mode (no Kafka connection)\n');
    }
}

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\nShutting down...');
    await consumer.disconnect();
    await producer.disconnect();
    process.exit(0);
});

start();
