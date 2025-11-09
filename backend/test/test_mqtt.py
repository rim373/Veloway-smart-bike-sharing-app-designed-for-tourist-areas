import paho.mqtt.client as mqtt
import time
import json

MQTT_BROKER = "broker.hivemq.com"  # Free public broker for testing
STATION_ID = "test_station_001"

def on_connect(client, userdata, flags, rc):
    if rc == 0:
        print("✓ Connected to MQTT broker")
        client.subscribe(f"wot/station/{STATION_ID}/#")
    else:
        print(f"✗ Connection failed: {rc}")

def on_message(client, userdata, msg):
    print(f"Received: {msg.topic} -> {msg.payload.decode()}")

client = mqtt.Client(client_id=STATION_ID)
client.on_connect = on_connect
client.on_message = on_message

try:
    print(f"Connecting to {MQTT_BROKER}...")
    client.connect(MQTT_BROKER, 1883, 60)
    client.loop_start()
    
    # Send test message
    time.sleep(2)
    test_msg = {
        "test": "hello from WOT station",
        "timestamp": time.time()
    }
    client.publish(f"wot/station/{STATION_ID}/test", json.dumps(test_msg))
    print("✓ Test message sent")
    
    # Keep running
    print("Listening for messages (Ctrl+C to stop)...")
    while True:
        time.sleep(1)
        
except KeyboardInterrupt:
    print("\nStopping...")
finally:
    client.loop_stop()
    client.disconnect()