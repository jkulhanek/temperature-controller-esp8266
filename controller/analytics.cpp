#include "analytics.h"
#include <time.h>
#include <FS.h>

#include "logging.h"

#define UPDATE_INTERVAL 60*60

time_t heatingStartedTime;
void logHeatingStarted() {
    time(&heatingStartedTime);
}

bool initializeLogFile(fs::File * file, const time_t * timer) {
    uint64_t day = *timer / (60*60*24);
    if(file->write((uint8_t*)&day, sizeof(day)) != sizeof(day)) {
        return false;
    }

    return true;
}

bool collectDayTotal(fs::File *tempFile, uint64_t day) {
    uint32_t total = 0;
    tempFile->seek(sizeof(day));
    while(tempFile->available()) {
        uint32_t record;
        if(tempFile->read((uint8_t*)&record, sizeof(record)) != sizeof(record)) {
            return false;
        }
        total += record;
    }
    {
        auto file = SPIFFS.open("/data/analytics.dat", "a+");
        if(file.write((uint8_t*)&day, sizeof(day)) != sizeof(day) ||
        file.write((uint8_t*)&total, sizeof(total)) != sizeof(total)) {
            file.close();
            return false;
        }
        file.flush();
        file.close();
    }
    return true;
}

void logHeatingTime(const time_t * timer, uint32_t duration) {
    fs::File file;
    if((file = SPIFFS.open("/data/atmp.dat", "r+"))) {
        uint64_t day = *timer / (60*60*24);
        uint64_t lastDay;
        if(file.readBytes((char *)&lastDay, sizeof(lastDay)) != sizeof(lastDay)) {
            logging::logError("Failed to read analytics log /data/atmp.dat");
            file.close();
            return;
        }

        if(lastDay != day) {
            // Collect day analytics
            if(!collectDayTotal(&file, day)) {
                logging::logError("Failed to collect day total");
                file.close();
                return;
            }

            file.seek(0);
            file.truncate(0);
            if(initializeLogFile(&file, timer)) return;
        } else {
            file.seek(file.size());
        }       
    } else {
        file = SPIFFS.open("/data/atmp.dat", "w+");
        if(!initializeLogFile(&file, timer)) {
            logging::logError("Failed to initialize analytics file");
            file.close();
            return;
        }
    }

    // Write record
    file.write((uint8_t*)&duration, sizeof(duration));
    file.flush();
    file.close();
}

void logHeatingFinished() {
    time_t timer;
    time(&timer);
    uint32_t duration = timer -  heatingStartedTime;
    logHeatingTime(&timer, duration);
}

bool initializeAnalytics() {

}
