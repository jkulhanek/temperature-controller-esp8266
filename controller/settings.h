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
    unsigned char currentPlan[2*24*7];
    float temperature_offset;
    float temperature_on_margin;
    float temperature_exponential_weight;
} settings_t;

bool saveSettings();
settings_t * getSettings();
bool initializeSettings();

#endif
