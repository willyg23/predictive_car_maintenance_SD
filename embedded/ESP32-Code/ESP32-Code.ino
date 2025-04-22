#include <WiFi.h>
#include "ELMduino.h"
#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>
#include <ArduinoJson.h>

// WiFi credentials
const char* ssid = "WiFi_OBDII";

// BLE UUIDs
#define SERVICE_UUID           "12345678-1234-1234-1234-123456789abc"
#define CHARACTERISTIC_UUID    "87654321-4321-4321-4321-cba987654321"

// IP address of ELM327 dongle
IPAddress server(192, 168, 0, 10);
WiFiClient client;
ELM327 myELM327;

BLEServer* bleServer = nullptr;
BLECharacteristic* dtcCharacteristic = nullptr;
BLECharacteristic* statusCharacteristic = nullptr;

// Default MTU is often around 23 bytes, we'll try to request larger
#define MAX_MTU 512
#define CHUNK_SIZE 20

// ===== BLE Setup =====
void setupBLE() {
    BLEDevice::init("ESP32-DTC");
    
    // Request a larger MTU size
    BLEDevice::setMTU(MAX_MTU);
    
    bleServer = BLEDevice::createServer();

    BLEService* service = bleServer->createService(SERVICE_UUID);

    dtcCharacteristic = service->createCharacteristic(
        CHARACTERISTIC_UUID,
        BLECharacteristic::PROPERTY_READ | BLECharacteristic::PROPERTY_NOTIFY
    );

    dtcCharacteristic->addDescriptor(new BLE2902());
    service->start();
    bleServer->getAdvertising()->start();
    Serial.println("BLE service started with requested MTU size: " + String(MAX_MTU));
}

// ===== Send BLE Packet =====
void sendDTCDataBLE(const String& dtcData) {
    if (dtcCharacteristic) {
        // Get the total length of the data
        size_t dataLen = dtcData.length();
        const char* dataPtr = dtcData.c_str();
        
        // Check if we need to chunk the data
        if (dataLen <= CHUNK_SIZE) {
            // Small enough to send in one packet
            dtcCharacteristic->setValue(dataPtr);
            dtcCharacteristic->notify();
            Serial.println("DTC Data sent via BLE (single packet): " + dtcData);
        } else {
            // Need to chunk the data
            Serial.println("Sending large DTC data in chunks: " + String(dataLen) + " bytes");
            
            // Send in chunks of CHUNK_SIZE bytes
            size_t sentBytes = 0;
            
            while (sentBytes < dataLen) {
                // Calculate remaining bytes and current chunk size
                size_t remainingBytes = dataLen - sentBytes;
                size_t currentChunkSize = (remainingBytes > CHUNK_SIZE) ? CHUNK_SIZE : remainingBytes;
                
                // Create a temporary buffer for this chunk
                char chunk[CHUNK_SIZE + 1];
                memcpy(chunk, dataPtr + sentBytes, currentChunkSize);
                chunk[currentChunkSize] = '\0';  // Null-terminate
                
                // Send the chunk
                dtcCharacteristic->setValue((uint8_t*)chunk, currentChunkSize);
                dtcCharacteristic->notify();
                
                // Wait for the packet to be processed
                delay(20);  // Small delay between chunks
                
                sentBytes += currentChunkSize;
                Serial.println("Sent chunk: " + String(sentBytes) + "/" + String(dataLen));
            }
            
            // Send a special end marker to indicate complete message
            const char* endMarker = "##END##";
            dtcCharacteristic->setValue(endMarker);
            dtcCharacteristic->notify();
            
            Serial.println("Finished sending chunked data");
        }
    }
}

// ===== Coolant Temp Reader =====
float getCoolantTemp() {
    int8_t status = myELM327.sendCommand_Blocking("0105");
    if (status == ELM_SUCCESS) {
        String raw = myELM327.payload;
        int pos = raw.indexOf("4105");
        if (pos >= 0 && (pos + 6) <= (int)raw.length()) {
            String tempHex = raw.substring(pos + 4, pos + 6);
            int rawVal = strtol(tempHex.c_str(), NULL, 16);
            return rawVal - 40.0;
        }
    } else {
        myELM327.printError();
    }
    return -999.0;
}

// ===== Setup =====
void setup() {
    Serial.begin(115200);

    Serial.print("Connecting to ");
    Serial.println(ssid);
    WiFi.mode(WIFI_AP);
    WiFi.begin(ssid);

    while (WiFi.status() != WL_CONNECTED) {
        delay(500);
        Serial.print(".");
    }

    Serial.println("\nConnected to WiFi");
    Serial.print("IP address: ");
    Serial.println(WiFi.localIP());

    if (!client.connect(server, 35000)) {
        Serial.println("Connection to ELM327 failed.");
        while (1);
    }

    if (!myELM327.begin(client, false, 2000)) {
        Serial.println("ELM327 Couldn't connect to ECU.");
        while (1);
    }

    Serial.println("Connected to ELM327");

    setupBLE();
}

// ===== Main Loop =====
void loop() {
    JsonDocument doc;
    JsonArray dtcs = doc["dtcs"].to<JsonArray>();
    bool checkEngineLightOn = false;

    myELM327.currentDTCCodes(true);
    Serial.println(myELM327.payload);
    Serial.print("codesFound = ");
    Serial.println(myELM327.DTC_Response.codesFound);

    if (myELM327.nb_rx_state == ELM_SUCCESS) {
        for (int i = 0; i < myELM327.DTC_Response.codesFound; i++) {
            String dtc = myELM327.DTC_Response.codes[i];

            if (dtc.length() == 5 &&
                (dtc.startsWith("P") || dtc.startsWith("C") || dtc.startsWith("B") || dtc.startsWith("U"))) {
                bool valid = true;
                for (int j = 1; j < 5; j++) {
                    if (!isHexadecimalDigit(dtc[j])) {
                        valid = false;
                        break;
                    }
                }

                if (valid) {
                    dtcs.add(dtc);
                    checkEngineLightOn = true;
                }
            }
        }
    } else if (myELM327.nb_rx_state != ELM_GETTING_MSG) {
        myELM327.printError();
    }

    // Coolant temp
    float coolant = getCoolantTemp();
    doc["coolant_temp_c"] = coolant;

    // MIL light
    doc["check_engine_light"] = checkEngineLightOn;

    // VIN
    char vinBuffer[18] = {0};
    int8_t vinStatus = myELM327.get_vin_blocking(vinBuffer);
    String vin = String(vinBuffer);
    if (vin.length() < 5) vin = "EMULATOR";
    doc["vin"] = vin;

    // Send BLE
    String output;
    serializeJson(doc, output);
    
    // Log the size of the JSON data
    Serial.println("JSON data size: " + String(output.length()) + " bytes");
    Serial.println("JSON data: " + output);
    
    // Send the data with chunking if needed
    sendDTCDataBLE(output);

    delay(5000);
}
