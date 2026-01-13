Place the CA certificate here so the Java backend can trust the MQTT broker.

Expected filename: ca.crt

Steps to copy from Raspberry Pi (example):

1. Using SCP from PowerShell (replace <PI_USER> and <PI_IP>):
   scp <PI_USER>@<PI_IP>:/home/<PI_USER>/veloway-station/certs/ca.crt middleware/src/main/resources/certs/ca.crt

2. Or use WinSCP / FileZilla to upload `/home/<pi_user>/veloway-station/certs/ca.crt` into this folder.

3. Verify file exists:
   dir middleware\src\main\resources\certs\ca.crt

4. Build the backend to include the cert on the classpath:
   mvn -f middleware/pom.xml clean package

Notes:
- `mqtt.ca.cert.path` in `application.properties` defaults to `certs/ca.crt` (classpath). The file must be at `src/main/resources/certs/ca.crt` when the app runs.
- If you prefer to keep certs out of source control, copy the cert to the server filesystem and set `mqtt.ca.cert.path` to an absolute path in `application.properties`.