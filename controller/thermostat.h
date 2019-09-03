#ifndef _thermostat_h_
#define _thermostat_h_
#include <Arduino.h>
#include "analytics.h"
#include "settings.h"
#include "temperature.h"
#define UPDATE_INTERVAL 5000
#define CHANGE_INTERVAL 15 * 60 * 1000 // Changes after 15 minutes

class Thermostat {

    public:
    Thermostat() : lastUpdate(0), lastChange(0), isOn(false), isHeating(false), pin(0) {};
    void update(unsigned long millis);
    void initialize(uint8_t pin) {
        this->pin = pin;
        pinMode(this->pin, OUTPUT);
    }

    private:
    unsigned long lastUpdate;
    unsigned long lastChange;
    bool isOn;
    bool isHeating;
    uint8_t pin;
};

void Thermostat::update(unsigned long millis) {
    if(millis - this->lastUpdate <= UPDATE_INTERVAL) return;

    // Check if the termostat is on or not
    bool settingsOn = getSettings()->isOn;
    if(this->isOn != settingsOn) {
        this->isOn = settingsOn;
        this->lastChange = 0;
    }

    // Disable fast thermostat changes when approaching target temperature
    if(millis - this->lastChange <= CHANGE_INTERVAL && this->lastChange != 0) return;

    bool heating = this->isOn && currentTemperature < currentUserTemperature;
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

Thermostat thermostat;
#endif