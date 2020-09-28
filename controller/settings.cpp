#include "settings.h"
#include "common.h"
#include <Arduino.h>
#include <ArduinoJson.h>
#include <time.h>
#include <FS.h>

settings_t settings;

void createDefaultConfiguration() {
    settings.currentPlanId = -1;
    for(uint16_t i = 0; i < 2 * 24 * 7; ++i) {
        settings.currentPlan[i] = 0;
    }

    settings.temporaryTemperature.isSet = false;
    settings.isOn = false;
}

bool readSettings() {
    File file = SPIFFS.open("/data/config.json", "r");
    if(!file) {
        // No configuration
        // Create default
        createDefaultConfiguration();
        return saveSettings();
    }

    DynamicJsonDocument doc(8192 + 4096);
    auto err = deserializeJson(doc, file);
    if(err) {
        Serial.println("Failed to parse json settings");
        return false;
    }

    auto root = doc.as<JsonObject>();
    settings.currentPlanId = root["currentPlanId"];

    auto cPlan = settings.currentPlan;
    JsonArray arr = root["currentPlan"];
    for(JsonVariant iter : arr) {
        *cPlan = (unsigned char)iter.as<int>();
        ++cPlan;
    }

    settings.currentPlanId = root["currentPlanId"];
    settings.isOn = root["isOn"];
    settings.temporaryTemperature.isSet = root.containsKey("temporaryTemperature") && !root["temporaryTemperature"].isNull();
    if(settings.temporaryTemperature.isSet) {
        settings.temporaryTemperature.temperature = root["temporaryTemperature"]["temperature"];
        // TODO: use ISO8601 format
        // const char * startString = root["temporaryTemperature"]["start"];
        // struct tm start_time;
        // if(!strptime(startString, "%FT%T%z",&start_time)) {
        //     Serial.println("Cannot parse datetime");
        //     Serial.println(startString);
        //     return false;
        // }
        unsigned int start = root["temporaryTemperature"]["start"];
        settings.temporaryTemperature.start = start;
        settings.temporaryTemperature.duration = root["temporaryTemperature"]["duration"];
    }

    return true;
}

bool saveSettings() {
    DynamicJsonDocument doc(8192);
    JsonObject root = doc.to<JsonObject>();
    root["currentPlanId"] = settings.currentPlanId;
    root["isOn"] = settings.isOn;
    JsonArray arr = root.createNestedArray("currentPlan");
    for(uint16_t i=0; i < sizeof(settings.currentPlan); ++i) {
        arr.add(settings.currentPlan[i]);
    }

    if(settings.temporaryTemperature.isSet) {
        auto tmp = root.createNestedObject("temporaryTemperature");
        tmp["duration"] = settings.temporaryTemperature.duration;
        tmp["temperature"] = settings.temporaryTemperature.temperature;
        // char timeStr[DATETIME_LENGTH];
        // strftime(timeStr, sizeof(timeStr), "%FT%TZ", gmtime(&settings.temporaryTemperature.start));
        // tmp["start"] = timeStr;
        // TODO: use ISO8601 format
        tmp["start"] = settings.temporaryTemperature.start;
    }   

    File file = SPIFFS.open("/data/config.json", "w+");
    if(!file) {
        Serial.println("Failed to open config file");
        return false;
    } 

    serializeJson(doc, file);
    return true;
}

settings_t * getSettings() {
    return &settings;
}

bool initializeSettings() {
    return readSettings();
}
