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

// IP of ELM327 WiFi dongle
IPAddress server(192, 168, 0, 10);
WiFiClient client;
ELM327 myELM327;

BLEServer* bleServer = nullptr;
BLECharacteristic* dtcCharacteristic = nullptr;

// ========== BLE Setup ========== //
void setupBLE() {
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

void sendDTCDataBLE(const String& dtcData) {
    if (dtcCharacteristic) {
        dtcCharacteristic->setValue(dtcData.c_str());
        dtcCharacteristic->notify();
        Serial.println("DTC Data sent via BLE: " + dtcData);
    }
}

// ========== Coolant Temp Reader ========== //
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

// ========== Setup ========== //
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

// ========== Loop ========== //
void loop() {
    JsonDocument doc;
    JsonArray dtcs = doc["dtcs"].to<JsonArray>();  // no deprecation warning
    bool checkEngineLightOn = false;

    myELM327.currentDTCCodes(true);
    Serial.println("Raw DTC response payload:");
    Serial.println(myELM327.payload);
    Serial.print("codesFound = ");
    Serial.println(myELM327.DTC_Response.codesFound);

    if (myELM327.nb_rx_state == ELM_SUCCESS) {
        for (int i = 0; i < myELM327.DTC_Response.codesFound; i++) {
            String dtc = myELM327.DTC_Response.codes[i];
            Serial.println("Raw DTC: " + dtc);

            // Filter out invalid DTCs
            if (dtc.length() != 5 || !dtc.startsWith("P")) {
                Serial.println("Skipping invalid DTC: " + dtc);
                continue;
            }

            bool valid = true;
            for (int j = 1; j < 5; j++) {
                if (!isHexadecimalDigit(dtc[j])) valid = false;
            }

            if (valid) {
                dtcs.add(dtc);
                Serial.println("Valid DTC added: " + dtc);
                checkEngineLightOn = true;
            } else {
                Serial.println("Rejected due to non-hex characters: " + dtc);
            }
        }
    } else if (myELM327.nb_rx_state != ELM_GETTING_MSG) {
        myELM327.printError();
    }

    // Add coolant temp
    float coolant = getCoolantTemp();
    doc["coolant_temp_c"] = coolant;

    // Add CEL status
    doc["check_engine_light"] = checkEngineLightOn;

    // Send JSON via BLE
    String output;
    serializeJson(doc, output);
    sendDTCDataBLE(output);

    delay(5000);
}
