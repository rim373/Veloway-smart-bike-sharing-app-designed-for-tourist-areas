const aedes = require('aedes')();
const net = require('net');
const axios = require('axios');
require('dotenv').config();

// Configuration
const config = {
  mqtt: {
    port: parseInt(process.env.MQTT_PORT) || 1883,
    host: process.env.MQTT_HOST || '0.0.0.0',
    username: process.env.MQTT_USERNAME || 'veloway',
    password: process.env.MQTT_PASSWORD || 'veloway123',
  },
  backend: {
    url: process.env.BACKEND_URL || 'http://localhost:8080',
  },
  debug: process.env.DEBUG_MQTT === 'true',
};

console.log('='.repeat(70));
console.log(' VELOWAY IOT GATEWAY');
console.log('='.repeat(70));

// Authentication
aedes.authenticate = (client, username, password, callback) => {
  const authorized = (
    username === config.mqtt.username &&
    password && password.toString() === config.mqtt.password
  );
  
  if (authorized) {
    console.log(`✓ Client authenticated: ${client.id}`);
    callback(null, true);
  } else {
    console.log(`✗ Authentication failed for: ${client.id}`);
    callback(new Error('Authentication failed'), false);
  }
};

// Start MQTT broker
const server = net.createServer(aedes.handle);
server.listen(config.mqtt.port, config.mqtt.host, () => {
  console.log(`✓ MQTT Broker: ${config.mqtt.host}:${config.mqtt.port}`);
  console.log(`✓ Backend API: ${config.backend.url}`);
  console.log(`✓ Authentication: Enabled`);
  console.log(`✓ Debug Mode: ${config.debug ? 'ON' : 'OFF'}`);
  console.log('='.repeat(70));
  console.log('Waiting for IoT devices...\n');
});

// Client events
aedes.on('client', (client) => {
  console.log(`\n✓ CLIENT CONNECTED: ${client.id}`);
  console.log(`   Total clients: ${Object.keys(aedes.clients).length}`);
});

aedes.on('clientDisconnect', (client) => {
  console.log(`\n✗ CLIENT DISCONNECTED: ${client.id}`);
  console.log(`   Remaining clients: ${Object.keys(aedes.clients).length}`);
});

// Message handling
aedes.on('publish', async (packet, client) => {
  if (!client) return;
  if (packet.topic.startsWith('$SYS/')) return;
  
  const topic = packet.topic;
  const message = packet.payload.toString();
  
  console.log(`\n MESSAGE RECEIVED`);
  console.log(`   From: ${client.id}`);
  console.log(`   Topic: ${topic}`);
  console.log(`   Time: ${new Date().toLocaleTimeString()}`);
  
  try {
    const data = JSON.parse(message);
    await routeMessage(topic, data);
  } catch (error) {
    if (error instanceof SyntaxError) {
      console.log(`    Invalid JSON`);
    } else {
      console.error(`   ✗ Error: ${error.message}`);
    }
  }
});

// Route messages
async function routeMessage(topic, data) {
  if (topic.includes('/bike/detected')) {
    console.log(`    Event: Bike Detected`);
    console.log(`      Station: ${data.stationId}, Dock: ${data.dockId}`);
    await forwardToBackend('/api/iot/bike-detected', data);
  } 
  else if (topic.includes('/bike/removed')) {
    console.log(`    Event: Bike Removed`);
    console.log(`      Station: ${data.stationId}, Dock: ${data.dockId}`);
    await forwardToBackend('/api/iot/bike-removed', data);
  } 
  else if (topic.includes('/lock/status')) {
    console.log(`    Event: Lock Status - ${data.lockStatus}`);
    console.log(`      Station: ${data.stationId}`);
    await forwardToBackend('/api/iot/lock-status', data);
  }
  else if (topic.includes('/heartbeat')) {
    console.log(`    Heartbeat from ${data.stationId}`);
  }
  else if (topic.includes('/status')) {
    console.log(`    Status update from ${data.stationId}`);
  }
  else if (topic.includes('/error')) {
    console.log(`     Error from ${data.stationId}: ${data.error.message}`);
  }
}

// Forward to backend
async function forwardToBackend(endpoint, data) {
  try {
    const url = `${config.backend.url}${endpoint}`;
    console.log(`   → Forwarding to backend: ${endpoint}`);
    
    const response = await axios.post(url, data, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 5000,
    });
    
    console.log(`   ✓ Backend responded: ${response.status}`);
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.error(`   ✗ Backend not reachable (${config.backend.url})`);
    } else if (error.response) {
      console.error(`   ✗ Backend error: ${error.response.status}`);
    } else {
      console.error(`   ✗ Forward failed: ${error.message}`);
    }
  }
}

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n Shutting down...');
  server.close(() => {
    console.log('✓ Bye!\n');
    process.exit(0);
  });
});

console.log('✓ Gateway ready!\n');