#ifndef _common_h_
#define _common_h_
#define DATETIME_LENGTH sizeof("2011-10-08T07:07:09Z")
#define STASSID "Kulhankovi"
#define STAPSK  "highwaytohell"
#include <time.h>

typedef struct {
    char time[9];
    char thermostat_temperature[5];
    char temperature[5];
    bool is_connected;
    bool is_on;
    bool is_heating;
} view_t;


bool parseDateTime(const char * text, time_t * time);

void formatDateTime(const time_t * time, char * text);

float decompressTemperature(unsigned char tmp);
unsigned char compressTemperature(float tmp);


#endif
