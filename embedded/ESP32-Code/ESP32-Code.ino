#include <WiFi.h>
#include "ELMduino.h"
#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>


void sendDTCDataBLE(const String& dtcData);

// WiFi credentials
const char* ssid = "WiFi_OBDII";   // Adjust as needed
//const char* password = "your-password";  // If your ELM327 is password-protected

// BLE UUIDs
#define SERVICE_UUID           "12345678-1234-1234-1234-123456789abc"
#define CHARACTERISTIC_UUID    "87654321-4321-4321-4321-cba987654321"

// IP Address & Port of the ELM327 dongle
IPAddress server(192, 168, 0, 10);
WiFiClient client;
ELM327 myELM327;

BLEServer* bleServer = nullptr;
BLECharacteristic* dtcCharacteristic = nullptr;

// Helper to send text data over BLE
void sendDTCDataBLE(const String& dtcData) {
    if (dtcCharacteristic) {
        dtcCharacteristic->setValue(dtcData.c_str());
        dtcCharacteristic->notify();
        Serial.println("DTC Data sent via BLE: " + dtcData);
    }
}

void readCoolantTempManual()
{
    // 1) Send "0105" command in blocking mode:
    //    This ensures we don't return until the ELM327 responds or times out.
    int8_t status = myELM327.sendCommand_Blocking("0105");
    if (status == ELM_SUCCESS)
    {
        // 2) Grab the raw payload string that ELMduino saved
        String raw = myELM327.payload; 
        // e.g. "41056E" or "410545"

        Serial.print("Raw payload for coolant: ");
        Serial.println(raw);

        // 3) Look for "4105"
        int pos = raw.indexOf("4105");
        if (pos >= 0 && (pos + 6) <= (int)raw.length())
        {
            // The byte after "4105" is the temperature in hex
            // e.g. if raw is "41056E", then raw.substring(pos+4, pos+6) is "6E"
            String tempHex = raw.substring(pos + 4, pos + 6);

            // Convert that hex to decimal
            int rawVal = strtol(tempHex.c_str(), NULL, 16); // base-16 parse
            // Subtract 40 to get °C
            float cTemp = rawVal - 40.0;

            Serial.print("Coolant Temp (Manual Parse): ");
            Serial.print(cTemp);
            Serial.println(" °C");

            // If you want to BLE-send:
            String msg = "Coolant (manual) = " + String(cTemp) + " °C";
            sendDTCDataBLE(msg);
        }
        else
        {
            Serial.println("Unable to find '4105' or the payload was too short.");
        }
    }
    else
    {
        // If the sendCommand_Blocking call didn’t succeed, print the error
        myELM327.printError();
    }
}



// State machine for DTC handling
typedef enum
{   
    MILSTATUS,
    DTCCODES
} dtc_states;

dtc_states dtc_state = MILSTATUS;
uint8_t numCodes = 0;
uint8_t milStatus = 0;


void setup()
{
    Serial.begin(115200);

    // Connecting to WiFi
    Serial.print("Connecting to ");
    Serial.println(ssid);
    
    WiFi.mode(WIFI_AP);
    WiFi.begin(ssid);
    // WiFi.begin(ssid, password); // Uncomment if password-protected

    while (WiFi.status() != WL_CONNECTED)
    {
        delay(500);
        Serial.print(".");
    }

    Serial.println("\nConnected to WiFi");
    Serial.print("IP address: ");
    Serial.println(WiFi.localIP());

    // Connect to ELM327
    if (!client.connect(server, 35000))
    {
        Serial.println("Connection to ELM327 failed.");
        while (1); // Stop if connection fails
    }

    if (!myELM327.begin(client, true, 2000))
    {
        Serial.println("ELM327 Couldn't connect to ECU.");
        while (1); // Stop if init fails
    }

    Serial.println("Connected to ELM327");
    
    setupBLE(); // Initialize BLE service

    Serial.println("Performing DTC check in blocking mode...");
    
    // Initial DTC read (blocking by default)
    myELM327.currentDTCCodes(); 
    if (myELM327.nb_rx_state == ELM_SUCCESS)
    {
        Serial.println("Current DTCs found: ");
        
        for (int i = 0; i < myELM327.DTC_Response.codesFound; i++)
        {
            String dtc = myELM327.DTC_Response.codes[i];
            Serial.println(dtc);
            sendDTCDataBLE(dtc);
        }
        delay(10000); 
    }
    else if (myELM327.nb_rx_state != ELM_GETTING_MSG)
    {
        myELM327.printError();
    }
}

void loop()
{
    switch (dtc_state)
    {
    case MILSTATUS:
        // Blocking read of monitor status (PID 0x01)
        myELM327.monitorStatus();
        if (myELM327.nb_rx_state == ELM_SUCCESS)
        {
            // byte_2 has MIL bit (0x80) and # stored codes
            milStatus = (myELM327.responseByte_2 & 0x80);
            numCodes  = (myELM327.responseByte_2 - 0x80);

            String milStatusMessage = String("MIL is: ") + (milStatus ? "ON" : "OFF");
            Serial.println(milStatusMessage);
            sendDTCDataBLE(milStatusMessage);

            String codeMessage = String("Number of codes present: ") + numCodes;
            Serial.println(codeMessage);
            sendDTCDataBLE(codeMessage);

            dtc_state = DTCCODES;
        }
        else if (myELM327.nb_rx_state != ELM_GETTING_MSG)
        {
            myELM327.printError();
            dtc_state = DTCCODES;
        }
        break;

   case DTCCODES:
    // If codes exist, retrieve them (blocking or non-blocking)
    myELM327.currentDTCCodes(true); // simpler to do blocking here

    if (myELM327.nb_rx_state == ELM_SUCCESS)
    {
        Serial.println("Current DTCs found: ");
        for (int i = 0; i < myELM327.DTC_Response.codesFound; i++)
        {
            String dtc = myELM327.DTC_Response.codes[i];
            Serial.println(dtc);
            sendDTCDataBLE(dtc);
        }
    }
    else if (myELM327.nb_rx_state != ELM_GETTING_MSG)
    {
        myELM327.printError();
    }

    // Now manually fetch coolant
    readCoolantTempManual();

    // Delay so we don’t spam requests
    delay(5000);

    dtc_state = MILSTATUS;
    break;


    default:
        break;
    }
}

void setupBLE()
{
    BLEDevice::init("ESP32-DTC");
    bleServer = BLEDevice::createServer();

    BLEService* service = bleServer->createService(SERVICE_UUID);

    dtcCharacteristic = service->createCharacteristic(
        CHARACTERISTIC_UUID,
        BLECharacteristic::PROPERTY_READ | BLECharacteristic::PROPERTY_NOTIFY
    );

    dtcCharacteristic->addDescriptor(new BLE2902());
    service->start();

    bleServer->getAdvertising()->start();
    Serial.println("BLE service started");
}
