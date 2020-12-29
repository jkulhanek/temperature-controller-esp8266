#ifndef _display_h
#define _display_h
#include <Arduino.h>
#include <SPI.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <time.h>
#include <Adafruit_SSD1306.h>

#include "common.h"
#include "icons.h"

#define OLED_RESET LED_BUILTIN
#define SCREEN_WIDTH 128 // OLED display width, in pixels
#define SCREEN_HEIGHT 64 // OLED display height, in pixels

Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);

void render(const view_t *view) {
    uint16_t icon_offset = 0;
    if(view->is_connected) {
        display.drawBitmap(icon_offset, 0, icons::wifi, 12, 9, WHITE);
        icon_offset += 12 + 2;
    }

    // Display clock
    display.drawBitmap(67, 0, icons::time, 9, 9, WHITE);
    display.setCursor(67 + 11,1);
    display.setTextSize(1);
    display.print(view->time);

    display.setTextSize(2);

    // Show real temperature
    const uint16_t temperatureOffset = 0;
    display.drawBitmap(temperatureOffset + 4, 28, icons::temperature, 8, 16, WHITE);
    display.setCursor(16+2, 28 + 1);
    display.print(view->temperature);

    // Show thermostat temperature
    if(view->is_on) {
        display.drawBitmap(temperatureOffset + 0, 48, icons::aim, 16, 16, WHITE);
        display.setCursor(16+2, 48 + 1);
        display.print(view->thermostat_temperature);
    }

    if(view->is_heating) {
        display.drawBitmap(85, 30, icons::flame, 32, 32, WHITE);
    }


    display.display();
    display.clearDisplay();
}

void print_loading_status(char * status) {
    display.setCursor(0,0);
    display.println("Loading...");
    display.println(status);
    display.display();
    display.clearDisplay();
}

void print_error(char * error) {
    display.setCursor(0,0);
    display.println("Error");
    display.println(error);
    display.display();
    display.clearDisplay();
}


void initialize_display() {
    display.begin(SSD1306_SWITCHCAPVCC, 0x3C);
    display.setTextSize(1);
    display.setTextColor(WHITE);
    display.clearDisplay();
}

#endif
