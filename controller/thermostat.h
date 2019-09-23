#ifndef _thermostat_h_
#define _thermostat_h_
#include <Arduino.h>
#include <OneWire.h>
#include <DallasTemperature.h>
#include <time.h>
#include "settings.h"
#include "analytics.h"
#include "logging.h"
#define UPDATE_INTERVAL 5000
#define CHANGE_INTERVAL 15 * 60 * 1000 // Changes after 15 minutes
#define THERMOSTAT_PIN D5
#define THERMOMETER_WIRE D6

OneWire thermostatWire(THERMOMETER_WIRE);
DallasTemperature sensors(&thermostatWire);
uint8_t deviceAddress;

class Thermostat {
    public:
    Thermostat() {
        
    };

    void update(unsigned long millis);
    bool initialize() {
        this->lastUpdate = 0;
        this->lastChange = 0;
        this->isOn = false;
        this->isHeating = false;
        this->hasCurrentTemperature = false;
        this->hasUserTemperature = false;
        this->pin = THERMOSTAT_PIN;
        pinMode(THERMOSTAT_PIN, OUTPUT);
        
        sensors.begin();

        if(!sensors.getAddress(&deviceAddress, 0)) {
            logging::logError("Cannot initialize dallas temperature because no sensor was found on address 0");
            return false;
        }

        Serial.println("found thermostat device");
        sensors.setResolution(&deviceAddress, 12);
        sensors.requestTemperaturesByAddress(&deviceAddress);
        return true;
    }

    bool getUserTemperature(float * temp) const {
        *temp = this->_currentUserTemperature;
        return this->hasUserTemperature;
    }

    bool getIsHeating() const {
        return this->isHeating;
    }

    bool getCurrentTemperature(float * temp) const {
        *temp = this->_currentTemperature;
        return this->hasCurrentTemperature;
    }

    void invalidateCurrentUserTemperature();
    bool validateTemporaryTemperature(const time_t * time);

    private:
    unsigned long lastUpdate;
    unsigned long lastChange;
    unsigned long lastChangeWriteStarted;
    float _currentTemperature;
    float _currentUserTemperature;
    uint8_t pin;
    bool hasUserTemperature;
    bool hasCurrentTemperature;
    bool isOn;
    bool isHeating;
    bool changeWriteStarted;
    bool initialStatusChanged;

    void updateTemperature(unsigned long millis);
    void updateHeatingState(unsigned long millis);
    float computeCurrentUserTemperature(const time_t * now);   
};

bool Thermostat::validateTemporaryTemperature(const time_t * time) {
    auto settings = getSettings();
    if(settings->temporaryTemperature.isSet) {
        if(settings->temporaryTemperature.start + settings->temporaryTemperature.duration < *time) {
            settings->temporaryTemperature.isSet = false;
            return false;
        }
        return true;
    }
    return false;
}

float Thermostat::computeCurrentUserTemperature(const time_t * now) {
    auto settings = getSettings();
    if(validateTemporaryTemperature(now)) {
        return settings->temporaryTemperature.temperature;
    }

    auto localnow = localtime(now);
    return decompressTemperature(settings->currentPlan[localnow->tm_wday * 24 + localnow->tm_hour]);
}

void Thermostat::invalidateCurrentUserTemperature() {
    time_t now;
    time(&now);
    this->_currentUserTemperature = computeCurrentUserTemperature(&now);
}

void Thermostat::updateTemperature(unsigned long millis) {
    this->_currentTemperature = sensors.getTempC(&deviceAddress);
    sensors.requestTemperaturesByAddress(&deviceAddress);
    this->hasCurrentTemperature = true;
    Serial.print("Current temperature is: ");
    Serial.print(this->_currentTemperature);
    Serial.println("°C");

    this->invalidateCurrentUserTemperature();
    this->hasUserTemperature = true;
}

void Thermostat::updateHeatingState(unsigned long millis) {
    // Check if the termostat is on or not
    bool settingsOn = getSettings()->isOn;
    if(this->isOn != settingsOn) {
        this->isOn = settingsOn;
        this->lastChange = 0;
    }

    // Disable fast thermostat changes when approaching target temperature
    if(millis <= this->lastChange + CHANGE_INTERVAL && this->lastChange != 0) return;
    if(!this->hasCurrentTemperature || !this->hasUserTemperature) return;

    bool heating = this->isOn && this->_currentTemperature < this->_currentUserTemperature;
    if(!initialStatusChanged || heating != this->isHeating) {
        this->lastChange = millis;
        this->isHeating = heating;
        initialStatusChanged = true;

        // Do physical switch
        digitalWrite(D5, heating ? HIGH : LOW);
        digitalWrite(D4, heating ? LOW : HIGH);
        lastChangeWriteStarted = millis;
        changeWriteStarted = true;

        if(heating) {
            logHeatingStarted();
        }
        else {
            logHeatingFinished();
        }
    }
}

void Thermostat::update(unsigned long millis) {
    if(this->changeWriteStarted && millis >= this->lastChangeWriteStarted + 500) {
        digitalWrite(D4, LOW);
        digitalWrite(D5, LOW);
        this->changeWriteStarted = false;
    }

    if(millis <= this->lastUpdate + UPDATE_INTERVAL) {
        return;
    }
    this->lastUpdate = millis;
    this->updateTemperature(millis);
    this->updateHeatingState(millis);
}

Thermostat thermostat;
#endif
