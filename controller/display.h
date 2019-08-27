#ifndef _display_h
#define _display_h
#include <Arduino.h>
#include <SPI.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

#include "common.h"

#define OLED_RESET LED_BUILTIN
#define SCREEN_WIDTH 128 // OLED display width, in pixels
#define SCREEN_HEIGHT 64 // OLED display height, in pixels

Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);

void render(const view_t *view) {
    display.setCursor(0,0);
    display.println(view->time);
    display.display();
    display.clearDisplay();
}

void printLoadingStatus(char * status) {
    display.setCursor(0,0);
    display.println("Loading...");
    display.println(status);
    display.display();
    display.clearDisplay();
}

void printError(char * error) {
    display.setCursor(0,0);
    display.println("Error");
    display.println(error);
    display.display();
    display.clearDisplay();
}


void initializeDisplay() {
    display.begin(SSD1306_SWITCHCAPVCC, 0x3C);
    display.setTextSize(1);
    display.setTextColor(WHITE);
    display.clearDisplay();
}

#endif