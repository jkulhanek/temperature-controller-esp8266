#include "common.h"
#include <stdio.h>
#include <time.h>
#include <Timezone.h>

bool parseDateTime(const char * text, time_t * time) {
    int yr;
    struct tm result;
    sscanf(text, "%4d-%2d-%2dT%2d:%2d:%2dZ", &yr, &result.tm_mon, &result.tm_mday, &result.tm_hour, &result.tm_min, &result.tm_sec);
    result.tm_year = yr - 1970;
    *time = mktime(&result);
    return true;
}

void formatDateTime(const time_t * time, char * text) {
    strftime(text, sizeof(text), "%FT%TZ", gmtime(time));
}

float decompressTemperature(unsigned char tmp) {
    return tmp / 2.0;
}

unsigned char compressTemperature(float tmp) {
    return (unsigned char)(tmp * 2);
}

TimeChangeRule _PRGS_rule = {"CEST", Last, Sun, Mar, 2, 120};
TimeChangeRule _PRG_rule = {"CET", Last, Sun, Oct, 3, 60};
Timezone _PRG(_PRGS_rule, _PRG_rule);

time_t current_time(time_t * timer) {
    if(timer != nullptr) {
        time(timer);
        *timer = _PRG.toLocal(*timer);
        return *timer;
    } else {
        time_t tm = time(nullptr);
        tm = _PRG.toLocal(tm);
        return tm;
    }
}
