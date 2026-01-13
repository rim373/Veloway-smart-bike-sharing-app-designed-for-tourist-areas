import RPi.GPIO as GPIO
import paho.mqtt.client as mqtt
import ssl
import json
import time
import logging
from datetime import datetime
from pathlib import Path

# ============================================================================
# CONFIGURATION
# ============================================================================

class Config:
    """System configuration"""
    # Station Identity
    STATION_ID = "STATION-001"  # CHANGE THIS for each station
    STATION_NAME = "Downtown Station"
    
    # MQTT Broker Settings
    MQTT_BROKER = "192.168.137.29"  # Your MQTT broker IP
    MQTT_PORT = 8883                 # TLS port (use 1883 for testing without TLS)
    MQTT_USERNAME = "veloway"
    MQTT_PASSWORD = "veloway123"
    
    # TLS/SSL Settings
    MQTT_USE_TLS = True  # Set False for testing without TLS
    MQTT_CA_CERT = str(Path.home() / "wot-station" / "certs" / "ca.crt")
    
    # Dock Configuration (GPIO pins for each dock)
    DOCKS = [
        {
            "id": "dock_1",
            "sensor_trig": 23,
            "sensor_echo": 24,
            "motor": 18,
        },
        {
            "id": "dock_2",
            "sensor_trig": 5,
            "sensor_echo": 6,
            "motor": 13,
        },
        {
            "id": "dock_3",
            "sensor_trig": 19,
            "sensor_echo": 26,
            "motor": 12,
        },
    ]
    
    # Sensor Settings
    DETECTION_DISTANCE_CM = 35   # Bike detected when distance < 35cm
    POLLING_INTERVAL = 0.5       # Check sensors every 500ms
    
    # Motor Settings
    MOTOR_DUTY_LOCK = 7.5        # Locked position (90°)
    MOTOR_DUTY_UNLOCK = 2.5      # Unlocked position (0°)
    MOTOR_TIMEOUT = 2            # Motor movement time
    
    # Logging
    LOG_LEVEL = logging.INFO
    LOG_FILE = Path.home() / "veloway-station" / f"station_{STATION_ID}.log"

# ============================================================================
# LOGGING SETUP
# ============================================================================

Path(Config.LOG_FILE).parent.mkdir(parents=True, exist_ok=True)

logging.basicConfig(
    level=Config.LOG_LEVEL,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(Config.LOG_FILE),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# ============================================================================
# DOCK CLASS
# ============================================================================

class Dock:
    """Single bike dock with sensor and motor"""
    
    def __init__(self, dock_id, trig_pin, echo_pin, motor_pin):
        self.dock_id = dock_id
        self.trig_pin = trig_pin
        self.echo_pin = echo_pin
        self.motor_pin = motor_pin
        self.bike_present = False
        self.pwm = None
        
        # Setup GPIO
        GPIO.setup(self.trig_pin, GPIO.OUT)
        GPIO.setup(self.echo_pin, GPIO.IN)
        GPIO.setup(self.motor_pin, GPIO.OUT)
        GPIO.output(self.trig_pin, False)
        
        # Setup motor PWM
        self.pwm = GPIO.PWM(self.motor_pin, 50)
        self.pwm.start(0)
        
        logger.info(f"✓ {dock_id} initialized (Sensor: {trig_pin}/{echo_pin}, Motor: {motor_pin})")
    
    def measure_distance(self):
        """Measure distance with ultrasonic sensor"""
        try:
            # Send trigger pulse
            GPIO.output(self.trig_pin, True)
            time.sleep(0.00001)
            GPIO.output(self.trig_pin, False)
            
            # Wait for echo
            timeout = time.time() + 0.05
            while GPIO.input(self.echo_pin) == 0 and time.time() < timeout:
                pass
            pulse_start = time.time()
            
            timeout = time.time() + 0.05
            while GPIO.input(self.echo_pin) == 1 and time.time() < timeout:
                pass
            pulse_end = time.time()
            
            # Calculate distance
            duration = pulse_end - pulse_start
            distance = (duration * 34300) / 2
            
            return distance if 2 < distance < 200 else 200
            
        except:
            return 200
    
    def is_bike_present(self):
        """Check if bike is detected"""
        distance = self.measure_distance()
        return distance < Config.DETECTION_DISTANCE_CM
    
    def lock(self):
        """Lock the bike"""
        try:
            logger.info(f" {self.dock_id} locking...")
            self.pwm.ChangeDutyCycle(Config.MOTOR_DUTY_LOCK)
            time.sleep(Config.MOTOR_TIMEOUT)
            self.pwm.ChangeDutyCycle(0)
            logger.info(f"✓ {self.dock_id} locked")
            return True
        except Exception as e:
            logger.error(f"✗ {self.dock_id} lock failed: {e}")
            return False
    
    def unlock(self):
        """Unlock the bike"""
        try:
            logger.info(f" {self.dock_id} unlocking...")
            self.pwm.ChangeDutyCycle(Config.MOTOR_DUTY_UNLOCK)
            time.sleep(Config.MOTOR_TIMEOUT)
            self.pwm.ChangeDutyCycle(0)
            logger.info(f" {self.dock_id} unlocked")
            return True
        except Exception as e:
            logger.error(f" {self.dock_id} unlock failed: {e}")
            return False
    
    def cleanup(self):
        """Cleanup GPIO"""
        if self.pwm:
            self.pwm.stop()

# ============================================================================
# STATION CONTROLLER
# ============================================================================

class Station:
    """Main station controller"""
    
    def __init__(self):
        # Initialize GPIO
        GPIO.setmode(GPIO.BCM)
        GPIO.setwarnings(False)
        
        # Print startup
        logger.info("=" * 70)
        logger.info(f"VELOWAY STATION: {Config.STATION_ID} - {Config.STATION_NAME}")
        logger.info(f"Docks: {len(Config.DOCKS)}")
        logger.info("=" * 70)
        
        # Create docks
        self.docks = {}
        for dock_config in Config.DOCKS:
            dock = Dock(
                dock_config["id"],
                dock_config["sensor_trig"],
                dock_config["sensor_echo"],
                dock_config["motor"]
            )
            self.docks[dock.dock_id] = dock
        
        # MQTT client
        self.mqtt = mqtt.Client(
            client_id=f"{Config.STATION_ID}_{int(time.time())}",
            callback_api_version=mqtt.CallbackAPIVersion.V1
        )
        self.mqtt.username_pw_set(Config.MQTT_USERNAME, Config.MQTT_PASSWORD)
        self.mqtt.on_connect = self.on_connect
        self.mqtt.on_message = self.on_message
        self.connected = False
        self.running = False
        
        # Setup TLS if enabled
        if Config.MQTT_USE_TLS:
            self.setup_tls()
        
        logger.info(f"✓ Station initialized with {len(self.docks)} docks\n")
    
    def setup_tls(self):
        """Configure TLS/SSL encryption"""
        try:
            ca_cert = Path(Config.MQTT_CA_CERT)
            if ca_cert.exists():
                self.mqtt.tls_set(
                    ca_certs=str(ca_cert),
                    cert_reqs=ssl.CERT_REQUIRED,
                    tls_version=ssl.PROTOCOL_TLSv1_2
                )
                logger.info("✓ TLS/SSL configured")
            else:
                logger.error(f"✗ CA certificate not found: {Config.MQTT_CA_CERT}")
                logger.warning("  Running without TLS - INSECURE!")
        except Exception as e:
            logger.error(f"✗ TLS setup failed: {e}")
            logger.warning("  Running without TLS - INSECURE!")
    
    def on_connect(self, client, userdata, flags, rc):
        """MQTT connection callback"""
        if rc == 0:
            self.connected = True
            logger.info(f"✓ Connected to MQTT: {Config.MQTT_BROKER}")
            
            # Subscribe to unlock commands for each dock
            for dock_id in self.docks.keys():
                topic = f"veloway/station/{Config.STATION_ID}/dock/{dock_id}/unlock"
                self.mqtt.subscribe(topic)
                logger.info(f"  → Subscribed: {topic}")
            
            # Publish initial availability
            self.publish_availability()
        else:
            logger.error(f"✗ MQTT connection failed (code {rc})")
    
    def on_message(self, client, userdata, msg):
        """MQTT message callback"""
        try:
            # Parse topic to get dock_id
            topic_parts = msg.topic.split('/')
            dock_id = topic_parts[4] if len(topic_parts) > 4 else None
            
            if dock_id in self.docks:
                payload = json.loads(msg.payload.decode()) if msg.payload else {}
                rental_id = payload.get("rentalId", "")
                bike_id = payload.get("bikeId", "")
                
                logger.info(f"\n UNLOCK COMMAND: {dock_id}")
                logger.info(f"   Rental: {rental_id}, Bike: {bike_id}")
                
                # Unlock the dock
                dock = self.docks[dock_id]
                if dock.bike_present:
                    success = dock.unlock()
                    self.publish_unlock_status(dock_id, success, rental_id, bike_id)
                else:
                    logger.warning(f"  No bike in {dock_id}")
                    self.publish_unlock_status(dock_id, False, rental_id, bike_id)
                    
        except Exception as e:
            logger.error(f"✗ Error processing message: {e}")
    
    def publish_availability(self):
        """Publish how many docks are available"""
        available = sum(1 for d in self.docks.values() if not d.bike_present)
        occupied = sum(1 for d in self.docks.values() if d.bike_present)
        
        topic = f"veloway/station/{Config.STATION_ID}/availability"
        payload = {
            "stationId": Config.STATION_ID,
            "stationName": Config.STATION_NAME,
            "totalDocks": len(self.docks),
            "availableDocks": available,
            "occupiedDocks": occupied,
            "timestamp": datetime.now().isoformat()
        }
        
        self.mqtt.publish(topic, json.dumps(payload))
        logger.info(f" Availability: {available}/{len(self.docks)} docks free")
    
    def publish_bike_detected(self, dock_id, bike_id=None):
        """Publish bike detection event - Format matches Java Bike entity"""
        topic = f"veloway/station/{Config.STATION_ID}/dock/{dock_id}/bike_detected"
        
        # Generate bike_id if not provided
        if not bike_id:
            bike_id = f"BIKE-{Config.STATION_ID}-{dock_id}-{int(time.time())}"
        
        payload = {
            "bikeId": bike_id,
            "status": "DOCKED",
            "stationId": Config.STATION_ID,
            "dockId": dock_id,
            "timestamp": datetime.now().isoformat()
        }
        
        self.mqtt.publish(topic, json.dumps(payload))
        logger.info(f" Bike detected: {dock_id} (Bike: {bike_id})")
        
        # Update availability
        self.publish_availability()
    
    def publish_bike_removed(self, dock_id, bike_id=None):
        """Publish bike removal event - Format matches Java entities"""
        topic = f"veloway/station/{Config.STATION_ID}/dock/{dock_id}/bike_removed"
        payload = {
            "bikeId": bike_id,
            "status": "IN_USE",
            "stationId": Config.STATION_ID,
            "dockId": dock_id,
            "timestamp": datetime.now().isoformat()
        }
        
        self.mqtt.publish(topic, json.dumps(payload))
        logger.info(f" Bike removed: {dock_id} (Bike: {bike_id})")
        
        # Update availability
        self.publish_availability()
    
    def publish_unlock_status(self, dock_id, success, rental_id, bike_id):
        """Publish unlock status"""
        topic = f"veloway/station/{Config.STATION_ID}/dock/{dock_id}/unlock_status"
        payload = {
            "stationId": Config.STATION_ID,
            "dockId": dock_id,
            "rentalId": rental_id,
            "bikeId": bike_id,
            "success": success,
            "timestamp": datetime.now().isoformat()
        }
        
        self.mqtt.publish(topic, json.dumps(payload))
    
    def start(self):
        """Start the station"""
        try:
            # Connect to MQTT
            logger.info(f"Connecting to {Config.MQTT_BROKER}...")
            self.mqtt.connect(Config.MQTT_BROKER, Config.MQTT_PORT, 60)
            self.mqtt.loop_start()
            
            # Wait for connection
            timeout = 10
            start = time.time()
            while not self.connected and (time.time() - start) < timeout:
                time.sleep(0.1)
            
            if not self.connected:
                raise Exception("MQTT connection timeout")
            
            # Start monitoring
            self.running = True
            logger.info("✓ Station started\n")
            self.monitor_docks()
            
        except KeyboardInterrupt:
            logger.info("\n  Shutdown requested")
        except Exception as e:
            logger.error(f"✗ Fatal error: {e}")
        finally:
            self.stop()
    
    def monitor_docks(self):
        """Main monitoring loop"""
        while self.running:
            try:
                # Check each dock
                for dock in self.docks.values():
                    bike_detected = dock.is_bike_present()
                    
                    # Bike arrived (returned)
                    if bike_detected and not dock.bike_present:
                        logger.info(f"\n🚴 {dock.dock_id}: BIKE DETECTED!")
                        
                        # Wait and confirm multiple times (debouncing)
                        confirmed = 0
                        for _ in range(3):
                            time.sleep(0.5)
                            if dock.is_bike_present():
                                confirmed += 1
                        
                        # Only proceed if consistently detected
                        if confirmed >= 2:
                            logger.info(f"✓ {dock.dock_id}: Detection confirmed")
                            # Lock the bike
                            if dock.lock():
                                dock.bike_present = True
                                self.publish_bike_detected(dock.dock_id)
                            else:
                                logger.error(f"✗ {dock.dock_id}: Failed to lock")
                        else:
                            logger.info(f"⚠️  {dock.dock_id}: False detection (ignored)")
                    
                    # Bike removed (rented)
                    elif not bike_detected and dock.bike_present:
                        logger.info(f"\n🚴 {dock.dock_id}: BIKE REMOVED!")
                        
                        # Wait and confirm
                        confirmed = 0
                        for _ in range(3):
                            time.sleep(0.5)
                            if not dock.is_bike_present():
                                confirmed += 1
                        
                        # Only proceed if consistently absent
                        if confirmed >= 2:
                            logger.info(f"✓ {dock.dock_id}: Removal confirmed")
                            dock.bike_present = False
                            self.publish_bike_removed(dock.dock_id)
                        else:
                            logger.info(f"⚠️  {dock.dock_id}: False removal (ignored)")
                
                # Sleep before next check
                time.sleep(Config.POLLING_INTERVAL)
                
            except Exception as e:
                logger.error(f"✗ Monitor error: {e}")
                time.sleep(1)
    
    def stop(self):
        """Stop the station"""
        logger.info("\nShutting down...")
        self.running = False
        
        # Cleanup docks
        for dock in self.docks.values():
            dock.cleanup()
        
        # Disconnect MQTT
        self.mqtt.loop_stop()
        self.mqtt.disconnect()
        
        # Cleanup GPIO
        GPIO.cleanup()
        
        logger.info("✓ Shutdown complete\n")

# ============================================================================
# MAIN
# ============================================================================

def main():
    """Main entry point"""
    try:
        station = Station()
        station.start()
    except Exception as e:
        logger.error(f"✗ Failed to start: {e}")
        GPIO.cleanup()
        exit(1)

if __name__ == "__main__":
    main()