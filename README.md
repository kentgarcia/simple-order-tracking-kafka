# Gourmet Bites - Real Kafka Setup

## Quick Start Guide

### Prerequisites
- **Docker Desktop** installed and running
- **Node.js** (v16 or higher)

---

## Step 1: Start Kafka with Docker

Open a terminal in the project folder and run:

```bash
docker-compose up -d
```

This starts:
- **Zookeeper** (port 2181)
- **Apache Kafka** (port 9092)
- **Kafka UI** (port 8080) - optional web interface

Wait about 30 seconds for Kafka to fully start.

---

## Step 2: Start the Backend Server

```bash
cd server
npm install
npm start
```

You should see:
```
═══════════════════════════════════════════════════════════
   🍔 GOURMET BITES - KAFKA BACKEND SERVER
═══════════════════════════════════════════════════════════

📤 Kafka Producer connected to localhost:9092
📥 Kafka Consumer connected
   └─ Subscribed to: gourmet-orders
   └─ Subscribed to: order-status
   └─ Subscribed to: notifications

✅ Server ready! Open your browser apps now.
```

---

## Step 3: Open the Apps

Open these files in your browser (3 separate tabs):

1. `customer.html` - Customer App
2. `restaurant.html` - Restaurant Dashboard
3. `rider.html` - Rider App

---

## Step 4: Test Kafka Flow

1. Click the **📊 Kafka Monitor** button (bottom-right) on each tab
2. In the Customer App, place an order
3. Watch the **real Kafka messages** flow:
   - `Customer-Service` produces a message
   - `Restaurant-Service` and `Rider-Service` consume it
4. Accept orders in Restaurant, mark ready, then deliver in Rider

---

## Kafka UI (Optional)

Visit **http://localhost:8080** to see:
- Topics created
- Messages in each topic
- Consumer groups

---

## Architecture

```
┌─────────────┐     WebSocket      ┌──────────────────┐
│  Customer   │◄──────────────────►│                  │
│   Browser   │                    │   Node.js        │
└─────────────┘                    │   Backend        │
                                   │                  │
┌─────────────┐     WebSocket      │  (Producer &     │
│ Restaurant  │◄──────────────────►│   Consumer)      │
│   Browser   │                    │                  │
└─────────────┘                    └────────┬─────────┘
                                            │
┌─────────────┐     WebSocket               │ KafkaJS
│   Rider     │◄────────────────────────────┤
│   Browser   │                             ▼
└─────────────┘                    ┌──────────────────┐
                                   │  Apache Kafka    │
                                   │  (Docker)        │
                                   │                  │
                                   │  Topics:         │
                                   │  - gourmet-orders│
                                   │  - order-status  │
                                   │  - notifications │
                                   └──────────────────┘
```

---

## Stopping Everything

```bash
# Stop the Node.js server
Ctrl + C

# Stop Kafka containers
docker-compose down
```

---

## Troubleshooting

**"Cannot connect to Kafka"**
- Make sure Docker is running
- Run `docker-compose up -d` and wait 30 seconds

**"WebSocket connection failed"**
- Make sure the Node.js server is running (`npm start` in server folder)

**Messages not syncing between tabs**
- Check the Kafka Monitor shows "Connected to Kafka"
- Check server console for errors
