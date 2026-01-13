# Veloway-smart-bike-sharing-app-designed-for-tourist-areas
# Smart Bicycle Rental System (Veloway)

## Project Overview
Veloway is an IoT-enabled smart bicycle rental system designed to provide eco-friendly, flexible, and connected mobility solutions for urban commuters, tourists, and students. The system integrates real-time GPS tracking, AI-based damage detection, and a mobile application to optimize the user experience and ensure efficient fleet management.

---

## Features

### User Features
- Account creation, authentication, and profile management
- Linking electronic payment methods (bank card or digital wallet)
- Bicycle rental via QR code scanning
- Real-time trip tracking using GPS
- Photo capture before and after bike use for AI damage verification
- Secure in-app payment with automatic price calculation (time or distance-based)

### Administrative Features
- Monitoring of station status, active trips, and maintenance reports
- Visual analytics for usage, performance, and system health
- Real-time bike and dock availability monitoring via IoT sensors

### IoT & AI Integration
- Raspberry Pi acts as a gateway for IoT devices
- Sensors track bike docking and availability
- Cameras capture bike images for AI-based damage detection
- AI model analyzes images to automatically identify damages

---

## Technology Stack
| Layer           | Technologies                                      |
|-----------------|--------------------------------------------------|
| Backend         | Jakarta EE, REST API, MongoDB                     |
| Frontend        | Next.js (React Framework)
| IoT Layer       | Raspberry Pi, sensors, GPS modules               |
| AI Layer        | PyTorch for image-based damage detection         |
| Middleware      | Apache Kafka for real-time data streaming        |

---

## System Architecture
The system follows a **three-layer architecture**:
1. **Mobile Application** ↔ 2. **Backend Server** ↔ 3. **IoT Layer (Raspberry Pi + Sensors + Cameras)**

---

## Project Deliverables
- Scope Statement Document
- Design Document (architecture diagrams, UML)
- Source Code (backend, mobile app, AI model)
- Demonstration Video (end-to-end workflow)
- Technical Documentation (README and setup guide)

---

## Setup Instructions
1. **Backend Setup**
   - Install Jakarta EE and MongoDB.
   - Configure REST APIs and database connections.
2. **IoT Setup**
   - Connect Raspberry Pi to sensors and GPS modules.
   - Ensure real-time data transmission to the backend server.
3. **Mobile App**
   - Install React Native environment.
   - Build and run the app on Android/iOS.
   - Link user accounts to payment systems.
4. **AI Model**
   - Load PyTorch damage detection model.
   - Connect model to backend to process uploaded images.
5. **Testing**
   - Use the mobile app to scan QR codes, track trips, and verify AI damage detection.

---

## Limitations
- AI model accuracy may vary depending on image quality.
- Hardware costs and maintenance for IoT devices.
- Integration challenges with multiple payment systems.
- Internet dependency for real-time data access.

---

## Contributors
- Project developed by Emna Belguith, Rim Barnat, Molka Sahli, Nour Krichen
- Backend, Mobile, AI, and IoT integration

---

## License
This project is for academic purposes and does not have a commercial license.
