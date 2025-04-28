# FixIT - Predictive Car Maintenance App
Predictive car maintenance utilizing OBD sensors and AI


### Cloud Stuff

##### Terraform Directories

### Mobile App Features

#### Add Car Screen
The Add Car screen allows users to add their vehicles with detailed information:

- **Basic Information**: Year, Make, Model, and Nickname
- **Odometer**: Current Mileage
- **Maintenance History**: Last Oil Change Date
- **Purchase Information**: Purchase Date

##### Key Features
- **Make/Model Selection**: Uses a modal-based dropdown picker for better mobile UX
- **Searchable Dropdowns**: Quick search through car makes and models
- **Offline Support**: Can save car data locally when no internet connection is available
- **Form Validation**: Ensures required fields are completed
- **API Integration**: Syncs with backend when online

##### Technical Implementation
- **Network Handling**: Uses NetInfo to detect connection status
- **Request Timeout**: Implements timeout for API requests to prevent indefinite loading
- **Error Handling**: Provides user-friendly messages for different error scenarios
- **TypeScript**: Properly typed for better maintainability

##### Device Compatibility
- Works on both iOS and Android platforms
- Supports various screen sizes
- Optimized for touch interactions
