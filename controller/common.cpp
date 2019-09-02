#include "common.h"
#include <stdio.h>
#include <time.h>

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