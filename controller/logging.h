#ifndef _logging_h_
#define _logging_h_
#include <Arduino.h>
#include <FS.h>

namespace logging {
    void logError(char * message) {
        Serial.println(message);
        auto file = SPIFFS.open("/data/log.txt", "a+");
        file.println(message);
        file.flush();
        file.close();
    }
}
#endif