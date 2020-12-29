#include <Arduino.h>
#include "device.h"


Device device;

void setup() {
    device.update();
}

void loop() {
    device.update();
}
