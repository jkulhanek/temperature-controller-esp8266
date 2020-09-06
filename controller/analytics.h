#ifndef _analytics_h_
#define _analytics_h_

#include <time.h>
#include <FS.h>
#include "common.h" 
#include "logging.h"

#define LOG_INTERVAL 15 * 60 * 1000

class Analytics {
    public:
        Analytics() { 
            this->lastUpdate = 0;
            this->lastDate = 0;
        }
        void update(const unsigned int & millis);
        void initialize();
        void invalidateHeatingState();

    private:
        unsigned int lastUpdate;
        unsigned int lastDate;
        void logDate(const time_t & time, bool isStart);
        void logHeatingStatus(const time_t & timer, bool isHeating);
        void logTemperature(const time_t & timer); 
        
};

void Analytics::initialize() {
    time_t timer;
    time(&timer);
    this->logDate(timer, true);

    // logging
    this->logHeatingStatus(timer, false);
    this->logTemperature(timer);
}

void Analytics::logDate(const time_t & timer, bool start) {
    uint64_t day = timer / (60*60*24);
    String message = "day: ";
    message += (int)day;
    if(this->lastDate == day && !start) { 
        return;
    }
    this->lastDate = day;
    char timeStr[DATETIME_LENGTH + 2];
    timeStr[0] = start? 's':'d';
    timeStr[sizeof(timeStr) - 1] = '\n';
    strftime(((char*)timeStr) + 1, sizeof(timeStr), "%FT%TZ", gmtime(&timer));

    File file = SPIFFS.open("/data/history.log", "a+");
    if(!file) {
        logging::logError("Failed to open analytics file");
        file.close();
        return;
    }

    if(file.write(timeStr, sizeof(timeStr)) != sizeof(timeStr)) {
        logging::logError("Failed to write analytics file");
        file.close();
        return;
    } 
    file.flush();
    file.close();
}

void Analytics::logTemperature(const time_t & timer) { 
    char tempStr[1 + 5 + 5 + 5 + 1];
    tempStr[0] = 't';

    // Write date
    strftime(((char*)tempStr) + 1, 6, "%H:%M", gmtime(&timer));

    float temp;
    if(thermostat.getCurrentTemperature(&temp)) {
        dtostrf(temp, 5, 2, tempStr + 6);
    } else {
        char empty[] = "--.--";
        memcpy(tempStr + 6, empty, sizeof(empty));
    }
    if(thermostat.getUserTemperature(&temp)) {
        dtostrf(temp, 5, 2, tempStr + 11);
    }
    else {
        char empty[] = "--.--";
        memcpy(tempStr + 11, empty, sizeof(empty));
    }
    
    tempStr[sizeof(tempStr) - 1] = '\n'; 

    File file = SPIFFS.open("/data/history.log", "a+");
    if(!file) {
        logging::logError("Failed to open analytics file");
        file.close();
        return;
    }
    
    if(file.write(tempStr, sizeof(tempStr)) != sizeof(tempStr)) {
        logging::logError("Failed to write analytics file");
        file.close();
        return;
    } 

    file.flush();
    file.close();
}

void Analytics::logHeatingStatus(const time_t & timer, bool on) {
    char tempStr[1 + 5 + 1 + 1];
    tempStr[0] = 't';

    // Write date
    strftime(((char*)tempStr) + 1, 6, "%H:%M", gmtime(&timer));
    tempStr[6] = on?'o':'f';
    tempStr[sizeof(tempStr) - 1] = '\n'; 

    File file = SPIFFS.open("/data/history.log", "a+");
    if(!file) {
        logging::logError("Failed to open analytics file");
        file.close();
        return;
    }
    
    if(file.write(tempStr, sizeof(tempStr)) != sizeof(tempStr)) {
        logging::logError("Failed to write analytics file");
        file.close();
        return;
    } 

    file.flush();
    file.close();
}


void Analytics::update(const unsigned int & millis) {
    if(millis <= this->lastUpdate + LOG_INTERVAL) {
        return;
    }
    this->lastUpdate = millis;
    time_t timer;
    time(&timer);
    this->logDate(timer, false);
    this->logTemperature(timer); 
}

void Analytics::invalidateHeatingState() {
    time_t timer;
    time(&timer);
    this->logDate(timer, false);
    this->logTemperature(timer); 
    this->logHeatingStatus(timer, thermostat.isHeating); 
}
#endif
