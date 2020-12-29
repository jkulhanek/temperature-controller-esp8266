#ifndef thermostat_h_
#define thermostat_h_
#include <Arduino.h>
#include <OneWire.h>
#include <DallasTemperature.h>
#include <time.h>
#include "common.h"
#include "settings.h"
#include "logging.h"
#define UPDATE_INTERVAL 5000
#define CHANGE_INTERVAL 2 * 60 * 1000 // Changes after 2 minutes
#define THERMOMETER_WIRE D6

OneWire thermostatWire(THERMOMETER_WIRE);
DallasTemperature sensors(&thermostatWire);
uint8_t deviceAddress;

class Thermostat {
    public:
    Thermostat() {
    };

    void bindOutput() {
        pinMode(D4, OUTPUT);
        pinMode(D5, OUTPUT);
        digitalWrite(D5, HIGH);
    }

    void update(unsigned long millis);
    bool initialize(void (*invalidateHeatingState)()) {
        this->invalidateHeatingState = invalidateHeatingState;
        this->lastUpdate = 0;
        this->lastChange = 0;
        this->isOn = false;
        this->isHeating = false;
        this->hasCurrentTemperature = false;
        this->hasUserTemperature = false;
        pinMode(D4, OUTPUT);
        pinMode(D5, OUTPUT);
        
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
    void force_update();
    bool isHeating;

    private:
    void (*invalidateHeatingState)();
    unsigned long lastUpdate;
    unsigned long lastChange;
    float _currentTemperature;
    float _currentUserTemperature;
    bool hasUserTemperature;
    bool hasCurrentTemperature;
    bool isOn;
    bool initialStatusChanged;
    bool _forceUpdate;

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
    auto temperature = localnow->tm_wday * 48 + localnow->tm_hour * 2;
    if (localnow->tm_min >= 30) {
        temperature += 1;
    }
    return decompressTemperature(settings->currentPlan[temperature]);
}

void Thermostat::invalidateCurrentUserTemperature() {
    time_t now = current_time(nullptr);
    this->_currentUserTemperature = computeCurrentUserTemperature(&now);
}

void Thermostat::updateTemperature(unsigned long millis) {
    float temp = sensors.getTempC(&deviceAddress);
    sensors.requestTemperaturesByAddress(&deviceAddress);
    if(temp > 50.0f) {
        return;
    }

    temp -= 1.0f; // Calibration
    if(this->hasCurrentTemperature) {
        // Exponential weighting
        float weightRatio = 0.82;
        this->_currentTemperature = weightRatio * this->_currentTemperature + (1 - weightRatio) * temp;
    }
    else
        this->_currentTemperature = temp;
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

    bool heating = false;
    if(this->isOn) {
        heating = this->isHeating;
        if(!this->isHeating && this->_currentTemperature < this->_currentUserTemperature) {
            heating = true;
        }
        if(this->isHeating && this->_currentTemperature >= this->_currentUserTemperature + 1) {
            heating = false;
        }
    }

    if(!initialStatusChanged || heating != this->isHeating) {
        this->lastChange = millis;
        this->isHeating = heating;
        initialStatusChanged = true;

        // Do physical switch
        digitalWrite(D5, heating ? LOW : HIGH);
        this->invalidateHeatingState();
    }
}

void Thermostat::update(unsigned long millis) {
    if(millis <= this->lastUpdate + UPDATE_INTERVAL && !_forceUpdate) {
        return;
    }
    this->lastUpdate = millis;
    this->updateTemperature(millis);
    this->updateHeatingState(millis);
    _forceUpdate = false;
}

void Thermostat::force_update() {
    this->_forceUpdate = true;
}

Thermostat thermostat;
#endif
