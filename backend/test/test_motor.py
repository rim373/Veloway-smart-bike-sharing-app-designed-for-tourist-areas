import RPi.GPIO as GPIO
import time

MOTOR_PIN = 18

GPIO.setmode(GPIO.BCM)
GPIO.setup(MOTOR_PIN, GPIO.OUT)

pwm = GPIO.PWM(MOTOR_PIN, 50)
pwm.start(0)

try:
    print("Testing motor...")
    
    # Test lock position
    print("Moving to LOCK position (90°)...")
    pwm.ChangeDutyCycle(7.5)
    time.sleep(2)
    pwm.ChangeDutyCycle(0)
    time.sleep(1)
    
    # Test unlock position
    print("Moving to UNLOCK position (0°)...")
    pwm.ChangeDutyCycle(2.5)
    time.sleep(2)
    pwm.ChangeDutyCycle(0)
    
    print("Test complete!")
    
except KeyboardInterrupt:
    print("\nStopped by user")
finally:
    pwm.stop()
    GPIO.cleanup()