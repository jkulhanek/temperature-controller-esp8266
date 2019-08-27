#include <Arduino.h>
#include <ESP8266WiFi.h>
#include <time.h>

#include "common.h"
#include "display.h"
#include "server.h"

int timezone = 3;
int dst = 0;
int oldSec = 10000; // Arbitrary number
bool initialized = false;

const char* ssid = STASSID;
const char* password = STAPSK;

view_t view;

void updateView(view_t *view) {
    time_t now = time(nullptr);
    view->time = ctime(&now);
}

void setup() {
    Serial.begin(115200);
    Serial.setDebugOutput(true);

    // Initialize display
    initializeDisplay();

    // Connect to wifi
    printLoadingStatus("connecting to wifi");
    WiFi.mode(WIFI_STA);
    WiFi.begin(ssid, password);
    Serial.println("\nConnecting to WiFi");
    while (WiFi.status() != WL_CONNECTED) {
        Serial.print(".");
        delay(1000);
    }

    // Starting server
    printLoadingStatus("starting server");
    if(!initializeServer()) {
        printError("server could not be initialized");
        return;
    }

    printLoadingStatus("synchronizing time");

    // Download time
    configTime(3 * 3600, 0, "pool.ntp.org", "time.nist.gov");
    Serial.println("\nWaiting for time");
    while (!time(nullptr)) {
        Serial.print(".");
        delay(1000);
    }
    Serial.println("");
    initialized = true;
}

void loop() {
    if(!initialized) {
        return;
    }
    
    // Render view once every second
    if(oldSec != millis() / 1000) {
        updateView(&view);
        render(&view);
        oldSec = millis() / 1000;
    }

    server.handleClient();
    MDNS.update();
}
