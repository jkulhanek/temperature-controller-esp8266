#ifndef _settings_h
#define _settings_h
#include <time.h>

typedef struct {
    float temperature;
    time_t start;
    unsigned long duration;
    bool isSet;
} temporaryTemperature_t;

void saveTemporaryTemperature();
temporaryTemperature_t * getTemporaryTemperature();


typedef struct {
    temporaryTemperature_t temporaryTemperature;
    int currentPlanId;
    bool isOn;
    unsigned char currentPlan[24*7];
} settings_t;

bool saveSettings();
settings_t * getSettings();
bool initializeSettings();

#endif