#include "settings.h"
#include <time.h>

bool validateTemporaryTemperature(const time_t * time) {
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

float decompressTemperature(unsigned char tmp) {
    return tmp / 2.0;
}

unsigned char compressTemperature(float tmp) {
    return (unsigned char)(tmp * 2);
}

float computeCurrentUserTemperature(const time_t * now) {
    auto settings = getSettings();
    if(validateTemporaryTemperature(now)) {
        return settings->temporaryTemperature.temperature;
    }

    auto localnow = localtime(now);
    return decompressTemperature(settings->currentPlan[localnow->tm_wday * 24 + localnow->tm_hour]);
}

float currentUserTemperature = -1;
void invalidateCurrentUserTemperature() {
    time_t now;
    time(&now);
    currentUserTemperature = computeCurrentUserTemperature(&now);
}

float currentTemperature = 13.3;
void invalidateCurrentTemperature() {
}
