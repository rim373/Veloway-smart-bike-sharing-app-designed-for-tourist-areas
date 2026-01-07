import RPi.GPIO as GPIO
import time
import sys
from datetime import datetime
from statistics import mean, stdev

# ============================================================================
# CONFIGURATION
# ============================================================================

class Config:
    """Sensor configuration"""
    TRIG_PIN = 23              # BCM Pin 23 - Trigger
    ECHO_PIN = 24              # BCM Pin 24 - Echo (with voltage divider!)
    MEASUREMENT_TIMEOUT = 0.05 # 50ms timeout (~8.5m max distance)
    MAX_DISTANCE = 400         # Maximum valid distance (cm)
    MIN_DISTANCE = 2           # Minimum valid distance (cm)
    SPEED_OF_SOUND = 34300     # Speed of sound in cm/s at 20°C

# ============================================================================
# SENSOR CLASS
# ============================================================================

class UltrasonicSensor:
    """HC-SR04 Ultrasonic Sensor Controller"""
    
    def __init__(self, trig_pin, echo_pin):
        self.trig_pin = trig_pin
        self.echo_pin = echo_pin
        self.setup()
    
    def setup(self):
        """Initialize GPIO pins"""
        GPIO.setmode(GPIO.BCM)
        GPIO.setwarnings(False)
        GPIO.setup(self.trig_pin, GPIO.OUT)
        GPIO.setup(self.echo_pin, GPIO.IN)
        
        # Ensure trigger is low
        GPIO.output(self.trig_pin, False)
        time.sleep(0.1)
        
        print("✓ GPIO initialized")
        print(f"  TRIG: GPIO {self.trig_pin}")
        print(f"  ECHO: GPIO {self.echo_pin}")
    
    def measure_distance(self):
        """
        Measure distance in centimeters
        
        Returns:
            float: Distance in cm, or None if measurement failed
        """
        try:
            # Send 10µs trigger pulse
            GPIO.output(self.trig_pin, True)
            time.sleep(0.00001)  # 10 microseconds
            GPIO.output(self.trig_pin, False)
            
            # Wait for echo to start (ECHO goes HIGH)
            timeout_start = time.time()
            pulse_start = timeout_start
            
            while GPIO.input(self.echo_pin) == 0:
                pulse_start = time.time()
                if pulse_start - timeout_start > Config.MEASUREMENT_TIMEOUT:
                    return None  # Timeout - no echo start detected
            
            # Wait for echo to end (ECHO goes LOW)
            timeout_start = time.time()
            pulse_end = timeout_start
            
            while GPIO.input(self.echo_pin) == 1:
                pulse_end = time.time()
                if pulse_end - timeout_start > Config.MEASUREMENT_TIMEOUT:
                    return None  # Timeout - no echo end detected
            
            # Calculate distance
            pulse_duration = pulse_end - pulse_start
            distance = (pulse_duration * Config.SPEED_OF_SOUND) / 2
            
            # Validate reading
            if distance < Config.MIN_DISTANCE or distance > Config.MAX_DISTANCE:
                return None
            
            return round(distance, 2)
        
        except Exception as e:
            print(f"✗ Measurement error: {e}")
            return None
    
    def cleanup(self):
        """Clean up GPIO"""
        GPIO.cleanup()

# ============================================================================
# TEST MODES
# ============================================================================

def test_single_reading(sensor):
    """Test Mode 1: Single reading"""
    print("\n" + "="*60)
    print("TEST 1: Single Reading")
    print("="*60)
    
    distance = sensor.measure_distance()
    
    if distance is not None:
        print(f"✓ Distance: {distance} cm")
        return True
    else:
        print("✗ Measurement failed (timeout or out of range)")
        return False


def test_continuous_reading(sensor, duration=10):
    """Test Mode 2: Continuous readings"""
    print("\n" + "="*60)
    print(f"TEST 2: Continuous Reading ({duration} seconds)")
    print("="*60)
    print("Press Ctrl+C to stop early\n")
    
    readings = []
    start_time = time.time()
    count = 0
    
    try:
        while (time.time() - start_time) < duration:
            distance = sensor.measure_distance()
            count += 1
            
            if distance is not None:
                readings.append(distance)
                timestamp = datetime.now().strftime("%H:%M:%S.%f")[:-3]
                print(f"[{timestamp}] Reading #{count}: {distance:7.2f} cm")
            else:
                print(f"[{count}] ✗ Failed reading")
            
            time.sleep(0.5)  # Read every 500ms
    
    except KeyboardInterrupt:
        print("\n\n⚠️  Stopped by user")
    
    # Statistics
    if readings:
        print(f"\n{'─'*60}")
        print("Statistics:")
        print(f"  Total readings:    {count}")
        print(f"  Successful:        {len(readings)}")
        print(f"  Failed:            {count - len(readings)}")
        print(f"  Success rate:      {(len(readings)/count)*100:.1f}%")
        print(f"  Average distance:  {mean(readings):.2f} cm")
        print(f"  Min distance:      {min(readings):.2f} cm")
        print(f"  Max distance:      {max(readings):.2f} cm")
        if len(readings) > 1:
            print(f"  Std deviation:     {stdev(readings):.2f} cm")
        return True
    else:
        print("\n✗ No successful readings!")
        return False


def test_object_detection(sensor, threshold=50):
    """Test Mode 3: Object detection (simulates bike detection)"""
    print("\n" + "="*60)
    print(f"TEST 3: Object Detection (Threshold: {threshold} cm)")
    print("="*60)
    print("Move your hand closer/farther from sensor")
    print("Press Ctrl+C to stop\n")
    
    last_state = None
    
    try:
        while True:
            distance = sensor.measure_distance()
            
            if distance is not None:
                detected = distance < threshold
                timestamp = datetime.now().strftime("%H:%M:%S")
                
                # Visual bar
                bar_length = int(min(distance / 2, 40))
                bar = "█" * bar_length
                
                status = "🚴 DETECTED" if detected else "⚪ EMPTY"
                
                # Only print on state change or every 2 seconds
                if detected != last_state:
                    print(f"\n[{timestamp}] {status}")
                    print(f"  Distance: {distance:6.2f} cm")
                    print(f"  [{bar}")
                    last_state = detected
                else:
                    # Update same line
                    print(f"\r[{timestamp}] {status} | {distance:6.2f} cm | {bar:<40}", end="")
            
            time.sleep(0.3)
    
    except KeyboardInterrupt:
        print("\n\n⚠️  Test stopped")
        return True


def test_accuracy(sensor, known_distance=None):
    """Test Mode 4: Accuracy test with known distance"""
    print("\n" + "="*60)
    print("TEST 4: Accuracy Test")
    print("="*60)
    
    if known_distance is None:
        try:
            known_distance = float(input("Enter known distance in cm (measure with ruler): "))
        except ValueError:
            print("✗ Invalid input")
            return False
    
    print(f"\nMeasuring object at {known_distance} cm...")
    print("Taking 20 samples...\n")
    
    readings = []
    for i in range(20):
        distance = sensor.measure_distance()
        if distance is not None:
            readings.append(distance)
            error = distance - known_distance
            print(f"  Sample {i+1:2d}: {distance:7.2f} cm  (error: {error:+6.2f} cm)")
        else:
            print(f"  Sample {i+1:2d}: FAILED")
        time.sleep(0.2)
    
    if readings:
        avg = mean(readings)
        error = avg - known_distance
        error_percent = (abs(error) / known_distance) * 100
        
        print(f"\n{'─'*60}")
        print("Results:")
        print(f"  Known distance:    {known_distance:.2f} cm")
        print(f"  Measured average:  {avg:.2f} cm")
        print(f"  Error:             {error:+.2f} cm ({error_percent:.1f}%)")
        print(f"  Min reading:       {min(readings):.2f} cm")
        print(f"  Max reading:       {max(readings):.2f} cm")
        print(f"  Range:             {max(readings) - min(readings):.2f} cm")
        if len(readings) > 1:
            print(f"  Std deviation:     {stdev(readings):.2f} cm")
        
        # Accuracy verdict
        if error_percent < 2:
            print(f"\n✓ EXCELLENT accuracy (< 2% error)")
        elif error_percent < 5:
            print(f"\n✓ GOOD accuracy (< 5% error)")
        elif error_percent < 10:
            print(f"\n⚠️  ACCEPTABLE accuracy (< 10% error)")
        else:
            print(f"\n✗ POOR accuracy (> 10% error)")
            print("  Check wiring and voltage divider!")
        
        return True
    else:
        print("\n✗ All readings failed!")
        return False


def test_response_time(sensor):
    """Test Mode 5: Response time test"""
    print("\n" + "="*60)
    print("TEST 5: Response Time Test")
    print("="*60)
    print("Measuring sensor response time...\n")
    
    times = []
    
    for i in range(10):
        start = time.time()
        distance = sensor.measure_distance()
        elapsed = (time.time() - start) * 1000  # Convert to milliseconds
        
        if distance is not None:
            times.append(elapsed)
            print(f"  Measurement {i+1:2d}: {elapsed:6.2f} ms  ({distance:.2f} cm)")
        else:
            print(f"  Measurement {i+1:2d}: FAILED")
        
        time.sleep(0.1)
    
    if times:
        print(f"\n{'─'*60}")
        print("Response Time Statistics:")
        print(f"  Average:     {mean(times):.2f} ms")
        print(f"  Min:         {min(times):.2f} ms")
        print(f"  Max:         {max(times):.2f} ms")
        if len(times) > 1:
            print(f"  Std dev:     {stdev(times):.2f} ms")
        
        # Performance verdict
        avg_time = mean(times)
        if avg_time < 30:
            print("\n✓ EXCELLENT response time (< 30ms)")
        elif avg_time < 60:
            print("\n✓ GOOD response time (< 60ms)")
        else:
            print("\n  SLOW response time (> 60ms)")
        
        return True
    else:
        print("\n✗ All measurements failed!")
        return False


def test_range_scan(sensor):
    """Test Mode 6: Range capability test"""
    print("\n" + "="*60)
    print("TEST 6: Range Capability Test")
    print("="*60)
    print("This test checks sensor performance at different distances")
    print("\nInstructions:")
    print("  1. Start with object VERY CLOSE (5-10 cm)")
    print("  2. Gradually move object AWAY")
    print("  3. Stop when sensor can no longer detect\n")
    print("Press Enter to start, Ctrl+C to stop\n")
    
    input("Press Enter to begin...")
    
    min_detected = None
    max_detected = None
    readings = []
    
    try:
        while True:
            distance = sensor.measure_distance()
            
            if distance is not None:
                readings.append(distance)
                
                if min_detected is None or distance < min_detected:
                    min_detected = distance
                if max_detected is None or distance > max_detected:
                    max_detected = distance
                
                # Visual indicator
                print(f"\rDistance: {distance:7.2f} cm | Min: {min_detected:7.2f} cm | Max: {max_detected:7.2f} cm", end="")
            else:
                print(f"\r✗ OUT OF RANGE (last: {max_detected:.2f} cm)" + " "*20, end="")
            
            time.sleep(0.2)
    
    except KeyboardInterrupt:
        print("\n\n  Test stopped")
    
    if readings:
        print(f"\n\n{'─'*60}")
        print("Range Test Results:")
        print(f"  Minimum detection:  {min_detected:.2f} cm")
        print(f"  Maximum detection:  {max_detected:.2f} cm")
        print(f"  Range span:         {max_detected - min_detected:.2f} cm")
        print(f"  Total readings:     {len(readings)}")
        
        # HC-SR04 specs: 2cm - 400cm
        print(f"\n  Sensor specifications: 2 cm - 400 cm")
        if max_detected > 200:
            print("  ✓ Good long-range performance")
        elif max_detected > 100:
            print("    Limited range (consider checking power supply)")
        else:
            print("  ✗ Poor range (check wiring!)")
        
        return True
    else:
        print("\n✗ No readings recorded!")
        return False


def diagnostic_test(sensor):
    """Test Mode 7: Diagnostic test"""
    print("\n" + "="*60)
    print("TEST 7: Diagnostic Test")
    print("="*60)
    print("Running comprehensive diagnostics...\n")
    
    # Test 1: GPIO State
    print("1. GPIO Pin States:")
    trig_state = GPIO.input(sensor.trig_pin)
    echo_state = GPIO.input(sensor.echo_pin)
    print(f"   TRIG (GPIO {sensor.trig_pin}): {'HIGH' if trig_state else 'LOW'}")
    print(f"   ECHO (GPIO {sensor.echo_pin}): {'HIGH' if echo_state else 'LOW'}")
    
    if trig_state:
        print("     Warning: TRIG should normally be LOW")
    
    # Test 2: Trigger Response
    print("\n2. Testing Trigger Response:")
    GPIO.output(sensor.trig_pin, True)
    time.sleep(0.00001)
    GPIO.output(sensor.trig_pin, False)
    
    # Check if ECHO responds
    timeout = time.time() + 0.1
    echo_went_high = False
    
    while time.time() < timeout:
        if GPIO.input(sensor.echo_pin) == 1:
            echo_went_high = True
            break
        time.sleep(0.0001)
    
    if echo_went_high:
        print("   ✓ ECHO responds to trigger")
    else:
        print("   ✗ ECHO not responding!")
        print("   → Check wiring")
        print("   → Check voltage divider")
        print("   → Check sensor power")
    
    # Test 3: Multiple Readings
    print("\n3. Testing Reading Consistency:")
    successes = 0
    failures = 0
    
    for i in range(10):
        distance = sensor.measure_distance()
        if distance is not None:
            successes += 1
        else:
            failures += 1
        time.sleep(0.1)
    
    print(f"   Successful: {successes}/10")
    print(f"   Failed:     {failures}/10")
    
    if successes >= 8:
        print("   ✓ Sensor working reliably")
    elif successes >= 5:
        print("     Sensor working but unstable")
    else:
        print("   ✗ Sensor not working properly")
    
    # Test 4: Voltage Check Reminder
    print("\n4. Voltage Check:")
    print("     Use multimeter to verify:")
    print("   • VCC pin: Should read ~5V")
    print("   • ECHO pin (before divider): Should read 0V-5V")
    print("   • ECHO pin (after divider): Should read 0V-3.3V")
    print("   • GND pin: Should read 0V")
    
    return True


# ============================================================================
# MAIN MENU
# ============================================================================

def print_menu():
    """Display test menu"""
    print("\n" + "="*60)
    print("HC-SR04 ULTRASONIC SENSOR TEST MENU")
    print("="*60)
    print()
    print("  1. Single Reading Test")
    print("  2. Continuous Reading Test (10 seconds)")
    print("  3. Object Detection Test (bike simulation)")
    print("  4. Accuracy Test (with known distance)")
    print("  5. Response Time Test")
    print("  6. Range Capability Test")
    print("  7. Diagnostic Test")
    print("  8. Run All Tests")
    print()
    print("  0. Exit")
    print()


def run_all_tests(sensor):
    """Run all tests sequentially"""
    print("\n" + "="*60)
    print("RUNNING ALL TESTS")
    print("="*60)
    
    tests = [
        ("Single Reading", lambda: test_single_reading(sensor)),
        ("Continuous Reading", lambda: test_continuous_reading(sensor, 5)),
        ("Response Time", lambda: test_response_time(sensor)),
        ("Diagnostic", lambda: diagnostic_test(sensor)),
    ]
    
    results = []
    
    for name, test_func in tests:
        print(f"\n\nRunning: {name}...")
        time.sleep(1)
        try:
            result = test_func()
            results.append((name, result))
        except Exception as e:
            print(f"✗ Test failed with error: {e}")
            results.append((name, False))
    
    # Summary
    print("\n\n" + "="*60)
    print("TEST SUMMARY")
    print("="*60)
    
    for name, result in results:
        status = "✓ PASSED" if result else "✗ FAILED"
        print(f"  {name:<25} {status}")
    
    passed = sum(1 for _, r in results if r)
    print(f"\n  Total: {passed}/{len(results)} tests passed")


def main():
    """Main program"""
    print("\n" + "="*60)
    print("HC-SR04 ULTRASONIC SENSOR TEST PROGRAM")
    print("="*60)
    print()
    print("  IMPORTANT: Ensure voltage divider is connected to ECHO pin!")
    print("   ECHO outputs 5V but Pi GPIO accepts max 3.3V")
    print()
    
    # Initialize sensor
    try:
        sensor = UltrasonicSensor(Config.TRIG_PIN, Config.ECHO_PIN)
    except Exception as e:
        print(f"\n✗ Failed to initialize sensor: {e}")
        print("  Check that you're running with sudo: sudo python3 test_hcsr04_sensor.py")
        sys.exit(1)
    
    # Main loop
    try:
        while True:
            print_menu()
            choice = input("Select test (0-8): ").strip()
            
            if choice == "0":
                print("\nExiting...")
                break
            elif choice == "1":
                test_single_reading(sensor)
            elif choice == "2":
                test_continuous_reading(sensor)
            elif choice == "3":
                test_object_detection(sensor)
            elif choice == "4":
                test_accuracy(sensor)
            elif choice == "5":
                test_response_time(sensor)
            elif choice == "6":
                test_range_scan(sensor)
            elif choice == "7":
                diagnostic_test(sensor)
            elif choice == "8":
                run_all_tests(sensor)
            else:
                print("\n✗ Invalid choice!")
            
            input("\nPress Enter to continue...")
    
    except KeyboardInterrupt:
        print("\n\n  Program interrupted by user")
    
    finally:
        print("\nCleaning up GPIO...")
        sensor.cleanup()
        print("✓ Done\n")


if __name__ == "__main__":
    main()