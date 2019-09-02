#ifndef _common_h
#define _common_h
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
} view_t;


bool parseDateTime(const char * text, time_t * time);

void formatDateTime(const time_t * time, char * text);


#endif
