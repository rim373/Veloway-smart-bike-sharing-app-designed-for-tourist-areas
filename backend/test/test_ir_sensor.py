import RPi.GPIO as GPIO
import time
from datetime import datetime

# Configuration
IR_SENSOR_PIN = 17  # BCM Pin 17 (Physical Pin 11)
TEST_DURATION = 30  # Run test for 30 seconds

# Setup GPIO
GPIO.setmode(GPIO.BCM)
GPIO.setwarnings(False)
GPIO.setup(IR_SENSOR_PIN, GPIO.IN)

print("=" * 60)
print("IR PROXIMITY SENSOR TEST")
print("=" * 60)
print(f"GPIO Pin: {IR_SENSOR_PIN} (BCM)")
print(f"Test Duration: {TEST_DURATION} seconds")
print("")
print("Sensor Logic:")
print("  HIGH (1) = Object detected (bike present)")
print("  LOW (0)  = No object (bike absent)")
print("")
print("Put your hand or an object near the sensor to test!")
print("=" * 60)
print("")

try:
    # Initial state
    last_state = GPIO.input(IR_SENSOR_PIN)
    print(f"[{datetime.now().strftime('%H:%M:%S')}] Initial state: {'DETECTED' if last_state else 'CLEAR'}")
    print("")
    
    detection_count = 0
    start_time = time.time()
    
    # Monitor for changes
    while (time.time() - start_time) < TEST_DURATION:
        current_state = GPIO.input(IR_SENSOR_PIN)
        
        # State changed?
        if current_state != last_state:
            timestamp = datetime.now().strftime('%H:%M:%S.%f')[:-3]
            
            if current_state == GPIO.HIGH:
                detection_count += 1
                print(f"🚲 [{timestamp}] BIKE DETECTED! (Count: {detection_count})")
            else:
                print(f"✓ [{timestamp}] Bike removed / Clear")
            
            last_state = current_state
        
        time.sleep(0.1)  # Check every 100ms
    
    # Test summary
    print("")
    print("=" * 60)
    print("TEST COMPLETE")
    print("=" * 60)
    print(f"Total detections: {detection_count}")
    print(f"Final state: {'DETECTED' if last_state else 'CLEAR'}")
    
    if detection_count > 0:
        print("\n IR sensor is working correctly!")
    else:
        print("\n  No detections recorded. Check:")
        print("   1. Sensor wiring (VCC, GND, OUT)")
        print("   2. Sensor has power (LED should be on)")
        print("   3. Sensor range (usually 2-30cm)")
        print("   4. Try adjusting sensitivity potentiometer")
    
except KeyboardInterrupt:
    print("\n\nTest stopped by user")
    
except Exception as e:
    print(f"\n Error: {e}")
    
finally:
    GPIO.cleanup()
    print("\nGPIO cleaned up. Goodbye!")