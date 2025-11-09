#!/usr/bin/env python3
"""
WOT Station Controller - Raspberry Pi 4
Manages bike detection (IR sensor) and locking mechanism (motor)
Communicates via MQTT with backend server
"""

import RPi.GPIO as GPIO
import paho.mqtt.client as mqtt
import json
import time
import logging
from datetime import datetime
from enum import Enum

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
    MQTT_BROKER = "broker.hivemq.com"  # Replace with your broker
    MQTT_PORT = 1883
    MQTT_USERNAME = None    # Add if needed
    MQTT_PASSWORD = None    # Add if needed
    MQTT_KEEPALIVE = 60
    
    # Sensor Settings
    IR_DEBOUNCE_TIME = 0.5  # Seconds to wait before confirming detection
    POLLING_INTERVAL = 0.1  # Check sensor every 100ms
    
    # Logging
    LOG_LEVEL = logging.INFO
    LOG_FILE = "/home/wot/wot-station/logs/station.log"

# ============================================================================
# ENUMS
# ============================================================================

class LockState(Enum):
    """Lock states"""
    LOCKED = "locked"
    UNLOCKED = "unlocked"
    LOCKING = "locking"
    UNLOCKING = "unlocking"
    ERROR = "error"

class BikeState(Enum):
    """Bike presence states"""
    PRESENT = "present"
    ABSENT = "absent"
    DETECTING = "detecting"

# ============================================================================
# LOGGING SETUP
# ============================================================================

def setup_logging():
    """Configure logging system"""
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
            logger.info(f"Motor initialized on GPIO pin {Config.MOTOR_PIN}")
        except Exception as e:
            logger.error(f"Motor setup failed: {e}")
            raise
    
    def lock(self):
        """Activate motor to lock position"""
        try:
            logger.info("Locking mechanism activating...")
            self.current_state = LockState.LOCKING
            
            # Move to lock position
            self.pwm.ChangeDutyCycle(Config.MOTOR_DUTY_LOCK)
            time.sleep(1)  # Wait for servo to reach position
            self.pwm.ChangeDutyCycle(0)  # Stop sending signal
            
            self.current_state = LockState.LOCKED
            logger.info("✓ Bike locked successfully")
            return True
            
        except Exception as e:
            logger.error(f"Lock failed: {e}")
            self.current_state = LockState.ERROR
            return False
    
    def unlock(self):
        """Activate motor to unlock position"""
        try:
            logger.info("Unlocking mechanism activating...")
            self.current_state = LockState.UNLOCKING
            
            # Move to unlock position
            self.pwm.ChangeDutyCycle(Config.MOTOR_DUTY_UNLOCK)
            time.sleep(1)  # Wait for servo to reach position
            self.pwm.ChangeDutyCycle(0)  # Stop sending signal
            
            self.current_state = LockState.UNLOCKED
            logger.info("✓ Bike unlocked successfully")
            return True
            
        except Exception as e:
            logger.error(f"Unlock failed: {e}")
            self.current_state = LockState.ERROR
            return False
    
    def get_state(self):
        """Get current lock state"""
        return self.current_state
    
    def cleanup(self):
        """Clean up motor resources"""
        if self.pwm:
            self.pwm.stop()
        logger.info("Motor controller cleaned up")

# ============================================================================
# IR SENSOR CONTROLLER
# ============================================================================

class IRSensorController:
    """Controls IR proximity sensor for bike detection"""
    
    def __init__(self):
        self.current_state = BikeState.ABSENT
        self.use_simulation = False  # Set to True for testing without sensor
        self.setup()
    
    def setup(self):
        """Initialize IR sensor GPIO"""
        try:
            GPIO.setup(Config.IR_SENSOR_PIN, GPIO.IN)
            logger.info(f"IR Sensor initialized on GPIO pin {Config.IR_SENSOR_PIN}")
            
            # Check if sensor is connected
            test_read = GPIO.input(Config.IR_SENSOR_PIN)
            logger.info(f"IR Sensor initial state: {test_read}")
            
        except Exception as e:
            logger.warning(f"IR Sensor setup warning: {e}")
            logger.info("Enabling simulation mode for testing")
            self.use_simulation = True
    
    def is_bike_present(self):
        """
        Check if bike is present
        IR Sensor logic: HIGH (1) = bike detected, LOW (0) = no bike
        """
        if self.use_simulation:
            # Simulation mode for testing without hardware
            return False  # Change to True to simulate bike presence
        
        try:
            # Read sensor state
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
        logger.info("Waiting for stable bike detection...")
        time.sleep(Config.IR_DEBOUNCE_TIME)
        
        # Check again after debounce time
        if self.is_bike_present():
            logger.info("✓ Bike presence confirmed")
            return True
        else:
            logger.info("✗ False detection, bike not stable")
            return False
    
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
        self.client = mqtt.Client(client_id=Config.STATION_ID)
        self.connected = False
        self.setup_callbacks()
    
    def setup_callbacks(self):
        """Setup MQTT callback functions"""
        self.client.on_connect = self.on_connect
        self.client.on_disconnect = self.on_disconnect
        self.client.on_message = self.on_message
        
        # Authentication if needed
        if Config.MQTT_USERNAME:
            self.client.username_pw_set(Config.MQTT_USERNAME, Config.MQTT_PASSWORD)
    
    def on_connect(self, client, userdata, flags, rc):
        """Callback when connected to MQTT broker"""
        if rc == 0:
            self.connected = True
            logger.info(f"✓ Connected to MQTT Broker: {Config.MQTT_BROKER}")
            
            # Subscribe to command topics
            self.client.subscribe(Topics.COMMAND_UNLOCK)
            self.client.subscribe(Topics.COMMAND_LOCK)
            self.client.subscribe(Topics.COMMAND_STATUS)
            
            logger.info(f"Subscribed to command topics")
            
            # Publish initial status
            self.publish_status()
            
        else:
            logger.error(f"✗ Connection failed with code {rc}")
            self.connected = False
    
    def on_disconnect(self, client, userdata, rc):
        """Callback when disconnected from MQTT broker"""
        self.connected = False
        if rc != 0:
            logger.warning(f"Unexpected disconnection. Code: {rc}")
        else:
            logger.info("Disconnected from MQTT broker")
    
    def on_message(self, client, userdata, msg):
        """Callback when message received from backend"""
        try:
            topic = msg.topic
            payload = msg.payload.decode()
            logger.info(f"Received: {topic} -> {payload}")
            
            # Parse JSON payload
            try:
                data = json.loads(payload)
            except json.JSONDecodeError:
                data = {"raw": payload}
            
            # Handle commands
            if topic == Topics.COMMAND_UNLOCK:
                self.station_controller.handle_unlock_command(data)
                
            elif topic == Topics.COMMAND_LOCK:
                self.station_controller.handle_lock_command(data)
                
            elif topic == Topics.COMMAND_STATUS:
                self.publish_status()
            
        except Exception as e:
            logger.error(f"Error processing message: {e}")
    
    def connect(self):
        """Connect to MQTT broker"""
        try:
            logger.info(f"Connecting to MQTT broker: {Config.MQTT_BROKER}:{Config.MQTT_PORT}")
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
            
            result = self.client.publish(topic, payload, qos=1)
            
            if result.rc == mqtt.MQTT_ERR_SUCCESS:
                logger.debug(f"Published to {topic}: {payload}")
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
            "stationId": Config.STATION_ID,
            "dockId": Config.DOCK_ID,
            "event": "bike_detected",
            "bikeId": bike_id,
            "timestamp": datetime.now().isoformat(),
            "lockState": self.station_controller.motor.get_state().value
        }
        self.publish(Topics.BIKE_DETECTED, payload)
    
    def publish_bike_removed(self):
        """Publish bike removal event"""
        payload = {
            "stationId": Config.STATION_ID,
            "dockId": Config.DOCK_ID,
            "event": "bike_removed",
            "timestamp": datetime.now().isoformat()
        }
        self.publish(Topics.BIKE_REMOVED, payload)
    
    def publish_lock_status(self, state, success=True):
        """Publish lock status change"""
        payload = {
            "stationId": Config.STATION_ID,
            "dockId": Config.DOCK_ID,
            "lockState": state.value,
            "success": success,
            "timestamp": datetime.now().isoformat()
        }
        self.publish(Topics.LOCK_STATUS, payload)
    
    def publish_status(self):
        """Publish current station status"""
        payload = {
            "stationId": Config.STATION_ID,
            "dockId": Config.DOCK_ID,
            "bikePresent": self.station_controller.sensor.is_bike_present(),
            "lockState": self.station_controller.motor.get_state().value,
            "timestamp": datetime.now().isoformat(),
            "uptime": time.time() - self.station_controller.start_time
        }
        self.publish(Topics.STATUS, payload)
    
    def publish_error(self, error_message):
        """Publish error event"""
        payload = {
            "stationId": Config.STATION_ID,
            "dockId": Config.DOCK_ID,
            "error": error_message,
            "timestamp": datetime.now().isoformat()
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
        
        # Initialize GPIO
        GPIO.setmode(GPIO.BCM)
        GPIO.setwarnings(False)
        
        # Initialize components
        logger.info("=" * 60)
        logger.info("WOT STATION CONTROLLER STARTING")
        logger.info(f"Station ID: {Config.STATION_ID}")
        logger.info(f"Dock ID: {Config.DOCK_ID}")
        logger.info("=" * 60)
        
        self.motor = MotorController()
        self.sensor = IRSensorController()
        self.mqtt = MQTTClient(self)
        
        logger.info("All components initialized successfully")
    
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
            logger.info("\nShutdown requested by user")
            self.stop()
        except Exception as e:
            logger.error(f"Fatal error: {e}")
            self.mqtt.publish_error(str(e))
            self.stop()
    
    def main_loop(self):
        """Main monitoring loop"""
        heartbeat_interval = 60  # Send heartbeat every 60 seconds
        last_heartbeat = time.time()
        
        while self.running:
            try:
                current_time = time.time()
                
                # Check bike presence
                bike_detected = self.sensor.is_bike_present()
                
                # Bike just arrived
                if bike_detected and not self.bike_present:
                    logger.info("🚲 BIKE DETECTED IN DOCK!")
                    
                    # Wait for stable detection
                    if self.sensor.wait_for_stable_detection():
                        self.handle_bike_arrival()
                
                # Bike just removed
                elif not bike_detected and self.bike_present:
                    logger.info("🚲 BIKE REMOVED FROM DOCK")
                    self.handle_bike_removal()
                
                # Send periodic heartbeat
                if current_time - last_heartbeat > heartbeat_interval:
                    self.mqtt.publish(Topics.HEARTBEAT, {
                        "stationId": Config.STATION_ID,
                        "timestamp": datetime.now().isoformat(),
                        "uptime": current_time - self.start_time
                    })
                    last_heartbeat = current_time
                
                # Sleep before next check
                time.sleep(Config.POLLING_INTERVAL)
                
            except Exception as e:
                logger.error(f"Error in main loop: {e}")
                time.sleep(1)  # Prevent rapid error loops
    
    def handle_bike_arrival(self):
        """Handle bike arrival at dock"""
        try:
            # Lock the bike
            success = self.motor.lock()
            
            if success:
                self.bike_present = True
                
                # Publish events
                self.mqtt.publish_bike_detected()
                self.mqtt.publish_lock_status(LockState.LOCKED, success=True)
                
                logger.info("✓ Bike arrival processed successfully")
            else:
                logger.error("✗ Failed to lock bike")
                self.mqtt.publish_lock_status(LockState.ERROR, success=False)
                
        except Exception as e:
            logger.error(f"Error handling bike arrival: {e}")
            self.mqtt.publish_error(f"Bike arrival error: {str(e)}")
    
    def handle_bike_removal(self):
        """Handle bike removal from dock"""
        try:
            self.bike_present = False
            
            # Publish removal event
            self.mqtt.publish_bike_removed()
            self.mqtt.publish_status()
            
            logger.info("✓ Bike removal processed")
            
        except Exception as e:
            logger.error(f"Error handling bike removal: {e}")
    
    def handle_unlock_command(self, data):
        """Handle unlock command from backend"""
        try:
            logger.info("📨 Unlock command received from backend")
            
            # Verify bike is present before unlocking
            if not self.bike_present:
                logger.warning("⚠️  No bike present to unlock")
                self.mqtt.publish_lock_status(LockState.ERROR, success=False)
                return
            
            # Unlock the bike
            success = self.motor.unlock()
            
            if success:
                self.mqtt.publish_lock_status(LockState.UNLOCKED, success=True)
                logger.info("✓ Bike unlocked - ready for user")
            else:
                logger.error("✗ Unlock failed")
                self.mqtt.publish_lock_status(LockState.ERROR, success=False)
                
        except Exception as e:
            logger.error(f"Error handling unlock command: {e}")
            self.mqtt.publish_error(f"Unlock error: {str(e)}")
    
    def handle_lock_command(self, data):
        """Handle lock command from backend"""
        try:
            logger.info("📨 Lock command received from backend")
            
            success = self.motor.lock()
            
            if success:
                self.mqtt.publish_lock_status(LockState.LOCKED, success=True)
            else:
                self.mqtt.publish_lock_status(LockState.ERROR, success=False)
                
        except Exception as e:
            logger.error(f"Error handling lock command: {e}")
    
    def stop(self):
        """Stop the station controller"""
        logger.info("Shutting down station controller...")
        self.running = False
        
        # Cleanup components
        self.motor.cleanup()
        self.mqtt.disconnect()
        GPIO.cleanup()
        
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