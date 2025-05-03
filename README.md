# FixIT - Predictive Car Maintenance App

An intelligent car maintenance companion that utilizes OBD sensors, AI-powered diagnostics, and personalized maintenance tracking to help car owners maintain their vehicles effectively.

## Table of Contents
- [Features](#features)
- [Architecture](#architecture)
- [Mobile App](#mobile-app)
- [Backend Services](#backend-services)
- [Hardware Integration](#hardware-integration)
- [AI Integration](#ai-integration)
- [Development](#development)

## Features

### Vehicle Management
- Multi-vehicle support with detailed profiles
- Personalized maintenance tracking for each vehicle
- Visual status indicators showing vehicle health at a glance
- Service history logging and reminders

### Diagnostic Capabilities
- Real-time OBD-II sensor data collection
- Bluetooth connectivity to OBD scanners
- Diagnostic trouble code (DTC) interpretation
- Engine temperature monitoring with visual feedback

### AI-Powered Insights
- OpenAI GPT-4.1-nano integration for intelligent diagnostics
- Personalized maintenance recommendations based on vehicle data
- Cost estimates for repairs and services
- Interactive chat for vehicle-specific questions

### User Experience
- Modern, intuitive UI with dark theme
- Real-time status updates and notifications
- Offline functionality for core features
- Responsive design for various device sizes

## Architecture

### Cloud Infrastructure
- AWS Lambda for serverless API endpoints
- DynamoDB for scalable, low-latency data storage
- API Gateway for secure API management
- RESTful API for vehicle and user data management
- PostgreSQL database for structured data storage

### Mobile App
- React Native for cross-platform compatibility
- TypeScript for type safety and code quality
- AsyncStorage for local data persistence
- Bluetooth communication for OBD device integration

### Embedded System
- ESP32 microcontroller for OBD-II data acquisition
- BLE (Bluetooth Low Energy) server for mobile connectivity
- ELM327 interface for vehicle ECU communication
- JSON-formatted data transmission

## Mobile App

### Vehicle Management

#### Car Carousel
- Horizontally scrolling vehicle cards
- Quick access to all registered vehicles
- Visual indicators of vehicle status
- One-tap vehicle selection
- Support for adding, editing, and deleting vehicles

#### Add Car Screen
- **Basic Information**: Year, Make, Model, and Nickname
- **Odometer**: Current Mileage
- **Maintenance History**: Last Oil Change Date
- **Purchase Information**: Purchase Date
- **Key Features**:
  - Make/Model selection with searchable dropdowns
  - Offline support for adding vehicles without connectivity
  - Form validation for data integrity
  - API synchronization when online

### Diagnostic Screens

#### Maintenance Dashboard
- Car status card with at-a-glance health information
- Maintenance due indicators based on service dates
- Engine temperature gauge with color-coded warnings
- Expandable diagnostic categories:
  - Overview of vehicle status
  - Maintenance recommendations
  - Repair suggestions
  - Cost estimates

#### Bluetooth Scanner
- OBD-II device pairing and connection management
- Real-time sensor data acquisition
- Automatic DTC scanning and interpretation
- Background monitoring for critical parameters

#### Service History
- Chronological log of all maintenance services
- Service details including date, type, and notes
- Filtering and sorting capabilities
- Maintenance interval tracking

### AI Integration

#### OpenAI Service
- Dedicated service layer for AI communications
- Intelligent caching to reduce API usage (15-minute cache validity)
- Context-aware prompt construction
- Error handling and fallbacks for offline scenarios

#### AI-Powered Features
- **Diagnostic Analysis**: 
  - Interprets sensor data and DTCs
  - Provides actionable maintenance advice
  - Identifies potential issues before they become serious
  
- **Interactive Chat**:
  - Natural language interface for vehicle questions
  - Vehicle-specific responses based on selected car
  - Practical advice tailored to user's actual maintenance needs
  
- **Maintenance Status Detection**:
  - Analyzes service dates to determine maintenance status
  - Color-coded system (green/yellow/red) for at-a-glance understanding
  - Prioritized recommendations based on urgency

#### Technical Implementation
- Smart prompting system for focused AI responses
- Separate prompting strategies for chat vs. diagnostic sections
- Vehicle context passed to AI for personalized insights
- Maintenance status determination to avoid unnecessary service recommendations

## Backend Services

### RESTful API
- OpenAPI/Swagger documentation for easy integration
- Endpoints for user and vehicle management:
  - Retrieve user's vehicles
  - Add/update/delete vehicle information
  - Store and retrieve maintenance data
- JSON response format for all endpoints
- Health check and diagnostic endpoints

### Database Schema
- User and authentication management
- Vehicle details and maintenance records
- Diagnostic data storage
- Service history tracking

## Hardware Integration

### ESP32 OBD Interface
- WiFi AP mode for device configuration
- Bluetooth Low Energy server for mobile app connectivity
- Multiple characteristic support for different data types
- Large payload handling with chunking mechanism

### Data Collection
- Real-time coolant temperature monitoring
- DTC (Diagnostic Trouble Code) reading
- Check engine light status detection
- VIN (Vehicle Identification Number) retrieval
- JSON-formatted data packaging for mobile consumption

## Development

### Prerequisites
- Node.js and npm
- React Native environment
- Arduino IDE for ESP32 development
- AWS account for backend services
- PostgreSQL database

### Setup
1. Clone the repository
2. Install dependencies: `npm install` in the frontend directory
3. Configure environment variables for OpenAI API key and backend endpoints
4. Flash the ESP32 with the provided Arduino code
5. Start the development server: `npm run start`

### Backend Deployment
- AWS Lambda for serverless functions
- API Gateway for endpoint management
- DynamoDB for data persistence
- PostgreSQL for structured data

## Future Roadmap
- Enhanced predictive maintenance using machine learning
- Integration with service center booking systems
- Expanded support for additional maintenance types
- User feedback mechanism to improve AI responses
- Expanded OBD-II parameter monitoring
