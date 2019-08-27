#ifndef _settings_h
#define _settings_h

typedef struct {
    float temperature;
} settings_t;

void saveSettings();
settings_t * getSettings();

#endif