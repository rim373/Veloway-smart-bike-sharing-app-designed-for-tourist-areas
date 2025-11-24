import RPi.GPIO as GPIO
import paho.mqtt.client as mqtt
import json
import time
import logging
import os
from datetime import datetime
from enum import Enum
from pathlib import Path

# ============================================================================
# CONFIGURATION
# ============================================================================

class Config:
    """System configuration"""
    # Station Identity
    STATION_ID = "station_001"
    DOCK_ID = "dock_1"
    
    # GPIO Pins
    IR_SENSOR_PIN = 17      # BCM Pin 17 (Physical Pin 11)
    MOTOR_PIN = 18          # BCM Pin 18 (Physical Pin 12) - PWM capable
    
    # Motor Settings (Servo)
    MOTOR_FREQUENCY = 50    # 50Hz for standard servo
    LOCK_ANGLE = 90         # Degrees for locked position
    UNLOCK_ANGLE = 0        # Degrees for unlocked position
    MOTOR_DUTY_LOCK = 7.5   # Duty cycle for 90° (locked)
    MOTOR_DUTY_UNLOCK = 2.5 # Duty cycle for 0° (unlocked)
    
    # MQTT Settings
    MQTT_BROKER = "broker.hivemq.com"
    MQTT_PORT = 1883
    MQTT_USERNAME = None
    MQTT_PASSWORD = None
    MQTT_KEEPALIVE = 60
    MQTT_QOS = 1
    
    # Sensor Settings
    IR_DEBOUNCE_TIME = 0.5  # Seconds to wait before confirming detection
    POLLING_INTERVAL = 0.1  # Check sensor every 100ms
    
    # Simulation Mode (for testing without hardware)
    SIMULATE_SENSOR = False  # Set True to simulate IR sensor
    SIMULATE_MOTOR = False   # Set True to simulate motor
    
    # Logging
    LOG_LEVEL = logging.INFO
    LOG_DIR = os.path.expanduser("~/wot-station/logs")
    LOG_FILE = os.path.join(LOG_DIR, "station.log")
    
    # Heartbeat
    HEARTBEAT_INTERVAL = 60  # Send heartbeat every 60 seconds
    
    # Status monitoring
    MAX_LOCK_ATTEMPTS = 3    # Retry lock operation this many times
    MOTOR_TIMEOUT = 2        # Motor operation timeout (seconds)

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
    UNKNOWN = "UNKNOWN"

class BikeState(Enum):
    """Bike presence states"""
    PRESENT = "PRESENT"
    ABSENT = "ABSENT"
    DETECTING = "DETECTING"

# ============================================================================
# LOGGING SETUP
# ============================================================================

def setup_logging():
    """Configure logging system with auto-created directories"""
    # Create log directory if it doesn't exist
    log_dir = Path(Config.LOG_DIR)
    log_dir.mkdir(parents=True, exist_ok=True)
    
    # Configure logging
    logging.basicConfig(
        level=Config.LOG_LEVEL,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
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
    STATUS = f"{BASE}/status"
    BIKE_DETECTED = f"{BASE}/bike/detected"
    BIKE_REMOVED = f"{BASE}/bike/removed"
    LOCK_STATUS = f"{BASE}/lock/status"
    HEARTBEAT = f"{BASE}/heartbeat"
    ERROR = f"{BASE}/error"
    
    # Subscribing topics (Backend -> Station)
    COMMAND_UNLOCK = f"{BASE}/command/unlock"
    COMMAND_LOCK = f"{BASE}/command/lock"
    COMMAND_STATUS = f"{BASE}/command/status"
    COMMAND_REBOOT = f"{BASE}/command/reboot"

# ============================================================================
# MOTOR CONTROLLER
# ============================================================================

class MotorController:
    """Controls the locking motor (servo)"""
    
    def __init__(self):
        self.pwm = None
        self.current_state = LockState.UNKNOWN
        self.simulate = Config.SIMULATE_MOTOR
        self.setup()
    
    def setup(self):
        """Initialize motor GPIO"""
        if self.simulate:
            logger.info("  Motor in SIMULATION mode (no real hardware)")
            self.current_state = LockState.UNLOCKED
            return
        
        try:
            GPIO.setup(Config.MOTOR_PIN, GPIO.OUT)
            self.pwm = GPIO.PWM(Config.MOTOR_PIN, Config.MOTOR_FREQUENCY)
            self.pwm.start(0)
            self.current_state = LockState.UNLOCKED
            logger.info(f"✓ Motor initialized on GPIO pin {Config.MOTOR_PIN}")
        except Exception as e:
            logger.error(f" Motor setup failed: {e}")
            self.simulate = True
            logger.warning("Falling back to simulation mode")
    
    def lock(self):
        """Activate motor to lock position"""
        try:
            logger.info(" Locking mechanism activating...")
            self.current_state = LockState.LOCKING
            
            if self.simulate:
                time.sleep(1)  # Simulate motor movement
                self.current_state = LockState.LOCKED
                logger.info("✓ [SIMULATED] Bike locked")
                return True
            
            # Move to lock position
            self.pwm.ChangeDutyCycle(Config.MOTOR_DUTY_LOCK)
            time.sleep(Config.MOTOR_TIMEOUT)
            self.pwm.ChangeDutyCycle(0)
            
            self.current_state = LockState.LOCKED
            logger.info("✓ Bike locked successfully")
            return True
            
        except Exception as e:
            logger.error(f" Lock failed: {e}")
            self.current_state = LockState.ERROR
            return False
    
    def unlock(self):
        """Activate motor to unlock position"""
        try:
            logger.info(" Unlocking mechanism activating...")
            self.current_state = LockState.UNLOCKING
            
            if self.simulate:
                time.sleep(1)
                self.current_state = LockState.UNLOCKED
                logger.info("✓ [SIMULATED] Bike unlocked")
                return True
            
            # Move to unlock position
            self.pwm.ChangeDutyCycle(Config.MOTOR_DUTY_UNLOCK)
            time.sleep(Config.MOTOR_TIMEOUT)
            self.pwm.ChangeDutyCycle(0)
            
            self.current_state = LockState.UNLOCKED
            logger.info("✓ Bike unlocked successfully")
            return True
            
        except Exception as e:
            logger.error(f" Unlock failed: {e}")
            self.current_state = LockState.ERROR
            return False
    
    def get_state(self):
        """Get current lock state"""
        return self.current_state
    
    def cleanup(self):
        """Clean up motor resources"""
        if self.pwm and not self.simulate:
            try:
                self.pwm.stop()
                logger.info("Motor controller cleaned up")
            except:
                pass

# ============================================================================
# IR SENSOR CONTROLLER
# ============================================================================

class IRSensorController:
    """Controls IR proximity sensor for bike detection"""
    
    def __init__(self):
        self.current_state = BikeState.ABSENT
        self.simulate = Config.SIMULATE_SENSOR
        self.simulated_bike_present = False  # For manual testing
        self.setup()
    
    def setup(self):
        """Initialize IR sensor GPIO"""
        if self.simulate:
            logger.info("  IR Sensor in SIMULATION mode (no real hardware)")
            return
        
        try:
            GPIO.setup(Config.IR_SENSOR_PIN, GPIO.IN)
            test_read = GPIO.input(Config.IR_SENSOR_PIN)
            logger.info(f"✓ IR Sensor initialized on GPIO {Config.IR_SENSOR_PIN}")
            logger.info(f"  Initial state: {test_read}")
            
        except Exception as e:
            logger.warning(f"  IR Sensor setup failed: {e}")
            logger.info("Falling back to simulation mode")
            self.simulate = True
    
    def is_bike_present(self):
        """
        Check if bike is present
        IR Sensor logic: HIGH (1) = bike detected, LOW (0) = no bike
        """
        if self.simulate:
            return self.simulated_bike_present
        
        try:
            sensor_state = GPIO.input(Config.IR_SENSOR_PIN)
            return sensor_state == GPIO.HIGH
        except Exception as e:
            logger.error(f"Error reading IR sensor: {e}")
            return False
    
    def wait_for_stable_detection(self):
        """
        Wait for stable bike detection (debouncing)
        Returns True if bike is stably detected
        """
        logger.info(" Waiting for stable bike detection...")
        time.sleep(Config.IR_DEBOUNCE_TIME)
        
        if self.is_bike_present():
            logger.info("✓ Bike presence confirmed")
            return True
        else:
            logger.info("✗ False detection, bike not stable")
            return False
    
    def simulate_bike_arrival(self):
        """For testing: simulate bike arrival"""
        if self.simulate:
            self.simulated_bike_present = True
            logger.info(" [TEST] Simulating bike arrival")
    
    def simulate_bike_removal(self):
        """For testing: simulate bike removal"""
        if self.simulate:
            self.simulated_bike_present = False
            logger.info(" [TEST] Simulating bike removal")
    
    def get_state(self):
        """Get current bike presence state"""
        return self.current_state

# ============================================================================
# MQTT CLIENT
# ============================================================================

class MQTTClient:
    """Handles MQTT communication with backend"""
    
    def __init__(self, station_controller):
        self.station_controller = station_controller
        self.client = mqtt.Client(
            client_id=f"{Config.STATION_ID}_{int(time.time())}",
            protocol=mqtt.MQTTv311
        )
        self.connected = False
        self.setup_callbacks()
    
    def setup_callbacks(self):
        """Setup MQTT callback functions"""
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
            topics = [
                Topics.COMMAND_UNLOCK,
                Topics.COMMAND_LOCK,
                Topics.COMMAND_STATUS,
                Topics.COMMAND_REBOOT
            ]
            
            for topic in topics:
                self.client.subscribe(topic, qos=Config.MQTT_QOS)
                logger.info(f"  Subscribed to: {topic}")
            
            # Publish initial status
            self.publish_status()
            
        else:
            logger.error(f" MQTT connection failed with code {rc}")
            self.connected = False
    
    def on_disconnect(self, client, userdata, rc):
        """Callback when disconnected from MQTT broker"""
        self.connected = False
        if rc != 0:
            logger.warning(f"  Unexpected disconnection. Code: {rc}")
        else:
            logger.info("Disconnected from MQTT broker")
    
    def on_message(self, client, userdata, msg):
        """Callback when message received from backend"""
        try:
            topic = msg.topic
            payload = msg.payload.decode()
            logger.info(f" Received: {topic}")
            
            # Parse JSON payload
            try:
                data = json.loads(payload) if payload else {}
            except json.JSONDecodeError:
                data = {"raw": payload}
            
            # Handle commands
            if topic == Topics.COMMAND_UNLOCK:
                self.station_controller.handle_unlock_command(data)
                
            elif topic == Topics.COMMAND_LOCK:
                self.station_controller.handle_lock_command(data)
                
            elif topic == Topics.COMMAND_STATUS:
                self.publish_status()
                
            elif topic == Topics.COMMAND_REBOOT:
                logger.warning("  Reboot command received")
                self.station_controller.request_shutdown()
            
        except Exception as e:
            logger.error(f"Error processing message: {e}")
    
    def connect(self):
        """Connect to MQTT broker"""
        try:
            logger.info(f"Connecting to MQTT: {Config.MQTT_BROKER}:{Config.MQTT_PORT}")
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
            logger.error(f"MQTT connection failed: {e}")
            raise
    
    def publish(self, topic, payload):
        """Publish message to MQTT broker"""
        try:
            if isinstance(payload, dict):
                payload = json.dumps(payload)
            
            result = self.client.publish(topic, payload, qos=Config.MQTT_QOS)
            
            if result.rc == mqtt.MQTT_ERR_SUCCESS:
                logger.debug(f" Published to {topic}")
                return True
            else:
                logger.error(f"Publish failed to {topic}")
                return False
                
        except Exception as e:
            logger.error(f"Publish error: {e}")
            return False
    
    def publish_bike_detected(self, bike_id=None):
        """Publish bike detection event"""
        payload = {
            "eventType": "BIKE_DETECTED",
            "stationId": Config.STATION_ID,
            "dockId": Config.DOCK_ID,
            "bikeId": bike_id,
            "lockStatus": self.station_controller.motor.get_state().value,
            "timestamp": datetime.now().isoformat(),
            "metadata": {
                "source": "iot_station",
                "version": "1.1",
                "simulation": Config.SIMULATE_SENSOR or Config.SIMULATE_MOTOR
            }
        }
        self.publish(Topics.BIKE_DETECTED, payload)
    
    def publish_bike_removed(self):
        """Publish bike removal event"""
        payload = {
            "eventType": "BIKE_REMOVED",
            "stationId": Config.STATION_ID,
            "dockId": Config.DOCK_ID,
            "timestamp": datetime.now().isoformat(),
            "metadata": {
                "source": "iot_station",
                "version": "1.1"
            }
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
            "timestamp": datetime.now().isoformat(),
            "metadata": {
                "source": "iot_station",
                "version": "1.1"
            }
        }
        self.publish(Topics.LOCK_STATUS, payload)
    
    def publish_status(self):
        """Publish current station status"""
        payload = {
            "eventType": "STATION_STATUS",
            "stationId": Config.STATION_ID,
            "dockId": Config.DOCK_ID,
            "status": {
                "bikePresent": self.station_controller.sensor.is_bike_present(),
                "lockState": self.station_controller.motor.get_state().value,
                "operational": True,
                "uptime": round(time.time() - self.station_controller.start_time, 2),
                "simulation": {
                    "sensor": Config.SIMULATE_SENSOR,
                    "motor": Config.SIMULATE_MOTOR
                }
            },
            "timestamp": datetime.now().isoformat(),
            "metadata": {
                "source": "iot_station",
                "version": "1.1"
            }
        }
        self.publish(Topics.STATUS, payload)
    
    def publish_error(self, error_message):
        """Publish error event"""
        payload = {
            "eventType": "ERROR",
            "stationId": Config.STATION_ID,
            "dockId": Config.DOCK_ID,
            "error": {
                "message": error_message,
                "severity": "HIGH"
            },
            "timestamp": datetime.now().isoformat(),
            "metadata": {
                "source": "iot_station",
                "version": "1.1"
            }
        }
        self.publish(Topics.ERROR, payload)
    
    def disconnect(self):
        """Disconnect from MQTT broker"""
        self.client.loop_stop()
        self.client.disconnect()
        logger.info("MQTT client disconnected")

# ============================================================================
# MAIN STATION CONTROLLER
# ============================================================================

class StationController:
    """Main controller orchestrating all components"""
    
    def __init__(self):
        self.start_time = time.time()
        self.running = False
        self.bike_present = False
        self.shutdown_requested = False
        
        # Initialize GPIO
        GPIO.setmode(GPIO.BCM)
        GPIO.setwarnings(False)
        
        # Print startup banner
        self.print_banner()
        
        # Initialize components
        self.motor = MotorController()
        self.sensor = IRSensorController()
        self.mqtt = MQTTClient(self)
        
        logger.info("✓ All components initialized successfully")
    
    def print_banner(self):
        """Print startup banner"""
        logger.info("=" * 60)
        logger.info("WOT BIKE STATION CONTROLLER v1.1")
        logger.info(f"Station ID: {Config.STATION_ID}")
        logger.info(f"Dock ID: {Config.DOCK_ID}")
        logger.info(f"Mode: {'SIMULATION' if (Config.SIMULATE_SENSOR or Config.SIMULATE_MOTOR) else 'PRODUCTION'}")
        logger.info("=" * 60)
    
    def start(self):
        """Start the station controller"""
        try:
            # Connect to MQTT
            self.mqtt.connect()
            
            # Start main loop
            self.running = True
            logger.info("✓ Station controller started - monitoring for bikes...")
            self.main_loop()
            
        except KeyboardInterrupt:
            logger.info("\n  Shutdown requested by user")
            self.stop()
        except Exception as e:
            logger.error(f" Fatal error: {e}")
            self.mqtt.publish_error(str(e))
            self.stop()
    
    def main_loop(self):
        """Main monitoring loop"""
        last_heartbeat = time.time()
        
        while self.running and not self.shutdown_requested:
            try:
                current_time = time.time()
                
                # Check bike presence
                bike_detected = self.sensor.is_bike_present()
                
                # Bike just arrived
                if bike_detected and not self.bike_present:
                    logger.info(" BIKE DETECTED IN DOCK!")
                    
                    if self.sensor.wait_for_stable_detection():
                        self.handle_bike_arrival()
                
                # Bike just removed
                elif not bike_detected and self.bike_present:
                    logger.info(" BIKE REMOVED FROM DOCK")
                    self.handle_bike_removal()
                
                # Send periodic heartbeat
                if current_time - last_heartbeat > Config.HEARTBEAT_INTERVAL:
                    heartbeat_payload = {
                        "eventType": "HEARTBEAT",
                        "stationId": Config.STATION_ID,
                        "dockId": Config.DOCK_ID,
                        "timestamp": datetime.now().isoformat(),
                        "uptime": round(current_time - self.start_time, 2),
                        "metadata": {
                            "source": "iot_station",
                            "version": "1.1"
                        }
                    }
                    self.mqtt.publish(Topics.HEARTBEAT, heartbeat_payload)
                    last_heartbeat = current_time
                    logger.debug(" Heartbeat sent")
                
                # Sleep before next check
                time.sleep(Config.POLLING_INTERVAL)
                
            except Exception as e:
                logger.error(f"Error in main loop: {e}")
                time.sleep(1)
    
    def handle_bike_arrival(self):
        """Handle bike arrival at dock"""
        try:
            # Lock the bike with retry logic
            attempts = 0
            success = False
            
            while attempts < Config.MAX_LOCK_ATTEMPTS and not success:
                success = self.motor.lock()
                attempts += 1
                
                if not success and attempts < Config.MAX_LOCK_ATTEMPTS:
                    logger.warning(f"  Lock attempt {attempts} failed, retrying...")
                    time.sleep(1)
            
            if success:
                self.bike_present = True
                self.mqtt.publish_bike_detected()
                self.mqtt.publish_lock_status(LockState.LOCKED, success=True)
                logger.info("✓ Bike arrival processed successfully")
            else:
                logger.error(" Failed to lock bike after all attempts")
                self.mqtt.publish_lock_status(LockState.ERROR, success=False)
                self.mqtt.publish_error("Failed to lock bike after multiple attempts")
                
        except Exception as e:
            logger.error(f"Error handling bike arrival: {e}")
            self.mqtt.publish_error(f"Bike arrival error: {str(e)}")
    
    def handle_bike_removal(self):
        """Handle bike removal from dock"""
        try:
            self.bike_present = False
            self.mqtt.publish_bike_removed()
            self.mqtt.publish_status()
            logger.info(" Bike removal processed")
            
        except Exception as e:
            logger.error(f"Error handling bike removal: {e}")
    
    def handle_unlock_command(self, data):
        """Handle unlock command from backend"""
        try:
            logger.info(" Unlock command received from backend")
            
            # Check if bike is present
            if not self.bike_present:
                logger.warning("  No bike present to unlock")
                self.mqtt.publish_lock_status(LockState.ERROR, success=False)
                return
            
            # Unlock the bike
            success = self.motor.unlock()
            
            if success:
                self.mqtt.publish_lock_status(LockState.UNLOCKED, success=True)
                logger.info("✓ Bike unlocked - ready for user")
            else:
                logger.error(" Unlock failed")
                self.mqtt.publish_lock_status(LockState.ERROR, success=False)
                
        except Exception as e:
            logger.error(f"Error handling unlock command: {e}")
            self.mqtt.publish_error(f"Unlock error: {str(e)}")
    
    def handle_lock_command(self, data):
        """Handle lock command from backend"""
        try:
            logger.info(" Lock command received from backend")
            
            success = self.motor.lock()
            
            if success:
                self.mqtt.publish_lock_status(LockState.LOCKED, success=True)
                logger.info("✓ Manual lock successful")
            else:
                logger.error(" Manual lock failed")
                self.mqtt.publish_lock_status(LockState.ERROR, success=False)
                
        except Exception as e:
            logger.error(f"Error handling lock command: {e}")
    
    def request_shutdown(self):
        """Request graceful shutdown"""
        logger.info("  Shutdown requested")
        self.shutdown_requested = True
    
    def stop(self):
        """Stop the station controller"""
        logger.info("Shutting down station controller...")
        self.running = False
        
        # Cleanup components
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
        
        logger.info("✓ Station controller stopped")
        logger.info("=" * 60)

# ============================================================================
# ENTRY POINT
# ============================================================================

def main():
    """Main entry point"""
    try:
        controller = StationController()
        controller.start()
    except Exception as e:
        logger.error(f"Failed to start controller: {e}")
        GPIO.cleanup()
        exit(1)

if __name__ == "__main__":
    main()