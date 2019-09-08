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

class Thermostat {
    public:
    Thermostat() : lastUpdate(0), lastChange(0), isOn(false), isHeating(false), hasCurrentTemperature(false), hasUserTemperature(false), wire(THERMOMETER_WIRE) {
        dallasTemperature.setOneWire(&this->wire);
    };

    void update(unsigned long millis);
    bool initialize() {
        pinMode(THERMOSTAT_PIN, OUTPUT);
        this->dallasTemperature.begin();
        if(!this->dallasTemperature.getAddress(&this->address, 0)) {
            logging::logError("Cannot initialize dallas temperature because no sensor was found on address 0");
            return false;
        }

        this->dallasTemperature.setResolution(&this->address, 12);
        this->dallasTemperature.requestTemperaturesByAddress(&this->address);
        return true;
    }

    bool getUserTemperature(float * temp) const {
        *temp = this->_currentUserTemperature;
        return this->hasUserTemperature;
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
    float _currentTemperature;
    float _currentUserTemperature;
    uint8_t pin;
    bool hasUserTemperature;
    bool hasCurrentTemperature;
    bool isOn;
    bool isHeating;

    void updateTemperature(unsigned long millis);
    void updateHeatingState(unsigned long millis);
    float computeCurrentUserTemperature(const time_t * now);
    OneWire wire;
    DallasTemperature dallasTemperature;
    uint8_t address;
    
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
    this->_currentTemperature = this->dallasTemperature.getTempC(&this->address);
    this->dallasTemperature.requestTemperaturesByAddress(&this->address);
    this->hasCurrentTemperature = true;

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
    if(heating != this->isHeating) {
        this->isHeating = heating;
        digitalWrite(this->pin, HIGH);
        if(heating) {
            logHeatingStarted();
        }
        else {
            logHeatingFinished();
        }
    }
}

void Thermostat::update(unsigned long millis) {
    if(millis <= this->lastUpdate + UPDATE_INTERVAL) return;
    this->updateTemperature(millis);
    this->updateHeatingState(millis);
}

Thermostat thermostat;
#endif