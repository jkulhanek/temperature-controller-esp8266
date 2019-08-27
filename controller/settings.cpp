#include "settings.h"
#include <EEPROM.h>

bool isInitialized = false;
unsigned int address = 0;
settings_t settings;

void readSettings() {
    settings = EEPROM.get(address, settings);
    isInitialized = true;
}

void saveSettings() {
    EEPROM.put(address, &settings);
}

settings_t * getSettings() {
    if(!isInitialized) {
        readSettings();
    }

    return &settings;
}

