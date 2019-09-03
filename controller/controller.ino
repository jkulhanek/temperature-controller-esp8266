#include <Arduino.h>
#include <ESP8266WiFi.h>
#include <time.h>
#include <FS.h>

#include "common.h"
#include "display.h"
#include "thermostat.h"
#include "server.h"
#include "analytics.h"
#include "settings.h"

int timezone = 3;
int dst = 0;
unsigned int oldSec = 10000; // Arbitrary number
unsigned int oldFullSync = 10000; // Arbitrary number
bool initialized = false;

const char* ssid = STASSID;
const char* password = STAPSK;
const uint8_t thermostat_pin = D5;

view_t view;

void updateView(view_t *view) {
    time_t now = time(nullptr);
    settings_t * settings = getSettings();
    strftime(view->time, sizeof(view->time), "%H:%M:%S", localtime(&now));
    view->is_on = settings->isOn;
    dtostrf(currentUserTemperature, 4, 1, view->thermostat_temperature);
    dtostrf(currentTemperature, 4, 1, view->temperature);
}

void setup() {
    Serial.begin(115200);
    Serial.setDebugOutput(true);

    // Initialize display
    initializeDisplay();
    printLoadingStatus("starting services");

    if(!SPIFFS.begin()) {
        Serial.println("SPIFFS failed");
        printError("file service could not be initialized");
        return;
    }

    if(!initializeSettings()) {
        printError("settings could not be initialized");
        return;
    }

    // Connect to wifi
    printLoadingStatus("connecting to wifi");
    WiFi.mode(WIFI_STA);
    WiFi.begin(ssid, password);
    Serial.println("\nConnecting to WiFi");
    while (WiFi.status() != WL_CONNECTED) {
        Serial.print(".");
        delay(1000);
    }
    view.is_connected = true;

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

    initializeAnalytics();
    thermostat.initialize(thermostat_pin);

    initialized = true;
}

void loop() {
    if(!initialized) {
        return;
    }

    auto mill = millis();

    // Do connection update every minute
    if(oldFullSync != mill / 60 * 1000) {
        // update temperature
        invalidateCurrentUserTemperature();
        invalidateCurrentTemperature();

        // check wifi status
        view.is_connected = WiFi.status() == WL_CONNECTED;
        oldFullSync = mill / 60 * 1000;
    }
    
    // Render view once every second
    if(oldSec != mill / 1000) {
        updateView(&view);
        render(&view);
        oldSec = mill / 1000;
    }

    thermostat.update(mill);
    server.handleClient();
    MDNS.update();
}
