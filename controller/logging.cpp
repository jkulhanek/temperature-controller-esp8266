#include "logging.h"
#include <Arduino.h>
#include <FS.h>

namespace logging {
    void logError(const char * message) {
        Serial.println(message);
        auto file = SPIFFS.open("/data/0.log", "a+");
        file.println(message);
        file.flush();
        file.close();
    }
}
