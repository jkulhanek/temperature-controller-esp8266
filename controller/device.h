#include <Arduino.h>
#include <ESP8266WiFi.h>
#include <time.h>
#include <FS.h>
#include <Timezone.h>

#include "common.h"
#include "display.h"
#include "thermostat.h"
#include "server.h"
#include "analytics.h"
#include "settings.h"


const char* ssid = STASSID;
const char* password = STAPSK;
const char* emptyTemperature = "--.-";
Analytics analytics;

enum DeviceStateName {
    started, booting, running, critical_error
};

struct DeviceState {
    DeviceStateName name;
    bool has_error;
    bool has_time;
    bool is_connected;
};


bool hasTime() {
    if(!time(nullptr))
        return false; 
    time_t timer;
    time(&timer);
    if(timer < 3600 * 24 * 356) {
        return false;
    }
    return true;
}


struct PeriodicTaskState {
    unsigned long interval;
    unsigned long lastUpdate;

    bool run(unsigned long millis, bool force = false) {
        if(force || millis >= lastUpdate + interval) {
            lastUpdate = millis;
            return true;
        }

        return false;
    }

    PeriodicTaskState(unsigned long interval) : interval(interval), lastUpdate(0) {}
};

struct SystemTaskState {
    unsigned long interval;
    unsigned long trialDelay;
    unsigned int maxTrials;
    unsigned int currentTrials;
    unsigned long lastUpdate;

    bool run(unsigned long millis, bool force = false) {
        if(force || millis >= lastUpdate + interval) {
            lastUpdate = millis;
            return true;
        }

        if(currentTrials > 0 && currentTrials < maxTrials && millis >= lastUpdate + trialDelay) {
            lastUpdate = millis;
            return true;
        }

        return false;

    }

    void notify(bool success) {
        if(success)
            currentTrials = 0;
        else
            currentTrials++;
    }

    SystemTaskState(unsigned long interval, unsigned long taskDelay, unsigned int maxTrials) : interval(interval), lastUpdate(0), trialDelay(taskDelay), maxTrials(maxTrials), currentTrials(0) {}
};


void invalidateHeatingState() {
    analytics.invalidateHeatingState();
}


class Device {
    public:
        DeviceState state { .name = DeviceStateName::started, .has_error = false, .has_time = false, .is_connected = false };
        void update();
        Device(): displayUpdateTask(1000), connectingTask(1 * 60 * 1000, 1000, 10), timeSynchronizingTask(5 * 60 * 1000, 1000, 10) {}

    private:
        SystemTaskState connectingTask;
        SystemTaskState timeSynchronizingTask;
        PeriodicTaskState displayUpdateTask;
        view_t view;

        void render_display() {
            time_t timer = current_time(nullptr);
            settings_t * settings = getSettings();
            strftime(view.time, sizeof(view.time), "%H:%M:%S", localtime(&timer));
            view.is_on = settings->isOn;
            view.is_connected = state.is_connected;
            float temp;
            if(thermostat.getUserTemperature(&temp))
                dtostrf(temp, 4, 1, view.thermostat_temperature);
            else
                memcpy(view.thermostat_temperature, emptyTemperature, sizeof(emptyTemperature));

            if(thermostat.getCurrentTemperature(&temp))        
                dtostrf(temp, 4, 1, view.temperature);
            else
                memcpy(view.temperature, emptyTemperature, sizeof(emptyTemperature));
    
            view.is_heating = thermostat.getIsHeating();
            render(&view);
        }

        bool connect() {
            // Connect to wifi
            auto status = WiFi.status();
            state.is_connected = status == WL_CONNECTED;
            return state.is_connected;
        }

        bool synchronize_time() {
            if(!state.is_connected)
                return false;
            
            // Download time
            return hasTime();
        }

        void boot() {
            state.name = DeviceStateName::booting;
            thermostat.bindOutput(); 
            Serial.begin(115200);
            Serial.setDebugOutput(true);

            initialize_display();
            print_loading_status("loading");

            if(!SPIFFS.begin()) {
                print_error("file service could not be initialized");
                return;
            }

            if(!initializeSettings()) {
                print_error("settings could not be initialized");
                return;
            }

            // Wifi
            auto mill = millis();
            print_loading_status("connecting");
            WiFi.mode(WIFI_STA);
            WiFi.begin(ssid, password);
            unsigned long millis = 0;
            for(int i = 0; i < connectingTask.maxTrials && connectingTask.run(mill, true); ++i) {
                bool status = connect();
                connectingTask.notify(status);
                if(!status) {
                    delay(connectingTask.trialDelay);
                } else {
                    break;
                }
            }

            print_loading_status("synchronizing time");
            configTime(0, 0, "pool.ntp.org", "time.nist.gov");
            for(int i = 0; i < timeSynchronizingTask.maxTrials && timeSynchronizingTask.run(mill, true); ++i) {
                bool status = synchronize_time();
                connectingTask.notify(status);
                if(!status) {
                    delay(connectingTask.trialDelay);
                } else {
                    break;
                }
            }

            analytics.initialize();
            thermostat.initialize(&invalidateHeatingState);
            state.name = DeviceStateName::running;
            displayUpdateTask.run(mill, true);
            render_display();
        }
};


void Device::update() {
    if(state.name == DeviceStateName::started) {
        boot();
        return;
    } else if(state.name == DeviceStateName::booting) {
        return;
    }

    auto mill = millis();
    if(connectingTask.run(mill)) {
        bool status = connect();
        connectingTask.notify(status);
    }

    if(timeSynchronizingTask.run(mill)) {
        bool status = synchronize_time();
        connectingTask.notify(status);
    }

    if(displayUpdateTask.run(mill)) {
        render_display();
    }

    thermostat.update(mill);
    analytics.update(mill);
    server.handleClient();
    MDNS.update();
}
