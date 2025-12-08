const mqtt = require('mqtt');

// Configuration
const BROKER_URL = 'mqtt://localhost:1883';
const USERNAME = 'veloway';
const PASSWORD = 'veloway123';

console.log('🧪 Testing MQTT Broker...\n');

// Connect to broker
const client = mqtt.connect(BROKER_URL, {
  username: USERNAME,
  password: PASSWORD,
  clientId: 'test-client-' + Math.random().toString(16).substr(2, 8),
});

client.on('connect', () => {
  console.log('✓ Connected to MQTT broker');
  
  // Subscribe to all topics
  client.subscribe('wot/#', (err) => {
    if (err) {
      console.error('✗ Subscribe failed:', err.message);
      return;
    }
    console.log('✓ Subscribed to wot/#');
    
    // Publish test message
    console.log('\n📤 Publishing test message...');
    const testMessage = {
      eventType: 'BIKE_DETECTED',
      stationId: 'STATION-001',
      dockId: 'dock_1',
      bikeId: 'BIKE-TEST-123',
      lockStatus: 'LOCKED',
      timestamp: new Date().toISOString(),
    };
    
    client.publish(
      'wot/station/STATION-001/dock/dock_1/bike/detected',
      JSON.stringify(testMessage),
      { qos: 1 },
      (err) => {
        if (err) {
          console.error('✗ Publish failed:', err.message);
        } else {
          console.log('✓ Message published successfully');
        }
      }
    );
  });
});

client.on('message', (topic, message) => {
  console.log('\n📥 Message received:');
  console.log('   Topic:', topic);
  console.log('   Payload:', message.toString());
});

client.on('error', (error) => {
  console.error('✗ Connection error:', error.message);
  process.exit(1);
});

// Auto-disconnect after 5 seconds
setTimeout(() => {
  console.log('\n✓ Test completed, disconnecting...');
  client.end();
  process.exit(0);
}, 5000);