import RPi.GPIO as GPIO
import paho.mqtt.client as mqtt
import json
import time
import logging
from datetime import datetime
from enum import Enum
from pathlib import Path

# ============================================================================
# CONFIGURATION - CHANGE THESE VALUES
# ============================================================================

class Config:
    """System configuration"""
    # Station Identity - MUST MATCH YOUR DATABASE
    STATION_ID = "STATION-001"
    DOCK_ID = "dock_1"
    
    # MQTT Settings - CHANGE MQTT_BROKER TO YOUR SERVER IP
    MQTT_BROKER = "192.168.1.1"  #  CHANGE THIS TO YOUR IOT GATEWAY IP
    MQTT_PORT = 1883
    MQTT_USERNAME = "veloway"
    MQTT_PASSWORD = "veloway123"
    MQTT_KEEPALIVE = 60
    MQTT_QOS = 1
    
    # GPIO Pins (Hardware connections)
    IR_SENSOR_PIN = 17      # BCM Pin 17 - IR Sensor
    MOTOR_PIN = 18          # BCM Pin 18 - Servo Motor (PWM)
    
    # Motor Settings (Servo configuration)
    MOTOR_FREQUENCY = 50    # 50Hz for standard servo
    MOTOR_DUTY_LOCK = 7.5   # Duty cycle for locked position (90°)
    MOTOR_DUTY_UNLOCK = 2.5 # Duty cycle for unlocked position (0°)
    MOTOR_TIMEOUT = 2       # Motor operation timeout (seconds)
    
    # Sensor Settings
    IR_DEBOUNCE_TIME = 0.5  # Wait time to confirm detection
    POLLING_INTERVAL = 0.1  # Check sensor every 100ms
    
    # Operation Settings
    MAX_LOCK_ATTEMPTS = 3   # Retry lock operation this many times
    HEARTBEAT_INTERVAL = 60 # Send heartbeat every 60 seconds
    
    # Logging
    LOG_LEVEL = logging.INFO
    LOG_DIR = Path.home() / "veloway-station" / "logs"
    LOG_FILE = LOG_DIR / "station.log"

# ============================================================================
# ENUMS
# ============================================================================

class LockState(Enum):
    """Lock states"""
    LOCKED = "LOCKED"
    UNLOCKED = "UNLOCKED"
    LOCKING = "LOCKING"
    UNLOCKING = "UNLOCKING"
    ERROR = "ERROR"

class BikeState(Enum):
    """Bike presence states"""
    PRESENT = "PRESENT"
    ABSENT = "ABSENT"

# ============================================================================
# LOGGING SETUP
# ============================================================================

def setup_logging():
    """Configure logging system"""
    Config.LOG_DIR.mkdir(parents=True, exist_ok=True)
    
    logging.basicConfig(
        level=Config.LOG_LEVEL,
        format='%(asctime)s - %(levelname)s - %(message)s',
        handlers=[
            logging.FileHandler(Config.LOG_FILE),
            logging.StreamHandler()
        ]
    )
    return logging.getLogger(__name__)

logger = setup_logging()

# ============================================================================
# MQTT TOPICS
# ============================================================================

class Topics:
    """MQTT topic structure"""
    BASE = f"wot/station/{Config.STATION_ID}/dock/{Config.DOCK_ID}"
    
    # Publishing topics (Station -> Backend)
    BIKE_DETECTED = f"{BASE}/bike/detected"
    BIKE_REMOVED = f"{BASE}/bike/removed"
    LOCK_STATUS = f"{BASE}/lock/status"
    HEARTBEAT = f"{BASE}/heartbeat"
    ERROR = f"{BASE}/error"
    STATUS = f"{BASE}/status"
    
    # Subscribing topics (Backend -> Station)
    COMMAND_UNLOCK = f"{BASE}/command/unlock"
    COMMAND_LOCK = f"{BASE}/command/lock"
    COMMAND_STATUS = f"{BASE}/command/status"

# ============================================================================
# MOTOR CONTROLLER
# ============================================================================

class MotorController:
    """Controls the locking motor (servo)"""
    
    def __init__(self):
        self.pwm = None
        self.current_state = LockState.UNLOCKED
        self.setup()
    
    def setup(self):
        """Initialize motor GPIO"""
        try:
            GPIO.setup(Config.MOTOR_PIN, GPIO.OUT)
            self.pwm = GPIO.PWM(Config.MOTOR_PIN, Config.MOTOR_FREQUENCY)
            self.pwm.start(0)
            logger.info(f"✓ Motor initialized on GPIO {Config.MOTOR_PIN}")
        except Exception as e:
            logger.error(f"✗ Motor setup failed: {e}")
            raise
    
    def lock(self):
        """Lock the bike"""
        try:
            logger.info("🔒 Locking...")
            self.current_state = LockState.LOCKING
            
            self.pwm.ChangeDutyCycle(Config.MOTOR_DUTY_LOCK)
            time.sleep(Config.MOTOR_TIMEOUT)
            self.pwm.ChangeDutyCycle(0)
            
            self.current_state = LockState.LOCKED
            logger.info("✓ Locked")
            return True
            
        except Exception as e:
            logger.error(f"✗ Lock failed: {e}")
            self.current_state = LockState.ERROR
            return False
    
    def unlock(self):
        """Unlock the bike"""
        try:
            logger.info("🔓 Unlocking...")
            self.current_state = LockState.UNLOCKING
            
            self.pwm.ChangeDutyCycle(Config.MOTOR_DUTY_UNLOCK)
            time.sleep(Config.MOTOR_TIMEOUT)
            self.pwm.ChangeDutyCycle(0)
            
            self.current_state = LockState.UNLOCKED
            logger.info("✓ Unlocked")
            return True
            
        except Exception as e:
            logger.error(f"✗ Unlock failed: {e}")
            self.current_state = LockState.ERROR
            return False
    
    def get_state(self):
        """Get current lock state"""
        return self.current_state
    
    def cleanup(self):
        """Clean up motor resources"""
        if self.pwm:
            try:
                self.pwm.stop()
            except:
                pass

# ============================================================================
# IR SENSOR CONTROLLER
# ============================================================================

class IRSensorController:
    """Controls IR proximity sensor for bike detection"""
    
    def __init__(self):
        self.current_state = BikeState.ABSENT
        self.setup()
    
    def setup(self):
        """Initialize IR sensor GPIO"""
        try:
            GPIO.setup(Config.IR_SENSOR_PIN, GPIO.IN)
            state = GPIO.input(Config.IR_SENSOR_PIN)
            logger.info(f"✓ IR Sensor initialized on GPIO {Config.IR_SENSOR_PIN} (state: {state})")
        except Exception as e:
            logger.error(f"✗ IR Sensor setup failed: {e}")
            raise
    
    def is_bike_present(self):
        """Check if bike is present (HIGH = detected)"""
        try:
            return GPIO.input(Config.IR_SENSOR_PIN) == GPIO.HIGH
        except Exception as e:
            logger.error(f"✗ Error reading sensor: {e}")
            return False
    
    def wait_for_stable_detection(self):
        """Wait for stable bike detection (debouncing)"""
        logger.info("⏳ Confirming detection...")
        time.sleep(Config.IR_DEBOUNCE_TIME)
        
        if self.is_bike_present():
            logger.info("✓ Detection confirmed")
            return True
        else:
            logger.info("✗ False detection")
            return False

# ============================================================================
# MQTT CLIENT
# ============================================================================

class MQTTClient:
    """Handles MQTT communication"""
    
    def __init__(self, station_controller):
        self.station_controller = station_controller
        self.client = mqtt.Client(
            client_id=f"{Config.STATION_ID}_{int(time.time())}",
            protocol=mqtt.MQTTv311
        )
        self.connected = False
        self.setup_callbacks()
    
    def setup_callbacks(self):
        """Setup MQTT callbacks"""
        self.client.on_connect = self.on_connect
        self.client.on_disconnect = self.on_disconnect
        self.client.on_message = self.on_message
        
        if Config.MQTT_USERNAME:
            self.client.username_pw_set(Config.MQTT_USERNAME, Config.MQTT_PASSWORD)
    
    def on_connect(self, client, userdata, flags, rc):
        """Callback when connected to MQTT broker"""
        if rc == 0:
            self.connected = True
            logger.info(f"✓ Connected to MQTT: {Config.MQTT_BROKER}")
            
            # Subscribe to command topics
            topics = [Topics.COMMAND_UNLOCK, Topics.COMMAND_LOCK, Topics.COMMAND_STATUS]
            for topic in topics:
                self.client.subscribe(topic, qos=Config.MQTT_QOS)
                logger.info(f"  → Subscribed: {topic}")
            
            # Publish initial status
            self.publish_status()
            
        else:
            logger.error(f"✗ MQTT connection failed (code {rc})")
            self.connected = False
    
    def on_disconnect(self, client, userdata, rc):
        """Callback when disconnected"""
        self.connected = False
        if rc != 0:
            logger.warning(f"⚠️  Unexpected disconnection (code {rc})")
    
    def on_message(self, client, userdata, msg):
        """Callback when message received"""
        try:
            topic = msg.topic
            payload = msg.payload.decode()
            logger.info(f"📩 Received: {topic}")
            
            try:
                data = json.loads(payload) if payload else {}
            except json.JSONDecodeError:
                data = {}
            
            # Handle commands
            if topic == Topics.COMMAND_UNLOCK:
                self.station_controller.handle_unlock_command(data)
            elif topic == Topics.COMMAND_LOCK:
                self.station_controller.handle_lock_command(data)
            elif topic == Topics.COMMAND_STATUS:
                self.publish_status()
            
        except Exception as e:
            logger.error(f"✗ Error processing message: {e}")
    
    def connect(self):
        """Connect to MQTT broker"""
        try:
            logger.info(f"Connecting to {Config.MQTT_BROKER}:{Config.MQTT_PORT}...")
            self.client.connect(Config.MQTT_BROKER, Config.MQTT_PORT, Config.MQTT_KEEPALIVE)
            self.client.loop_start()
            
            # Wait for connection
            timeout = 10
            start_time = time.time()
            while not self.connected and (time.time() - start_time) < timeout:
                time.sleep(0.1)
            
            if not self.connected:
                raise Exception("Connection timeout")
                
        except Exception as e:
            logger.error(f"✗ MQTT connection failed: {e}")
            raise
    
    def publish(self, topic, payload):
        """Publish message to MQTT broker"""
        try:
            if isinstance(payload, dict):
                payload = json.dumps(payload)
            
            result = self.client.publish(topic, payload, qos=Config.MQTT_QOS)
            return result.rc == mqtt.MQTT_ERR_SUCCESS
                
        except Exception as e:
            logger.error(f"✗ Publish error: {e}")
            return False
    
    def publish_bike_detected(self, bike_id=None):
        """Publish bike detection event"""
        payload = {
            "eventType": "BIKE_DETECTED",
            "stationId": Config.STATION_ID,
            "dockId": Config.DOCK_ID,
            "bikeId": bike_id,
            "lockStatus": self.station_controller.motor.get_state().value,
            "timestamp": datetime.now().isoformat()
        }
        self.publish(Topics.BIKE_DETECTED, payload)
    
    def publish_bike_removed(self):
        """Publish bike removal event"""
        payload = {
            "eventType": "BIKE_REMOVED",
            "stationId": Config.STATION_ID,
            "dockId": Config.DOCK_ID,
            "timestamp": datetime.now().isoformat()
        }
        self.publish(Topics.BIKE_REMOVED, payload)
    
    def publish_lock_status(self, state, success=True):
        """Publish lock status change"""
        payload = {
            "eventType": "LOCK_STATUS_CHANGE",
            "stationId": Config.STATION_ID,
            "dockId": Config.DOCK_ID,
            "lockStatus": state.value,
            "success": success,
            "timestamp": datetime.now().isoformat()
        }
        self.publish(Topics.LOCK_STATUS, payload)
    
    def publish_status(self):
        """Publish current status"""
        payload = {
            "eventType": "STATION_STATUS",
            "stationId": Config.STATION_ID,
            "dockId": Config.DOCK_ID,
            "status": {
                "bikePresent": self.station_controller.sensor.is_bike_present(),
                "lockState": self.station_controller.motor.get_state().value,
                "operational": True,
                "uptime": round(time.time() - self.station_controller.start_time, 2)
            },
            "timestamp": datetime.now().isoformat()
        }
        self.publish(Topics.STATUS, payload)
    
    def publish_error(self, error_message):
        """Publish error event"""
        payload = {
            "eventType": "ERROR",
            "stationId": Config.STATION_ID,
            "dockId": Config.DOCK_ID,
            "error": {"message": error_message, "severity": "HIGH"},
            "timestamp": datetime.now().isoformat()
        }
        self.publish(Topics.ERROR, payload)
    
    def disconnect(self):
        """Disconnect from MQTT broker"""
        self.client.loop_stop()
        self.client.disconnect()

# ============================================================================
# MAIN STATION CONTROLLER
# ============================================================================

class StationController:
    """Main controller orchestrating all components"""
    
    def __init__(self):
        self.start_time = time.time()
        self.running = False
        self.bike_present = False
        
        # Initialize GPIO
        GPIO.setmode(GPIO.BCM)
        GPIO.setwarnings(False)
        
        # Print banner
        self.print_banner()
        
        # Initialize components
        self.motor = MotorController()
        self.sensor = IRSensorController()
        self.mqtt = MQTTClient(self)
        
        logger.info("✓ All components initialized\n")
    
    def print_banner(self):
        """Print startup banner"""
        logger.info("=" * 60)
        logger.info("VELOWAY BIKE STATION CONTROLLER")
        logger.info(f"Station: {Config.STATION_ID} | Dock: {Config.DOCK_ID}")
        logger.info("=" * 60)
    
    def start(self):
        """Start the station controller"""
        try:
            # Connect to MQTT
            self.mqtt.connect()
            
            # Start main loop
            self.running = True
            logger.info("✓ Station controller started\n")
            self.main_loop()
            
        except KeyboardInterrupt:
            logger.info("\n⚠️  Shutdown requested")
            self.stop()
        except Exception as e:
            logger.error(f"✗ Fatal error: {e}")
            self.mqtt.publish_error(str(e))
            self.stop()
    
    def main_loop(self):
        """Main monitoring loop"""
        last_heartbeat = time.time()
        
        while self.running:
            try:
                current_time = time.time()
                
                # Check bike presence
                bike_detected = self.sensor.is_bike_present()
                
                # Bike arrived
                if bike_detected and not self.bike_present:
                    logger.info("\n🚴 BIKE DETECTED!")
                    if self.sensor.wait_for_stable_detection():
                        self.handle_bike_arrival()
                
                # Bike removed
                elif not bike_detected and self.bike_present:
                    logger.info("\n🚴 BIKE REMOVED!")
                    self.handle_bike_removal()
                
                # Send heartbeat
                if current_time - last_heartbeat > Config.HEARTBEAT_INTERVAL:
                    heartbeat_payload = {
                        "eventType": "HEARTBEAT",
                        "stationId": Config.STATION_ID,
                        "dockId": Config.DOCK_ID,
                        "timestamp": datetime.now().isoformat(),
                        "uptime": round(current_time - self.start_time, 2)
                    }
                    self.mqtt.publish(Topics.HEARTBEAT, heartbeat_payload)
                    last_heartbeat = current_time
                
                # Sleep
                time.sleep(Config.POLLING_INTERVAL)
                
            except Exception as e:
                logger.error(f"✗ Main loop error: {e}")
                time.sleep(1)
    
    def handle_bike_arrival(self):
        """Handle bike arrival"""
        try:
            # Lock with retry
            attempts = 0
            success = False
            
            while attempts < Config.MAX_LOCK_ATTEMPTS and not success:
                success = self.motor.lock()
                attempts += 1
                
                if not success and attempts < Config.MAX_LOCK_ATTEMPTS:
                    logger.warning(f"⚠️  Lock attempt {attempts} failed, retrying...")
                    time.sleep(1)
            
            if success:
                self.bike_present = True
                self.mqtt.publish_bike_detected()
                self.mqtt.publish_lock_status(LockState.LOCKED, success=True)
                logger.info("✓ Bike secured\n")
            else:
                logger.error("✗ Failed to lock bike")
                self.mqtt.publish_lock_status(LockState.ERROR, success=False)
                self.mqtt.publish_error("Failed to lock bike")
                
        except Exception as e:
            logger.error(f"✗ Bike arrival error: {e}")
            self.mqtt.publish_error(str(e))
    
    def handle_bike_removal(self):
        """Handle bike removal"""
        try:
            self.bike_present = False
            self.mqtt.publish_bike_removed()
            self.mqtt.publish_status()
            logger.info("✓ Bike removal processed\n")
        except Exception as e:
            logger.error(f"✗ Bike removal error: {e}")
    
    def handle_unlock_command(self, data):
        """Handle unlock command"""
        try:
            logger.info("\n🔓 UNLOCK COMMAND RECEIVED")
            
            if not self.bike_present:
                logger.warning("⚠️  No bike to unlock")
                self.mqtt.publish_lock_status(LockState.ERROR, success=False)
                return
            
            success = self.motor.unlock()
            
            if success:
                self.mqtt.publish_lock_status(LockState.UNLOCKED, success=True)
                logger.info("✓ Bike unlocked - ready for user\n")
            else:
                logger.error("✗ Unlock failed")
                self.mqtt.publish_lock_status(LockState.ERROR, success=False)
                
        except Exception as e:
            logger.error(f"✗ Unlock error: {e}")
            self.mqtt.publish_error(str(e))
    
    def handle_lock_command(self, data):
        """Handle lock command"""
        try:
            logger.info("\n🔒 LOCK COMMAND RECEIVED")
            success = self.motor.lock()
            
            if success:
                self.mqtt.publish_lock_status(LockState.LOCKED, success=True)
                logger.info("✓ Bike locked\n")
            else:
                logger.error("✗ Lock failed")
                self.mqtt.publish_lock_status(LockState.ERROR, success=False)
                
        except Exception as e:
            logger.error(f"✗ Lock error: {e}")
    
    def stop(self):
        """Stop the controller"""
        logger.info("\nShutting down...")
        self.running = False
        
        try:
            self.motor.cleanup()
        except:
            pass
        
        try:
            self.mqtt.disconnect()
        except:
            pass
        
        try:
            GPIO.cleanup()
        except:
            pass
        
        logger.info("✓ Shutdown complete")
        logger.info("=" * 60 + "\n")

# ============================================================================
# ENTRY POINT
# ============================================================================

def main():
    """Main entry point"""
    try:
        controller = StationController()
        controller.start()
    except Exception as e:
        logger.error(f"✗ Failed to start: {e}")
        GPIO.cleanup()
        exit(1)

if __name__ == "__main__":
    main()